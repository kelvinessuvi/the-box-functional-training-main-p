-- Script para limpar registros duplicados da tabela statistics
-- Execute este script no SQL Editor do Supabase

-- Verificar registros atuais
SELECT 'Registros atuais:' as info;
SELECT id, monthly_views, last_updated, created_at FROM statistics ORDER BY created_at;

-- Manter apenas o registro com monthly_views = 1250 e deletar os outros
DELETE FROM statistics WHERE monthly_views = 0;

-- Verificar resultado
SELECT 'Após limpeza:' as info;
SELECT id, monthly_views, last_updated, created_at FROM statistics ORDER BY created_at;

-- Se não houver registros, inserir um novo
INSERT INTO statistics (monthly_views, last_updated) 
SELECT 1250, NOW()
WHERE NOT EXISTS (SELECT 1 FROM statistics WHERE monthly_views = 1250);

-- Verificar resultado final
SELECT 'Resultado final:' as info;
SELECT id, monthly_views, last_updated, created_at FROM statistics ORDER BY created_at;
