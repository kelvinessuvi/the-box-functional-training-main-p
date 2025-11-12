-- Script para verificar políticas RLS e permissões
-- Execute este script no SQL Editor do Supabase

-- Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables 
WHERE tablename IN ('contact_messages', 'plans', 'gallery_images', 'statistics');

-- Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('contact_messages', 'plans', 'gallery_images', 'statistics')
ORDER BY tablename, policyname;

-- Verificar permissões do usuário atual
SELECT 
  current_user as usuario_atual,
  current_setting('role') as role_atual;

-- Testar acesso direto às tabelas (como usuário atual)
SELECT 'Teste de acesso direto:' as info;

-- Testar contact_messages
SELECT 'contact_messages - teste' as teste, COUNT(*) as total FROM contact_messages;

-- Testar plans
SELECT 'plans - teste' as teste, COUNT(*) as total FROM plans;

-- Testar gallery_images
SELECT 'gallery_images - teste' as teste, COUNT(*) as total FROM gallery_images;

-- Testar statistics
SELECT 'statistics - teste' as teste, COUNT(*) as total FROM statistics;
