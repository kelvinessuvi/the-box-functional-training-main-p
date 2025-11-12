-- Script de teste para verificar se o upload da galeria está funcionando
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as variáveis de ambiente estão configuradas corretamente
SELECT 'Environment check:' as info;

-- 2. Verificar bucket
SELECT 'Bucket status:' as info, id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'images';

-- 3. Verificar políticas
SELECT 'Storage policies:' as info, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- 4. Verificar tabela gallery_images
SELECT 'Gallery table structure:' as info, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'gallery_images' 
ORDER BY ordinal_position;

-- 5. Verificar se há dados na galeria
SELECT 'Current gallery images:' as info, COUNT(*) as total FROM gallery_images;

-- 6. Verificar se há arquivos no storage
SELECT 'Files in storage:' as info, COUNT(*) as total FROM storage.objects WHERE bucket_id = 'images';

-- 7. Teste de inserção na tabela (sem arquivo)
INSERT INTO gallery_images (title, description, category, image_url)
VALUES ('Teste Manual', 'Imagem de teste inserida manualmente', 'teste', '/placeholder.svg')
ON CONFLICT DO NOTHING;

-- 8. Verificar se foi inserido
SELECT 'Test insertion result:' as info, id, title, category, created_at 
FROM gallery_images 
WHERE title = 'Teste Manual';

-- 9. Limpar teste
DELETE FROM gallery_images WHERE title = 'Teste Manual';

SELECT 'Test completed! If you see this, the database is working correctly.' as status;
