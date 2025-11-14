-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO DE STORAGE BUCKETS
-- THE BOX Functional Training
-- =====================================================
-- Este script configura o bucket "images" e suas políticas
-- de segurança para gerenciar uploads de imagens.
--
-- ESTRUTURA DE PASTAS:
-- - images/gallery/        -> Imagens da galeria
-- - images/modalities/     -> Imagens das modalidades
-- - images/instructors/     -> Fotos dos instrutores
-- - images/branches/       -> Imagens das filiais
--
-- =====================================================

-- 1. REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
-- =====================================================

DROP POLICY IF EXISTS "Public Access - Read Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload - Images" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Delete - Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Modalities" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Instructors" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Branches" ON storage.objects;

-- 2. CRIAR BUCKET (se não existir)
-- =====================================================
-- NOTA: Buckets geralmente precisam ser criados manualmente
-- via Dashboard do Supabase, mas tentamos criar via SQL se possível.

-- Verificar se o bucket existe antes de criar
DO $$
BEGIN
  -- Tentar inserir o bucket se não existir
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'images',
    'images',
    true,  -- Bucket público (permite leitura sem autenticação)
    10485760,  -- Limite de 10MB por arquivo
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Bucket "images" verificado/criado com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Bucket pode precisar ser criado manualmente: %', SQLERRM;
END $$;

-- 3. POLÍTICAS DE LEITURA PÚBLICA
-- =====================================================
-- Permite que qualquer pessoa veja as imagens (necessário para a página pública)

-- Política geral de leitura pública para o bucket images
CREATE POLICY "Public Access - Read Images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'images' AND
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Política específica para galeria (leitura pública)
CREATE POLICY "Public Read - Gallery"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'gallery'
);

-- Política específica para modalidades (leitura pública)
CREATE POLICY "Public Read - Modalities"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'modalities'
);

-- Política específica para instrutores (leitura pública)
CREATE POLICY "Public Read - Instructors"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'instructors'
);

-- Política específica para filiais (leitura pública)
CREATE POLICY "Public Read - Branches"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'branches'
);

-- 4. POLÍTICAS DE UPLOAD (INSERT)
-- =====================================================
-- Permite upload apenas via Service Role (API routes autenticadas)
-- Isso garante que apenas o admin pode fazer uploads

CREATE POLICY "Authenticated Upload - Images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  (
    -- Permitir upload para qualquer pasta se for service_role
    auth.jwt() ->> 'role' = 'service_role' OR
    -- Ou permitir se for authenticated e tiver permissão (futuro)
    (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'authenticated')
  )
);

-- 5. POLÍTICAS DE ATUALIZAÇÃO (UPDATE)
-- =====================================================
-- Permite atualizar apenas via Service Role

CREATE POLICY "Authenticated Update - Images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'images' AND
  auth.jwt() ->> 'role' = 'service_role'
)
WITH CHECK (
  bucket_id = 'images' AND
  auth.jwt() ->> 'role' = 'service_role'
);

-- 6. POLÍTICAS DE EXCLUSÃO (DELETE)
-- =====================================================
-- Permite deletar apenas via Service Role

CREATE POLICY "Service Role Delete - Images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'images' AND
  auth.jwt() ->> 'role' = 'service_role'
);

-- 7. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se o bucket foi criado
SELECT 
  'Bucket Status' as info,
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets
WHERE id = 'images';

-- Verificar políticas criadas
SELECT 
  'Storage Policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%Images%' OR policyname LIKE '%Gallery%' OR policyname LIKE '%Modalities%' OR policyname LIKE '%Instructors%' OR policyname LIKE '%Branches%';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Se o bucket não for criado automaticamente:
--    a. Vá para Storage > New Bucket
--    b. Nome: "images"
--    c. Marque como "Public"
--    d. File size limit: 10MB
--    e. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
-- 3. Verifique se as políticas foram criadas corretamente
-- 4. Teste fazendo upload de uma imagem pelo admin panel
--
-- =====================================================

