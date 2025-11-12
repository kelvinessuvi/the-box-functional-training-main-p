-- Script para testar conexão e dados
-- Execute este script no SQL Editor do Supabase

-- Teste 1: Verificar se conseguimos acessar as tabelas
SELECT 'Teste 1: Acesso às tabelas' as teste;

SELECT 
  table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name) 
    THEN 'EXISTE' 
    ELSE 'NÃO EXISTE' 
  END as status
FROM (VALUES 
  ('contact_messages'),
  ('plans'), 
  ('gallery_images'),
  ('statistics')
) as t(table_name);

-- Teste 2: Verificar contagem de registros
SELECT 'Teste 2: Contagem de registros' as teste;

SELECT 
  'contact_messages' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN read = false THEN 1 END) as nao_lidas
FROM contact_messages
UNION ALL
SELECT 
  'plans' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN active = true THEN 1 END) as ativos
FROM plans
UNION ALL
SELECT 
  'gallery_images' as tabela,
  COUNT(*) as total,
  0 as nao_lidas
FROM gallery_images
UNION ALL
SELECT 
  'statistics' as tabela,
  COUNT(*) as total,
  MAX(monthly_views) as visualizacoes
FROM statistics;

-- Teste 3: Verificar dados específicos
SELECT 'Teste 3: Dados específicos' as teste;

-- Mensagens
SELECT 'Mensagens:' as tipo, name, email, read FROM contact_messages LIMIT 3;

-- Planos
SELECT 'Planos:' as tipo, name, active, participants FROM plans LIMIT 3;

-- Galeria
SELECT 'Galeria:' as tipo, title, category FROM gallery_images LIMIT 3;

-- Estatísticas
SELECT 'Estatísticas:' as tipo, monthly_views, last_updated FROM statistics LIMIT 1;

-- Teste 4: Verificar políticas RLS
SELECT 'Teste 4: Políticas RLS' as teste;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('contact_messages', 'plans', 'gallery_images', 'statistics');
