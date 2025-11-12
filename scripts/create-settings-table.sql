-- Criar tabela de configurações do site
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

-- Inserir configurações padrão
INSERT INTO site_settings (
  id, email, phone, location, working_hours, company_name, description
) VALUES (
  1,
  'info@fitem14semanas.com',
  '+244 XXX XXX XXX',
  'Luanda, Angola',
  'Seg-Sex: 08:00-18:00',
  'Super Beast - Fit Em 14 Semanas',
  'Transformamos equipas através do fitness, entretenimento e desenvolvimento pessoal em Angola.'
) ON CONFLICT (id) DO NOTHING;

-- Criar política RLS (Row Level Security)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (todos podem ver as configurações)
CREATE POLICY "site_settings_select_policy" ON site_settings
  FOR SELECT USING (true);

-- Política para permitir atualização apenas por administradores autenticados
CREATE POLICY "site_settings_update_policy" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir inserção apenas por administradores autenticados
CREATE POLICY "site_settings_insert_policy" ON site_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verificar se a tabela foi criada
SELECT * FROM site_settings;
