-- Script COMPLETO para corrigir TODOS os triggers que causam erro "UPDATE requires a WHERE clause"
-- Execute este script no Supabase SQL Editor
-- Este script corrige: planos, galeria e mensagens

-- ============================================
-- 1. CORRIGIR FUNÇÃO DE PLANOS
-- ============================================
CREATE OR REPLACE FUNCTION update_active_plans()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    -- Garantir que existe pelo menos um registro em statistics
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        -- Criar registro se não existir
        INSERT INTO statistics (active_plans, last_updated)
        VALUES (
            (SELECT COUNT(*) FROM plans WHERE active = TRUE),
            NOW()
        )
        RETURNING id INTO stats_id;
    ELSE
        -- Atualizar contador de planos ativos - IMPORTANTE: usar WHERE com ID específico
        UPDATE statistics 
        SET active_plans = (SELECT COUNT(*) FROM plans WHERE active = TRUE), 
            last_updated = NOW()
        WHERE id = stats_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. CORRIGIR FUNÇÃO DE GALERIA
-- ============================================
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

-- ============================================
-- 3. CORRIGIR FUNÇÃO DE MENSAGENS (preventivo)
-- ============================================
CREATE OR REPLACE FUNCTION update_message_count()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    -- Garantir que existe pelo menos um registro em statistics
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        -- Criar registro se não existir
        INSERT INTO statistics (total_messages, last_updated)
        VALUES (
            CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
            NOW()
        )
        RETURNING id INTO stats_id;
    ELSE
        -- Atualizar contador - IMPORTANTE: usar WHERE com ID específico
        IF TG_OP = 'INSERT' THEN
            UPDATE statistics 
            SET total_messages = total_messages + 1, 
                last_updated = NOW()
            WHERE id = stats_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE statistics 
            SET total_messages = GREATEST(0, total_messages - 1), 
                last_updated = NOW()
            WHERE id = stats_id;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. RECRIAR TRIGGERS DE PLANOS
-- ============================================
DROP TRIGGER IF EXISTS plan_inserted_trigger ON plans;
DROP TRIGGER IF EXISTS plan_updated_trigger ON plans;
DROP TRIGGER IF EXISTS plan_deleted_trigger ON plans;

CREATE TRIGGER plan_inserted_trigger
AFTER INSERT ON plans
FOR EACH ROW
EXECUTE FUNCTION update_active_plans();

CREATE TRIGGER plan_updated_trigger
AFTER UPDATE ON plans
FOR EACH ROW
EXECUTE FUNCTION update_active_plans();

CREATE TRIGGER plan_deleted_trigger
AFTER DELETE ON plans
FOR EACH ROW
EXECUTE FUNCTION update_active_plans();

-- ============================================
-- 5. RECRIAR TRIGGERS DE GALERIA
-- ============================================
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

-- ============================================
-- 6. RECRIAR TRIGGERS DE MENSAGENS
-- ============================================
DROP TRIGGER IF EXISTS message_inserted_trigger ON contact_messages;
DROP TRIGGER IF EXISTS message_deleted_trigger ON contact_messages;

CREATE TRIGGER message_inserted_trigger
AFTER INSERT ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_message_count();

CREATE TRIGGER message_deleted_trigger
AFTER DELETE ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_message_count();

-- ============================================
-- 7. GARANTIR QUE EXISTE REGISTRO EM STATISTICS
-- ============================================
INSERT INTO statistics (total_messages, active_plans, gallery_images, last_updated)
SELECT 
    COALESCE((SELECT COUNT(*) FROM contact_messages), 0),
    COALESCE((SELECT COUNT(*) FROM plans WHERE active = TRUE), 0),
    COALESCE((SELECT COUNT(*) FROM gallery_images), 0),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM statistics);

-- ============================================
-- 8. VERIFICAR RESULTADO
-- ============================================
SELECT 
    'Todos os triggers corrigidos!' as status,
    (SELECT COUNT(*) FROM plans WHERE active = TRUE) as active_plans,
    (SELECT COUNT(*) FROM gallery_images) as gallery_images,
    (SELECT COUNT(*) FROM contact_messages) as total_messages,
    (SELECT active_plans FROM statistics LIMIT 1) as stats_active_plans,
    (SELECT gallery_images FROM statistics LIMIT 1) as stats_gallery_images,
    (SELECT total_messages FROM statistics LIMIT 1) as stats_total_messages;

