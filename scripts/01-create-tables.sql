-- =====================================================
-- THE BOX Functional Training - Criação das Tabelas
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (sistema de autenticação)
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS site_settings (
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

-- Tabela de modalidades (substitui "planos")
CREATE TABLE IF NOT EXISTS modalities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de instrutores
CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  photo_url TEXT,
  specialties JSONB, -- Array de especialidades/faixas
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de filiais
CREATE TABLE IF NOT EXISTS branches (
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

-- Tabela de imagens da galeria (mantida para instrutores, aulas e eventos)
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'instrutores', 'aulas', 'eventos'
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens de contato
CREATE TABLE IF NOT EXISTS contact_messages (
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
CREATE TABLE IF NOT EXISTS statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monthly_views INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  active_modalities INTEGER DEFAULT 0,
  active_instructors INTEGER DEFAULT 0,
  active_branches INTEGER DEFAULT 0,
  gallery_images INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_modalities_active ON modalities(active);
CREATE INDEX IF NOT EXISTS idx_instructors_active ON instructors(active);
CREATE INDEX IF NOT EXISTS idx_branches_active ON branches(active);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(read);

-- Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para leitura pública
-- Modalidades - leitura pública
DROP POLICY IF EXISTS "modalities_are_viewable_by_everyone" ON modalities;
CREATE POLICY "modalities_are_viewable_by_everyone" ON modalities 
  FOR SELECT USING (true);

-- Instrutores - leitura pública
DROP POLICY IF EXISTS "instructors_are_viewable_by_everyone" ON instructors;
CREATE POLICY "instructors_are_viewable_by_everyone" ON instructors 
  FOR SELECT USING (true);

-- Filiais - leitura pública
DROP POLICY IF EXISTS "branches_are_viewable_by_everyone" ON branches;
CREATE POLICY "branches_are_viewable_by_everyone" ON branches 
  FOR SELECT USING (true);

-- Galeria - leitura pública
DROP POLICY IF EXISTS "gallery_images_are_viewable_by_everyone" ON gallery_images;
CREATE POLICY "gallery_images_are_viewable_by_everyone" ON gallery_images 
  FOR SELECT USING (true);

-- Mensagens de contato - inserção pública, leitura apenas para admins
DROP POLICY IF EXISTS "anyone_can_insert_contact_messages" ON contact_messages;
CREATE POLICY "anyone_can_insert_contact_messages" ON contact_messages 
  FOR INSERT WITH CHECK (true);

-- Estatísticas - leitura pública
DROP POLICY IF EXISTS "statistics_are_viewable_by_everyone" ON statistics;
CREATE POLICY "statistics_are_viewable_by_everyone" ON statistics 
  FOR SELECT USING (true);

-- Configurações do site - leitura pública
DROP POLICY IF EXISTS "site_settings_are_viewable_by_everyone" ON site_settings;
CREATE POLICY "site_settings_are_viewable_by_everyone" ON site_settings 
  FOR SELECT USING (true);
