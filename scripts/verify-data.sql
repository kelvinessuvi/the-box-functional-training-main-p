-- Script para verificar dados na base de dados
-- Execute este script no SQL Editor do Supabase

-- Verificar mensagens de contacto
SELECT 
  'contact_messages' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_count
FROM contact_messages;

-- Verificar planos ativos
SELECT 
  'plans' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN active = true THEN 1 END) as active_count
FROM plans;

-- Verificar imagens da galeria
SELECT 
  'gallery_images' as table_name,
  COUNT(*) as total_count
FROM gallery_images;

-- Verificar estatísticas
SELECT 
  'statistics' as table_name,
  COUNT(*) as total_count,
  monthly_views,
  last_updated
FROM statistics;

-- Verificar se há dados de exemplo
SELECT 'Sample data check' as info;

-- Verificar mensagens de exemplo
SELECT id, name, email, read, created_at 
FROM contact_messages 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar planos de exemplo
SELECT id, name, active, created_at 
FROM plans 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar imagens de exemplo
SELECT id, title, category, created_at 
FROM gallery_images 
ORDER BY created_at DESC 
LIMIT 5;
