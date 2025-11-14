-- =====================================================
-- THE BOX Functional Training - Setup Completo
-- Execute ESTE script único no SQL Editor do Supabase
-- Este script faz tudo do zero, incluindo criar o usuário admin
-- =====================================================

-- =====================================================
-- PARTE 1: EXTENSÕES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PARTE 2: CRIAR TABELAS
-- =====================================================

-- Tabela de usuários (sistema de autenticação)
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id)
);

-- Tabela de configurações do site
DROP TABLE IF EXISTS site_settings CASCADE;
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  working_hours TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de modalidades
DROP TABLE IF EXISTS modalities CASCADE;
CREATE TABLE modalities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de instrutores
DROP TABLE IF EXISTS instructors CASCADE;
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  photo_url TEXT,
  specialties JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de filiais
DROP TABLE IF EXISTS branches CASCADE;
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Angola',
  phone TEXT,
  email TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens da galeria
DROP TABLE IF EXISTS gallery_images CASCADE;
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens de contato
DROP TABLE IF EXISTS contact_messages CASCADE;
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estatísticas
DROP TABLE IF EXISTS statistics CASCADE;
CREATE TABLE statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monthly_views INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  active_modalities INTEGER DEFAULT 0,
  active_instructors INTEGER DEFAULT 0,
  active_branches INTEGER DEFAULT 0,
  gallery_images INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PARTE 3: ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_modalities_active ON modalities(active);
CREATE INDEX IF NOT EXISTS idx_instructors_active ON instructors(active);
CREATE INDEX IF NOT EXISTS idx_branches_active ON branches(active);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(read);

-- =====================================================
-- PARTE 4: FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modalities_updated_at ON modalities;
CREATE TRIGGER update_modalities_updated_at 
    BEFORE UPDATE ON modalities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_instructors_updated_at ON instructors;
CREATE TRIGGER update_instructors_updated_at 
    BEFORE UPDATE ON instructors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
CREATE TRIGGER update_branches_updated_at 
    BEFORE UPDATE ON branches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON gallery_images;
CREATE TRIGGER update_gallery_images_updated_at 
    BEFORE UPDATE ON gallery_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at 
    BEFORE UPDATE ON contact_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar contadores de estatísticas
CREATE OR REPLACE FUNCTION update_message_count()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (total_messages, last_updated)
        VALUES (CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END, NOW())
        RETURNING id INTO stats_id;
    ELSE
        IF TG_OP = 'INSERT' THEN
            UPDATE statistics 
            SET total_messages = total_messages + 1, last_updated = NOW()
            WHERE id = stats_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE statistics 
            SET total_messages = GREATEST(0, total_messages - 1), last_updated = NOW()
            WHERE id = stats_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_active_modalities()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (active_modalities, last_updated)
        VALUES ((SELECT COUNT(*) FROM modalities WHERE active = TRUE), NOW())
        RETURNING id INTO stats_id;
    ELSE
        UPDATE statistics 
        SET active_modalities = (SELECT COUNT(*) FROM modalities WHERE active = TRUE), 
            last_updated = NOW()
        WHERE id = stats_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_active_instructors()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (active_instructors, last_updated)
        VALUES ((SELECT COUNT(*) FROM instructors WHERE active = TRUE), NOW())
        RETURNING id INTO stats_id;
    ELSE
        UPDATE statistics 
        SET active_instructors = (SELECT COUNT(*) FROM instructors WHERE active = TRUE), 
            last_updated = NOW()
        WHERE id = stats_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_active_branches()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (active_branches, last_updated)
        VALUES ((SELECT COUNT(*) FROM branches WHERE active = TRUE), NOW())
        RETURNING id INTO stats_id;
    ELSE
        UPDATE statistics 
        SET active_branches = (SELECT COUNT(*) FROM branches WHERE active = TRUE), 
            last_updated = NOW()
        WHERE id = stats_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_gallery_count()
RETURNS TRIGGER AS $$
DECLARE
    stats_id UUID;
BEGIN
    SELECT id INTO stats_id FROM statistics LIMIT 1;
    
    IF stats_id IS NULL THEN
        INSERT INTO statistics (gallery_images, last_updated)
        VALUES (CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END, NOW())
        RETURNING id INTO stats_id;
    ELSE
        IF TG_OP = 'INSERT' THEN
            UPDATE statistics 
            SET gallery_images = gallery_images + 1, last_updated = NOW()
            WHERE id = stats_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE statistics 
            SET gallery_images = GREATEST(0, gallery_images - 1), last_updated = NOW()
            WHERE id = stats_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para estatísticas
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

DROP TRIGGER IF EXISTS modality_inserted_trigger ON modalities;
CREATE TRIGGER modality_inserted_trigger
    AFTER INSERT OR UPDATE OR DELETE ON modalities
    FOR EACH ROW
    EXECUTE FUNCTION update_active_modalities();

DROP TRIGGER IF EXISTS instructor_inserted_trigger ON instructors;
CREATE TRIGGER instructor_inserted_trigger
    AFTER INSERT OR UPDATE OR DELETE ON instructors
    FOR EACH ROW
    EXECUTE FUNCTION update_active_instructors();

DROP TRIGGER IF EXISTS branch_inserted_trigger ON branches;
CREATE TRIGGER branch_inserted_trigger
    AFTER INSERT OR UPDATE OR DELETE ON branches
    FOR EACH ROW
    EXECUTE FUNCTION update_active_branches();

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

-- =====================================================
-- PARTE 5: RLS (Row Level Security)
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "modalities_are_viewable_by_everyone" ON modalities;
CREATE POLICY "modalities_are_viewable_by_everyone" ON modalities 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "instructors_are_viewable_by_everyone" ON instructors;
CREATE POLICY "instructors_are_viewable_by_everyone" ON instructors 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "branches_are_viewable_by_everyone" ON branches;
CREATE POLICY "branches_are_viewable_by_everyone" ON branches 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "gallery_images_are_viewable_by_everyone" ON gallery_images;
CREATE POLICY "gallery_images_are_viewable_by_everyone" ON gallery_images 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anyone_can_insert_contact_messages" ON contact_messages;
CREATE POLICY "anyone_can_insert_contact_messages" ON contact_messages 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "statistics_are_viewable_by_everyone" ON statistics;
CREATE POLICY "statistics_are_viewable_by_everyone" ON statistics 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_are_viewable_by_everyone" ON site_settings;
CREATE POLICY "site_settings_are_viewable_by_everyone" ON site_settings 
  FOR SELECT USING (true);

-- =====================================================
-- PARTE 6: DADOS INICIAIS
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
VALUES (0, 0, 0, 0, 0, 0);

-- Inserir configurações padrão do site
INSERT INTO site_settings (
  id, email, phone, location, working_hours, company_name, description
) VALUES (
  1,
  'geral@theboxacademy.com',
  '+244 923 525 886',
  'Luanda e Lisboa',
  'Seg-Sex: 08:00-21:00',
  'THE BOX Functional Training',
  'Aqui o Sistema é Bruto. Academia de Artes Marciais com foco em Jiu-Jitsu, oferecendo treinos de alta qualidade e desenvolvimento pessoal em Angola e Portugal.'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  working_hours = EXCLUDED.working_hours,
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  updated_at = NOW();

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

-- =====================================================
-- PARTE 7: CRIAR USUÁRIO ADMIN
-- =====================================================

-- Hash da senha '@The-Box-2025' gerado com bcrypt (salt rounds 12)
INSERT INTO users (email, password_hash, role, is_active) 
VALUES (
  'geral@theboxft.com', 
  '$2b$12$pDnMgeLVB9kOmuUrZclU8OBu100bvJh7i0PNtAa3KGBjQtihD02ke',
  'super_admin', 
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- =====================================================
-- PARTE 8: VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
  'Setup concluído com sucesso!' as status,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE email = 'geral@theboxft.com') as admin_user,
  (SELECT COUNT(*) FROM branches) as total_branches,
  (SELECT COUNT(*) FROM statistics) as statistics_count;

SELECT 
  'Usuário admin criado!' as status,
  email,
  role,
  is_active,
  created_at
FROM users 
WHERE email = 'geral@theboxft.com';

