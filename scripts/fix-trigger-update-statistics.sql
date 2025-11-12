-- Script RÁPIDO para corrigir o trigger que está causando erro "UPDATE requires a WHERE clause"
-- Execute este script no Supabase SQL Editor

-- Corrigir a função update_gallery_count que está no script 02-create-functions.sql
CREATE OR REPLACE FUNCTION update_gallery_count()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    -- Garantir que existe pelo menos um registro em statistics
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        -- Criar registro se não existir
        INSERT INTO statistics (gallery_images, last_updated)
        VALUES (
            CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
            NOW()
        )
        RETURNING id INTO stats_id;
    ELSE
        -- Atualizar contador - IMPORTANTE: usar WHERE com ID específico
        IF TG_OP = 'INSERT' THEN
            UPDATE statistics 
            SET gallery_images = gallery_images + 1, 
                last_updated = NOW()
            WHERE id = stats_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE statistics 
            SET gallery_images = GREATEST(0, gallery_images - 1), 
                last_updated = NOW()
            WHERE id = stats_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se os triggers existem e recriá-los se necessário
DROP TRIGGER IF EXISTS gallery_inserted_trigger ON gallery_images;
DROP TRIGGER IF EXISTS gallery_deleted_trigger ON gallery_images;

CREATE TRIGGER gallery_inserted_trigger
AFTER INSERT ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_gallery_count();

CREATE TRIGGER gallery_deleted_trigger
AFTER DELETE ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_gallery_count();

-- Garantir que existe pelo menos um registro em statistics
INSERT INTO statistics (gallery_images, last_updated)
SELECT 
    COALESCE((SELECT COUNT(*) FROM gallery_images), 0),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM statistics);

-- Verificar resultado
SELECT 
    'Trigger corrigido!' as status,
    (SELECT COUNT(*) FROM gallery_images) as total_images,
    (SELECT gallery_images FROM statistics LIMIT 1) as statistics_count;

