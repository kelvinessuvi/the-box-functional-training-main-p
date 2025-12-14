-- =====================================================
-- SCRIPT SIMPLIFICADO - CONFIGURAÇÃO RÁPIDA
-- Execute este script DEPOIS de criar o bucket "images" via Dashboard
-- =====================================================

-- REMOVER POLÍTICAS EXISTENTES (se houver)
-- =====================================================
-- Remove todas as políticas antigas para evitar conflitos

DROP POLICY IF EXISTS "Public Read - Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Read Images" ON storage.objects;
DROP POLICY IF EXISTS "Service Upload - Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload - Images" ON storage.objects;
DROP POLICY IF EXISTS "Service Update - Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update - Images" ON storage.objects;
DROP POLICY IF EXISTS "Service Delete - Images" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Delete - Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Modalities" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Instructors" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Branches" ON storage.objects;

-- 1. POLÍTICAS DE LEITURA PÚBLICA (SELECT)
-- =====================================================
-- Permite que qualquer pessoa veja as imagens

CREATE POLICY "Public Read - Images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- 2. POLÍTICAS DE UPLOAD (INSERT)
-- =====================================================
-- Permite upload via Service Role (API routes)

CREATE POLICY "Service Upload - Images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated')
);

-- 3. POLÍTICAS DE ATUALIZAÇÃO (UPDATE)
-- =====================================================
-- Permite atualizar via Service Role

CREATE POLICY "Service Update - Images"
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

-- 4. POLÍTICAS DE EXCLUSÃO (DELETE)
-- =====================================================
-- Permite deletar via Service Role

CREATE POLICY "Service Delete - Images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'images' AND
  auth.jwt() ->> 'role' = 'service_role'
);

-- =====================================================
-- PRONTO! Verifique se as políticas foram criadas em:
-- Storage > Policies no Dashboard do Supabase
-- =====================================================

