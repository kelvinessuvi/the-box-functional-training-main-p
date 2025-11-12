-- Script para adaptar o banco de dados existente para o Super Beast Team Building
-- Execute este script no SQL Editor do Supabase

-- 1. Criar as tabelas necessárias que não existem
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  participants TEXT NOT NULL,
  features JSONB NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  participants TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monthly_views INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  active_plans INTEGER DEFAULT 0,
  gallery_images INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir dados iniciais
INSERT INTO admins (email, password)
VALUES ('admin@superbeast.com', 'admin123')
ON CONFLICT (email) DO NOTHING;

INSERT INTO statistics (monthly_views, total_messages, active_plans, gallery_images)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- 3. Inserir planos iniciais
INSERT INTO plans (name, price, description, duration, participants, features, active)
VALUES 
  ('Essencial', 'Sob consulta', 'Perfeito para equipas pequenas que querem experimentar o Team Building', '4 horas', '15-25 pessoas', 
   '["Treino funcional em grupo (30 min)", "2 desafios de team building", "Dinâmicas de integração", "Lanche saudável", "Certificado de participação"]', true),
  ('Profissional', 'Sob consulta', 'Ideal para empresas que buscam a experiência completa Super Beast', '6 horas', '25-50 pessoas', 
   '["Treino funcional completo (45 min)", "4 desafios de team building", "Corrida com obstáculos", "Dinâmicas avançadas de autoconhecimento", "Confraternização com churrasco", "Prémios e reconhecimentos", "Vídeo do evento"]', true),
  ('Premium', 'Sob consulta', 'Experiência completa para grandes empresas e eventos corporativos especiais', '8 horas', '50+ pessoas', 
   '["Programa completo personalizado", "Coaching individual para líderes", "Actividades customizadas", "Troféus personalizados", "Vídeo promocional profissional", "Catering completo", "Acompanhamento pós-evento (30 dias)", "Relatório de resultados"]', true)
ON CONFLICT DO NOTHING;

-- 4. Inserir algumas imagens de exemplo na galeria
INSERT INTO gallery_images (title, description, category, image_url)
VALUES 
  ('Treino Funcional em Grupo', 'Participantes realizando treino funcional intenso', 'treino', '/placeholder.svg?height=300&width=300&text=Treino+Funcional'),
  ('Desafio de Team Building', 'Equipa superando desafios juntos', 'desafios', '/placeholder.svg?height=300&width=300&text=Desafios+Equipa'),
  ('União de Equipas', 'Momento de união e celebração', 'equipas', '/placeholder.svg?height=300&width=300&text=União+Equipas'),
  ('Confraternização Final', 'Momento de confraternização e networking', 'confraternizacao', '/placeholder.svg?height=300&width=300&text=Confraternização'),
  ('Corrida Super Beast', 'Corrida com obstáculos desafiadores', 'desafios', '/placeholder.svg?height=300&width=300&text=Corrida+Super+Beast'),
  ('Workout Intenso', 'Treino de alta intensidade', 'treino', '/placeholder.svg?height=300&width=300&text=Workout+Intenso'),
  ('Dinâmicas de Grupo', 'Atividades de integração e autoconhecimento', 'equipas', '/placeholder.svg?height=300&width=300&text=Dinâmicas+Grupo'),
  ('Entrega de Prémios', 'Cerimónia de entrega de prémios', 'confraternizacao', '/placeholder.svg?height=300&width=300&text=Entrega+Prémios')
ON CONFLICT DO NOTHING;

-- 5. Criar funções para manter estatísticas atualizadas
CREATE OR REPLACE FUNCTION update_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE statistics SET total_messages = total_messages + 1, last_updated = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE statistics SET total_messages = total_messages - 1, last_updated = NOW();
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_active_plans()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE statistics SET active_plans = (SELECT COUNT(*) FROM plans WHERE active = TRUE), last_updated = NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_gallery_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE statistics SET gallery_images = gallery_images + 1, last_updated = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE statistics SET gallery_images = gallery_images - 1, last_updated = NOW();
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar triggers
DROP TRIGGER IF EXISTS message_inserted_trigger ON contact_messages;
CREATE TRIGGER message_inserted_trigger
AFTER INSERT ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_message_count();

DROP TRIGGER IF EXISTS message_deleted_trigger ON contact_messages;
CREATE TRIGGER message_deleted_trigger
AFTER DELETE ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_message_count();

DROP TRIGGER IF EXISTS plan_inserted_trigger ON plans;
CREATE TRIGGER plan_inserted_trigger
AFTER INSERT OR UPDATE OR DELETE ON plans
FOR EACH ROW
EXECUTE FUNCTION update_active_plans();

DROP TRIGGER IF EXISTS gallery_inserted_trigger ON gallery_images;
CREATE TRIGGER gallery_inserted_trigger
AFTER INSERT ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_gallery_count();

DROP TRIGGER IF EXISTS gallery_deleted_trigger ON gallery_images;
CREATE TRIGGER gallery_deleted_trigger
AFTER DELETE ON gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_gallery_count();

-- 7. Configurar políticas de segurança (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Políticas para planos (leitura pública, escrita apenas para admins)
DROP POLICY IF EXISTS "Plans are viewable by everyone" ON plans;
CREATE POLICY "Plans are viewable by everyone" ON plans FOR SELECT USING (true);

-- Políticas para galeria (leitura pública, escrita apenas para admins)
DROP POLICY IF EXISTS "Gallery images are viewable by everyone" ON gallery_images;
CREATE POLICY "Gallery images are viewable by everyone" ON gallery_images FOR SELECT USING (true);

-- Políticas para mensagens de contato (inserção pública, leitura apenas para admins)
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- Políticas para estatísticas (leitura pública limitada)
DROP POLICY IF EXISTS "Statistics are viewable by everyone" ON statistics;
CREATE POLICY "Statistics are viewable by everyone" ON statistics FOR SELECT USING (true);

-- 8. Criar bucket para imagens (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de imagens
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
CREATE POLICY "Images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
CREATE POLICY "Anyone can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
CREATE POLICY "Anyone can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images');

SELECT 'Database adaptation completed successfully!' as status;
