-- Script para limpar e configurar a galeria corretamente
-- Execute este script no Supabase SQL Editor

-- 1. Limpar todos os dados da galeria
DELETE FROM gallery_images;

-- 2. Resetar contadores de estatísticas
UPDATE statistics SET gallery_images = 0, last_updated = NOW();

-- 3. Verificar se o bucket images existe e criar se necessário
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- 4. Remover todas as políticas existentes do storage
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete images" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON storage.objects;

-- 5. Criar políticas simples e funcionais
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "Full access for service role"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Full access for authenticated users"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- 6. Verificar configuração
SELECT 'Bucket images:' as info, id, name, public FROM storage.buckets WHERE id = 'images';

SELECT 'Storage policies:' as info, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

SELECT 'Gallery images count:' as info, COUNT(*) as total FROM gallery_images;

-- 7. Teste: inserir um arquivo de teste
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES ('images', 'test.txt', auth.uid(), '{"size": 0, "mimetype": "text/plain"}')
ON CONFLICT DO NOTHING;

SELECT 'Test file created:' as info, name FROM storage.objects WHERE bucket_id = 'images' AND name = 'test.txt';

-- 8. Limpar arquivo de teste
DELETE FROM storage.objects WHERE bucket_id = 'images' AND name = 'test.txt';

SELECT 'Setup completed successfully!' as status;
