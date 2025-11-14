-- =====================================================
-- Adicionar campo image_position na tabela instructors
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Adicionar coluna image_position se não existir
ALTER TABLE instructors 
ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center';

-- Comentário na coluna
COMMENT ON COLUMN instructors.image_position IS 'Posição de foco da imagem: top, center, bottom';

-- =====================================================
-- Script concluído! A coluna image_position foi adicionada.
-- Valores possíveis: 'top', 'center', 'bottom'
-- =====================================================

