-- =====================================================
-- Adicionar campo instagram_url na tabela instructors
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Adicionar coluna instagram_url se não existir
ALTER TABLE instructors 
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Comentário na coluna
COMMENT ON COLUMN instructors.instagram_url IS 'URL do perfil do Instagram do instrutor';

-- =====================================================
-- Script concluído! A coluna instagram_url foi adicionada.
-- =====================================================

