-- =====================================================
-- THE BOX Functional Training - Dados Iniciais
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Inserir estatísticas iniciais
INSERT INTO statistics (
  monthly_views, 
  total_messages, 
  active_modalities, 
  active_instructors, 
  active_branches, 
  gallery_images
)
VALUES (0, 0, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Inserir filiais da THE BOX
INSERT INTO branches (name, address, city, country, active) VALUES
  (
    'The Box Mulemba',
    'Tecno Carro, rua do observatório da Mulemba, casa número 11',
    'Luanda',
    'Angola',
    true
  ),
  (
    'The Box Miramar',
    'RUA NDUNDUMA, N°35, MIRAMAR',
    'Luanda',
    'Angola',
    true
  ),
  (
    'The Box Bairro Popular',
    'Bairro Popular',
    'Luanda',
    'Angola',
    true
  ),
  (
    'The Box Lisboa',
    'Rua Ordem Militar do Hospital, N 1, Loja 5',
    'Amadora',
    'Portugal',
    true
  )
ON CONFLICT DO NOTHING;

-- Nota: Instrutores e Modalidades serão adicionados pelo admin através do painel
