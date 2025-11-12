-- Script para limpar URLs externas problemáticas da galeria
-- Execute este script no SQL Editor do Supabase

-- Atualizar imagens com URLs externas para placeholders locais
UPDATE gallery_images 
SET image_url = '/placeholder.svg?height=300&width=300&text=Super+Beast'
WHERE image_url LIKE 'https://images.unsplash.com%';

-- Verificar se as alterações foram aplicadas
SELECT id, title, image_url, category 
FROM gallery_images 
WHERE image_url LIKE 'https://images.unsplash.com%';

-- Mostrar todas as imagens da galeria
SELECT id, title, image_url, category, created_at 
FROM gallery_images 
ORDER BY created_at DESC;
