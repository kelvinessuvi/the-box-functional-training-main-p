-- Script para corrigir o trigger que atualiza contador de planos ativos
-- Execute este script no Supabase SQL Editor

-- Corrigir a função update_active_plans que está no script 02-create-functions.sql
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

-- Verificar se os triggers existem e recriá-los se necessário
DROP TRIGGER IF EXISTS plan_inserted_trigger ON plans;
DROP TRIGGER IF EXISTS plan_updated_trigger ON plans;
DROP TRIGGER IF EXISTS plan_deleted_trigger ON plans;

-- Criar triggers para INSERT, UPDATE e DELETE
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

-- Garantir que existe pelo menos um registro em statistics
INSERT INTO statistics (active_plans, last_updated)
SELECT 
    (SELECT COUNT(*) FROM plans WHERE active = TRUE),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM statistics);

-- Verificar resultado
SELECT 
    'Trigger de planos corrigido!' as status,
    (SELECT COUNT(*) FROM plans WHERE active = TRUE) as active_plans_count,
    (SELECT active_plans FROM statistics LIMIT 1) as statistics_active_plans;

