-- =====================================================
-- SCRIPT COMPLETO PARA CONFIGURAÇÃO DO THE BOX
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CRIAR TABELAS (se não existirem)
-- =====================================================

-- Tabela de mensagens de contacto
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  participants INTEGER,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de planos
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER,
  duration TEXT,
  features JSONB,
  participants INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de imagens da galeria
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de estatísticas
CREATE TABLE IF NOT EXISTS statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  monthly_views INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRIAR FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover triggers existentes (se existirem)
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON gallery_images;

-- Criar triggers
CREATE TRIGGER update_contact_messages_updated_at 
  BEFORE UPDATE ON contact_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at 
  BEFORE UPDATE ON plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at 
  BEFORE UPDATE ON gallery_images 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. INSERIR DADOS DE TESTE
-- =====================================================

-- Limpar dados existentes (opcional)
-- DELETE FROM contact_messages;
-- DELETE FROM plans;
-- DELETE FROM gallery_images;
-- DELETE FROM statistics;

-- Inserir mensagens de teste
INSERT INTO contact_messages (name, email, company, phone, participants, subject, message, read) VALUES
('João Silva', 'joao@email.com', 'Empresa ABC', '+244 123 456 789', 5, 'Consulta sobre pacotes', 'Gostaria de saber mais sobre os pacotes disponíveis.', false),
('Maria Santos', 'maria@email.com', 'Empresa XYZ', '+244 987 654 321', 10, 'Evento corporativo', 'Precisamos de um evento para nossa equipa.', false),
('Pedro Costa', 'pedro@email.com', 'Startup Tech', '+244 555 123 456', 3, 'Programa personalizado', 'Queremos um programa específico para nossa startup.', true)
ON CONFLICT DO NOTHING;

-- Inserir planos de teste
INSERT INTO plans (name, description, price, duration, features, participants, active) VALUES
('Pacote Essencial', 'Programa básico de fitness e desenvolvimento pessoal', 50000, '8 semanas', '["Treinos básicos", "Acompanhamento semanal", "Material de apoio"]', 5, true),
('Pacote Profissional', 'Programa avançado com coaching personalizado', 75000, '12 semanas', '["Treinos avançados", "Coaching 1-on-1", "Avaliação física", "Plano nutricional"]', 10, true),
('Pacote Premium', 'Programa completo com eventos exclusivos', 100000, '14 semanas', '["Tudo do Profissional", "Eventos exclusivos", "Certificação", "Suporte 24/7"]', 15, true),
('Pacote Corporativo', 'Programa para empresas e equipas', 150000, '16 semanas', '["Programa personalizado", "Workshops", "Avaliação de equipa", "Relatórios mensais"]', 20, true)
ON CONFLICT DO NOTHING;

-- Inserir imagens de teste na galeria
INSERT INTO gallery_images (title, description, image_url, category) VALUES
('Treino em Equipa', 'Sessão de treino em grupo no ginásio', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'treinos'),
('Workshop Motivacional', 'Workshop sobre desenvolvimento pessoal', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'eventos'),
('Avaliação Física', 'Processo de avaliação física inicial', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'avaliacoes'),
('Evento Corporativo', 'Evento de equipa em empresa', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'eventos')
ON CONFLICT DO NOTHING;

-- Inserir estatísticas
INSERT INTO statistics (monthly_views, last_updated) 
VALUES (1250, NOW())
ON CONFLICT (id) DO UPDATE SET 
  monthly_views = 1250,
  last_updated = NOW();

-- 4. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se existirem)
DROP POLICY IF EXISTS "contact_messages_select_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert_policy" ON contact_messages;
DROP POLICY IF EXISTS "plans_select_policy" ON plans;
DROP POLICY IF EXISTS "plans_all_policy" ON plans;
DROP POLICY IF EXISTS "gallery_images_select_policy" ON gallery_images;
DROP POLICY IF EXISTS "gallery_images_all_policy" ON gallery_images;
DROP POLICY IF EXISTS "statistics_all_policy" ON statistics;

-- Políticas para contact_messages (leitura pública, escrita pública, admin pode ver tudo)
CREATE POLICY "contact_messages_select_policy" ON contact_messages
  FOR SELECT USING (true);

CREATE POLICY "contact_messages_insert_policy" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Políticas para plans (leitura pública, admin pode fazer tudo)
CREATE POLICY "plans_select_policy" ON plans
  FOR SELECT USING (true);

CREATE POLICY "plans_all_policy" ON plans
  FOR ALL USING (true);

-- Políticas para gallery_images (leitura pública, admin pode fazer tudo)
CREATE POLICY "gallery_images_select_policy" ON gallery_images
  FOR SELECT USING (true);

CREATE POLICY "gallery_images_all_policy" ON gallery_images
  FOR ALL USING (true);

-- Políticas para statistics (admin pode fazer tudo)
CREATE POLICY "statistics_all_policy" ON statistics
  FOR ALL USING (true);

-- 5. CRIAR BUCKET DE STORAGE
-- =====================================================

-- Nota: O bucket 'images' deve ser criado manualmente no painel do Supabase
-- Storage > New Bucket > Nome: 'images' > Public: true

-- 6. VERIFICAR DADOS INSERIDOS
-- =====================================================

SELECT '=== VERIFICAÇÃO DOS DADOS ===' as info;

-- Verificar mensagens
SELECT 
  'contact_messages' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_count
FROM contact_messages;

-- Verificar planos
SELECT 
  'plans' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN active = true THEN 1 END) as active_count
FROM plans;

-- Verificar galeria
SELECT 
  'gallery_images' as table_name,
  COUNT(*) as total_count
FROM gallery_images;

-- Verificar estatísticas
SELECT 
  'statistics' as table_name,
  COUNT(*) as total_count,
  MAX(monthly_views) as monthly_views,
  MAX(last_updated) as last_updated
FROM statistics;

SELECT '=== CONFIGURAÇÃO CONCLUÍDA ===' as status;
