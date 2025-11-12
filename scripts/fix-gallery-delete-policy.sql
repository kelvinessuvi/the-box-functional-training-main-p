-- Script para corrigir políticas RLS e permitir DELETE de imagens da galeria
-- Execute este script no Supabase SQL Editor

-- 1. Verificar e corrigir políticas RLS para gallery_images
-- Primeiro, remover políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "Gallery images are viewable by everyone" ON gallery_images;
DROP POLICY IF EXISTS "gallery_images_select_policy" ON gallery_images;
DROP POLICY IF EXISTS "gallery_images_all_policy" ON gallery_images;
DROP POLICY IF EXISTS "gallery_images_delete_policy" ON gallery_images;

-- 2. Criar políticas corretas para gallery_images

-- Leitura pública
CREATE POLICY "Gallery images are viewable by everyone" 
ON gallery_images FOR SELECT 
USING (true);

-- Inserção/Update/Delete apenas para service role (usado pela API)
-- O Service Role pode fazer tudo (já tem permissões elevadas)
-- Para usuários autenticados, podemos criar políticas específicas se necessário

-- 3. Verificar triggers que atualizam statistics
-- O problema pode estar no trigger que atualiza statistics ao deletar

-- Verificar se o trigger existe
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'gallery_images';

-- 4. Se o trigger existir e estiver causando problema, vamos recriá-lo corretamente

-- Remover trigger problemático se existir
DROP TRIGGER IF EXISTS gallery_deleted_trigger ON gallery_images;
DROP TRIGGER IF EXISTS gallery_inserted_trigger ON gallery_images;

-- Recriar trigger de DELETE corretamente
CREATE OR REPLACE FUNCTION update_statistics_on_gallery_delete()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    -- Garantir que existe pelo menos um registro em statistics
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        -- Criar registro se não existir
        INSERT INTO statistics (gallery_images, last_updated)
        VALUES (0, NOW())
        RETURNING id INTO stats_id;
    END IF;
    
    -- Atualizar contador de imagens na galeria (decrementar)
    -- IMPORTANTE: Usar WHERE com o ID específico para evitar erro "UPDATE requires a WHERE clause"
    UPDATE statistics 
    SET gallery_images = GREATEST(0, gallery_images - 1), 
        last_updated = NOW()
    WHERE id = stats_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger de INSERT corretamente
CREATE OR REPLACE FUNCTION update_statistics_on_gallery_insert()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    -- Garantir que existe pelo menos um registro em statistics
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        -- Criar registro se não existir
        INSERT INTO statistics (gallery_images, last_updated)
        VALUES (1, NOW())
        RETURNING id INTO stats_id;
    ELSE
        -- Atualizar contador de imagens na galeria (incrementar)
        -- IMPORTANTE: Usar WHERE com o ID específico
        UPDATE statistics 
        SET gallery_images = gallery_images + 1, 
            last_updated = NOW()
        WHERE id = stats_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers
CREATE TRIGGER gallery_inserted_trigger
AFTER INSERT ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_statistics_on_gallery_insert();

CREATE TRIGGER gallery_deleted_trigger
AFTER DELETE ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_statistics_on_gallery_delete();

-- 5. Verificar se RLS está habilitado (deve estar, mas verificamos)
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- 6. Garantir que há pelo menos um registro em statistics
INSERT INTO statistics (gallery_images, last_updated)
SELECT 
    (SELECT COUNT(*) FROM gallery_images),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM statistics);

-- Verificar resultado
SELECT 
    'Configuração concluída!' as status,
    (SELECT COUNT(*) FROM gallery_images) as total_images,
    (SELECT gallery_images FROM statistics LIMIT 1) as statistics_count;

