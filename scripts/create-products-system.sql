-- ============================================================
-- THE BOX FUNCTIONAL TRAINING
-- LOJA — MIGRATION INCREMENTAL
-- ============================================================
--
-- Supabase Project:
-- wosdrwywlraxbufwxiog
--
-- Esta migration:
--
-- 1. adiciona whatsapp_number a site_settings
-- 2. cria products
-- 3. cria product_variants
-- 4. cria product_images
-- 5. cria constraints e índices
-- 6. cria triggers de updated_at
-- 7. activa RLS
-- 8. permite leitura pública apenas de dados activos
-- 9. garante acesso administrativo via service_role
--
-- Esta migration NÃO:
--
-- - apaga tabelas existentes
-- - recria tabelas existentes do website
-- - altera Galeria
-- - altera Modalidades
-- - altera Instrutores
-- - altera Fundadores
-- - altera Parceiros
-- - altera Users
-- - recria o bucket images
-- - altera policies existentes do Storage
-- - cria carrinho
-- - cria checkout
-- - cria pagamentos
-- - cria encomendas
-- - decrementa stock automaticamente
--
-- Arquitectura:
--
-- Público
--   -> SELECT
--   -> apenas produtos activos
--
-- Admin THE BOX
--   -> Next.js API
--   -> getAuthenticatedAdmin()
--   -> Supabase Service Role
--   -> INSERT / UPDATE / DELETE
--
-- ============================================================


BEGIN;


-- ============================================================
-- 1. PREFLIGHT
-- ============================================================
--
-- A Loja depende de site_settings porque o número
-- de WhatsApp será centralizado nessa tabela.
--
-- Se a tabela não existir, a migration é interrompida.
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.site_settings') IS NULL THEN
    RAISE EXCEPTION
      'Migration da Loja cancelada: public.site_settings não existe.';
  END IF;
END
$$;


-- ============================================================
-- 2. WHATSAPP NUMBER
-- ============================================================
--
-- Formato armazenado:
--
-- 244923525886
--
-- Não utilizar:
--
-- +244 923 525 886
-- 244 923 525 886
-- +244923525886
--
-- O formato apenas com dígitos pode ser utilizado
-- directamente na construção do link wa.me.
-- ============================================================

ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;


-- Preencher o número actual em qualquer registo
-- onde o campo ainda esteja vazio.

UPDATE public.site_settings
SET whatsapp_number = '244923525886'
WHERE whatsapp_number IS NULL
   OR BTRIM(whatsapp_number) = '';


-- Valor padrão para futuros registos.

ALTER TABLE public.site_settings
ALTER COLUMN whatsapp_number
SET DEFAULT '244923525886';


-- Depois de preencher os valores existentes,
-- o campo pode tornar-se obrigatório.

ALTER TABLE public.site_settings
ALTER COLUMN whatsapp_number
SET NOT NULL;


-- Garantir formato internacional apenas com dígitos.
--
-- E.164 permite até 15 dígitos.
-- Aqui aceitamos entre 8 e 15.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'site_settings_whatsapp_number_format_chk'
      AND conrelid = 'public.site_settings'::regclass
  ) THEN
    ALTER TABLE public.site_settings
    ADD CONSTRAINT site_settings_whatsapp_number_format_chk
    CHECK (
      whatsapp_number ~ '^[0-9]{8,15}$'
    );
  END IF;
END
$$;


COMMENT ON COLUMN public.site_settings.whatsapp_number IS
'Número internacional usado pelos CTAs de WhatsApp. Apenas dígitos, sem +, espaços ou hífens.';


-- ============================================================
-- 3. PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  name TEXT NOT NULL
    CHECK (
      BTRIM(name) <> ''
    ),

  slug TEXT NOT NULL
    CHECK (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  reference TEXT NOT NULL
    CHECK (
      BTRIM(reference) <> ''
    ),

  description TEXT NOT NULL
    DEFAULT '',

  category TEXT NOT NULL
    CHECK (
      category IN (
        'vestuario',
        'equipamento',
        'acessorios'
      )
    ),

  price NUMERIC(12, 2) NOT NULL
    CHECK (
      price >= 0
    ),

  currency VARCHAR(3) NOT NULL
    DEFAULT 'AOA'
    CHECK (
      currency ~ '^[A-Z]{3}$'
    ),

  -- Nome do selector de variante mostrado ao visitante.
  --
  -- Exemplos:
  -- Tamanho
  -- Peso
  -- Cor
  --
  -- NULL significa que não existe selector público.
  variant_label TEXT
    CHECK (
      variant_label IS NULL
      OR BTRIM(variant_label) <> ''
    ),

  active BOOLEAN NOT NULL
    DEFAULT TRUE,

  -- Preparado para V1.1:
  -- produtos em destaque na homepage.
  featured BOOLEAN NOT NULL
    DEFAULT FALSE,

  display_order INTEGER NOT NULL
    DEFAULT 0
    CHECK (
      display_order >= 0
    ),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL
    DEFAULT NOW(),

  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    DEFAULT NOW()
);


COMMENT ON TABLE public.products IS
'Produtos disponíveis na Loja THE BOX.';


COMMENT ON COLUMN public.products.id IS
'Identificador UUID único do produto.';


COMMENT ON COLUMN public.products.name IS
'Nome comercial do produto.';


COMMENT ON COLUMN public.products.slug IS
'Slug único utilizado na rota pública /loja/[slug].';


COMMENT ON COLUMN public.products.reference IS
'Referência comercial única, por exemplo TBX-TS-001.';


COMMENT ON COLUMN public.products.description IS
'Descrição pública do produto.';


COMMENT ON COLUMN public.products.category IS
'Categoria da Loja: vestuario, equipamento ou acessorios.';


COMMENT ON COLUMN public.products.price IS
'Preço base do produto.';


COMMENT ON COLUMN public.products.currency IS
'Código ISO da moeda. Por padrão AOA.';


COMMENT ON COLUMN public.products.variant_label IS
'Nome do selector público, como Tamanho, Peso ou Cor. NULL significa sem selector.';


COMMENT ON COLUMN public.products.active IS
'Define se o produto está disponível no catálogo público.';


COMMENT ON COLUMN public.products.featured IS
'Permite destacar o produto futuramente na homepage ou noutras áreas.';


COMMENT ON COLUMN public.products.display_order IS
'Ordem manual de apresentação do produto no catálogo.';


-- ============================================================
-- 4. PRODUCT UNIQUE INDEXES
-- ============================================================
--
-- LOWER() impede duplicações como:
--
-- TBX-TS-001
-- tbx-ts-001
--
-- ou:
--
-- tshirt-classic
-- TSHIRT-CLASSIC
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
idx_products_slug_unique
ON public.products (
  LOWER(slug)
);


CREATE UNIQUE INDEX IF NOT EXISTS
idx_products_reference_unique
ON public.products (
  LOWER(reference)
);


-- ============================================================
-- 5. PRODUCT VARIANTS
-- ============================================================
--
-- Esta tabela é a ÚNICA fonte de verdade do stock.
--
-- Produtos com variantes visíveis:
--
-- Produto:
-- T-Shirt THE BOX
--
-- variant_label:
-- Tamanho
--
-- Variantes:
-- S
-- M
-- L
-- XL
--
--
-- Produto sem selector público:
--
-- variant_label:
-- NULL
--
-- Variante técnica:
-- Único
--
-- O frontend nunca deverá mostrar "Único"
-- ao utilizador.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL
    REFERENCES public.products(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL
    CHECK (
      BTRIM(name) <> ''
    ),

  stock_quantity INTEGER NOT NULL
    DEFAULT 0
    CHECK (
      stock_quantity >= 0
    ),

  -- Quando NULL:
  -- utilizar products.price.
  --
  -- Quando preenchido:
  -- esta variante possui preço próprio.
  price_override NUMERIC(12, 2)
    CHECK (
      price_override IS NULL
      OR price_override >= 0
    ),

  active BOOLEAN NOT NULL
    DEFAULT TRUE,

  display_order INTEGER NOT NULL
    DEFAULT 0
    CHECK (
      display_order >= 0
    ),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL
    DEFAULT NOW(),

  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    DEFAULT NOW()
);


COMMENT ON TABLE public.product_variants IS
'Variantes e stock dos produtos da Loja THE BOX.';


COMMENT ON COLUMN public.product_variants.id IS
'Identificador UUID único da variante.';


COMMENT ON COLUMN public.product_variants.product_id IS
'Produto ao qual a variante pertence.';


COMMENT ON COLUMN public.product_variants.name IS
'Nome da variante. Exemplos: S, M, L, XL, Preto, 10 oz ou Único.';


COMMENT ON COLUMN public.product_variants.stock_quantity IS
'Quantidade disponível. Única fonte de verdade do stock da Loja.';


COMMENT ON COLUMN public.product_variants.price_override IS
'Preço específico da variante. NULL significa utilizar products.price.';


COMMENT ON COLUMN public.product_variants.active IS
'Define se a variante pode ser utilizada publicamente.';


COMMENT ON COLUMN public.product_variants.display_order IS
'Ordem de apresentação da variante.';


-- Uma variante com o mesmo nome não pode
-- aparecer duas vezes no mesmo produto.

CREATE UNIQUE INDEX IF NOT EXISTS
idx_product_variants_unique_name
ON public.product_variants (
  product_id,
  LOWER(name)
);


-- ============================================================
-- 6. PRODUCT IMAGES
-- ============================================================
--
-- As imagens continuam no bucket existente:
--
-- images
--
-- Estrutura prevista:
--
-- images/
-- └── products/
--     └── {productId}/
--         ├── imagem-1.webp
--         ├── imagem-2.webp
--         └── imagem-3.webp
--
-- Guardamos:
--
-- image_url
--   URL pública
--
-- storage_path
--   path real dentro do bucket
--
-- Isto permite apagar correctamente o ficheiro
-- no futuro sem reconstruir o path pela URL.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL
    REFERENCES public.products(id)
    ON DELETE CASCADE,

  image_url TEXT NOT NULL
    CHECK (
      BTRIM(image_url) <> ''
    ),

  storage_path TEXT NOT NULL
    CHECK (
      BTRIM(storage_path) <> ''
    ),

  alt_text TEXT,

  display_order INTEGER NOT NULL
    DEFAULT 0
    CHECK (
      display_order >= 0
    ),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL
    DEFAULT NOW()
);


COMMENT ON TABLE public.product_images IS
'Imagens associadas aos produtos da Loja THE BOX.';


COMMENT ON COLUMN public.product_images.id IS
'Identificador UUID único da imagem.';


COMMENT ON COLUMN public.product_images.product_id IS
'Produto ao qual a imagem pertence.';


COMMENT ON COLUMN public.product_images.image_url IS
'URL pública da imagem no Supabase Storage.';


COMMENT ON COLUMN public.product_images.storage_path IS
'Caminho real do ficheiro dentro do bucket images.';


COMMENT ON COLUMN public.product_images.alt_text IS
'Texto alternativo para acessibilidade e SEO.';


COMMENT ON COLUMN public.product_images.display_order IS
'A imagem com menor display_order é considerada a imagem principal.';


-- Um objecto físico de Storage não deve estar
-- associado duas vezes à base de dados.

CREATE UNIQUE INDEX IF NOT EXISTS
idx_product_images_storage_path_unique
ON public.product_images (
  storage_path
);


-- ============================================================
-- 7. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_products_active
ON public.products (
  active
);


CREATE INDEX IF NOT EXISTS
idx_products_category
ON public.products (
  category
);


CREATE INDEX IF NOT EXISTS
idx_products_featured
ON public.products (
  featured
);


CREATE INDEX IF NOT EXISTS
idx_products_display_order
ON public.products (
  display_order
);


-- Índice orientado para o catálogo público.

CREATE INDEX IF NOT EXISTS
idx_products_public_catalog
ON public.products (
  active,
  category,
  display_order
);


-- Consulta típica:
--
-- variantes de determinado produto,
-- apenas activas,
-- pela ordem definida.

CREATE INDEX IF NOT EXISTS
idx_product_variants_product
ON public.product_variants (
  product_id,
  active,
  display_order
);


-- Consulta típica:
--
-- imagens de determinado produto,
-- pela ordem definida.

CREATE INDEX IF NOT EXISTS
idx_product_images_product
ON public.product_images (
  product_id,
  display_order
);


-- ============================================================
-- 8. UPDATED_AT
-- ============================================================
--
-- A Loja possui uma função própria.
--
-- Não dependemos das diferentes funções
-- históricas encontradas nos scripts anteriores.
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_store_updated_at()
RETURNS TRIGGER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;


-- PRODUCTS

DROP TRIGGER IF EXISTS
update_products_updated_at
ON public.products;


CREATE TRIGGER update_products_updated_at
BEFORE UPDATE
ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_store_updated_at();


-- PRODUCT VARIANTS

DROP TRIGGER IF EXISTS
update_product_variants_updated_at
ON public.product_variants;


CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE
ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_store_updated_at();


-- product_images não possui updated_at.
-- Por isso não necessita de trigger.


-- ============================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.products
ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.product_variants
ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.product_images
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 10. TABLE PRIVILEGES
-- ============================================================
--
-- O público não pode escrever directamente
-- nas tabelas da Loja.
--
-- Mesmo que seja criada acidentalmente no futuro
-- uma policy permissiva, os privilégios SQL continuam
-- a impedir INSERT / UPDATE / DELETE por anon.
-- ============================================================

REVOKE INSERT, UPDATE, DELETE
ON TABLE public.products
FROM anon, authenticated;


REVOKE INSERT, UPDATE, DELETE
ON TABLE public.product_variants
FROM anon, authenticated;


REVOKE INSERT, UPDATE, DELETE
ON TABLE public.product_images
FROM anon, authenticated;


-- Visitantes podem consultar as três tabelas,
-- mas RLS continuará a determinar quais linhas
-- são efectivamente visíveis.

GRANT SELECT
ON TABLE public.products
TO anon, authenticated;


GRANT SELECT
ON TABLE public.product_variants
TO anon, authenticated;


GRANT SELECT
ON TABLE public.product_images
TO anon, authenticated;


-- ============================================================
-- 11. SERVICE ROLE
-- ============================================================
--
-- O painel administrativo da THE BOX utiliza:
--
-- SUPABASE_SERVICE_ROLE_KEY
--
-- Fluxo:
--
-- Admin
--   -> JWT próprio da aplicação
--   -> getAuthenticatedAdmin()
--   -> Next.js API
--   -> Service Role
--   -> Supabase
--
-- Declaramos explicitamente os privilégios da
-- service_role para não depender apenas dos
-- default privileges do projecto.
-- ============================================================

GRANT ALL PRIVILEGES
ON TABLE
  public.products,
  public.product_variants,
  public.product_images
TO service_role;


-- ============================================================
-- 12. RLS POLICY — PRODUCTS
-- ============================================================
--
-- Apenas produtos activos ficam disponíveis
-- através de clientes anon/authenticated.
-- ============================================================

DROP POLICY IF EXISTS
"products_public_read_active"
ON public.products;


CREATE POLICY "products_public_read_active"
ON public.products
FOR SELECT
TO anon, authenticated
USING (
  active = TRUE
);


-- ============================================================
-- 13. RLS POLICY — PRODUCT VARIANTS
-- ============================================================
--
-- Uma variante só pode ser lida publicamente quando:
--
-- 1. a variante está activa
-- 2. o produto pai está activo
-- ============================================================

DROP POLICY IF EXISTS
"product_variants_public_read_active"
ON public.product_variants;


CREATE POLICY "product_variants_public_read_active"
ON public.product_variants
FOR SELECT
TO anon, authenticated
USING (
  active = TRUE
  AND EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_variants.product_id
      AND p.active = TRUE
  )
);


-- ============================================================
-- 14. RLS POLICY — PRODUCT IMAGES
-- ============================================================
--
-- A metadata de uma imagem só pode ser lida
-- publicamente quando pertence a produto activo.
-- ============================================================

DROP POLICY IF EXISTS
"product_images_public_read_active_products"
ON public.product_images;


CREATE POLICY "product_images_public_read_active_products"
ON public.product_images
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_images.product_id
      AND p.active = TRUE
  )
);


-- ============================================================
-- 15. STORAGE
-- ============================================================
--
-- NENHUMA ALTERAÇÃO DE STORAGE É FEITA AQUI.
--
-- O projecto real já possui:
--
-- Bucket:
-- images
--
-- Public:
-- true
--
-- Limite:
-- 10 MB
--
-- MIME types:
-- image/jpeg
-- image/png
-- image/gif
-- image/webp
-- image/jpg
--
-- Policies existentes já permitem:
--
-- leitura pública
-- upload via Service Role
-- update via Service Role
-- delete via Service Role
--
-- Portanto NÃO:
--
-- - recriamos o bucket
-- - executamos setup-storage-buckets.sql
-- - executamos setup-storage-simple.sql
-- - removemos policies existentes
--
-- A futura API da Loja utilizará:
--
-- products/{productId}/{filename}
--
-- Exemplo:
--
-- products/
-- └── 1a2b3c4d-.../
--     ├── 1730000000-front.webp
--     └── 1730000001-back.webp
--
-- ============================================================


-- ============================================================
-- 16. FIM DA TRANSAÇÃO
-- ============================================================

COMMIT;


-- ============================================================
-- 17. VERIFICAÇÕES PÓS-MIGRATION
-- ============================================================
--
-- Todos os comandos abaixo são SELECT.
--
-- Não alteram dados nem estrutura.
-- ============================================================


-- ============================================================
-- 17.1 TABELAS CRIADAS
-- ============================================================

SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'products',
    'product_variants',
    'product_images'
  )
ORDER BY
  table_name;


-- ============================================================
-- 17.2 COLUNA WHATSAPP
-- ============================================================

SELECT
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'site_settings'
  AND column_name = 'whatsapp_number';


-- ============================================================
-- 17.3 VALOR WHATSAPP
-- ============================================================

SELECT
  id,
  phone,
  whatsapp_number
FROM public.site_settings
ORDER BY
  id;


-- ============================================================
-- 17.4 ESTRUTURA PRODUCTS
-- ============================================================

SELECT
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
ORDER BY
  ordinal_position;


-- ============================================================
-- 17.5 ESTRUTURA PRODUCT_VARIANTS
-- ============================================================

SELECT
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'product_variants'
ORDER BY
  ordinal_position;


-- ============================================================
-- 17.6 ESTRUTURA PRODUCT_IMAGES
-- ============================================================

SELECT
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'product_images'
ORDER BY
  ordinal_position;


-- ============================================================
-- 17.7 RLS
-- ============================================================

SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n
  ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'products',
    'product_variants',
    'product_images'
  )
ORDER BY
  c.relname;


-- ============================================================
-- 17.8 POLICIES
-- ============================================================

SELECT
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'products',
    'product_variants',
    'product_images'
  )
ORDER BY
  tablename,
  policyname;


-- ============================================================
-- 17.9 TRIGGERS
-- ============================================================

SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
    'products',
    'product_variants'
  )
ORDER BY
  event_object_table,
  trigger_name,
  event_manipulation;


-- ============================================================
-- 17.10 CONSTRAINTS
-- ============================================================

SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'products',
    'product_variants',
    'product_images'
  )
ORDER BY
  tc.table_name,
  tc.constraint_name;


-- ============================================================
-- 17.11 ÍNDICES
-- ============================================================

SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'products',
    'product_variants',
    'product_images'
  )
ORDER BY
  tablename,
  indexname;


-- ============================================================
-- 17.12 PRIVILÉGIOS DE SERVICE ROLE
-- ============================================================

SELECT
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee = 'service_role'
  AND table_name IN (
    'products',
    'product_variants',
    'product_images'
  )
ORDER BY
  table_name,
  privilege_type;


-- ============================================================
-- FIM
-- ============================================================