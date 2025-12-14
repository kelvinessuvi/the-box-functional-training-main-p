-- Criar tabela de fundadores
CREATE TABLE IF NOT EXISTS founders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(500),
  role VARCHAR(100) DEFAULT 'Co-Fundador',
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para ordenação
CREATE INDEX IF NOT EXISTS idx_founders_display_order ON founders(display_order);

-- Habilitar RLS (Row Level Security)
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Permitir leitura publica de fundadores" ON founders
  FOR SELECT USING (true);

-- Política para inserção (apenas usuários autenticados)
CREATE POLICY "Permitir insercao para usuarios autenticados" ON founders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (apenas usuários autenticados)
CREATE POLICY "Permitir atualizacao para usuarios autenticados" ON founders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão (apenas usuários autenticados)
CREATE POLICY "Permitir exclusao para usuarios autenticados" ON founders
  FOR DELETE USING (auth.role() = 'authenticated');

-- Inserir fundadores iniciais (sem foto)
INSERT INTO founders (name, full_name, role, display_order) VALUES
  ('Mario Stefan', 'Mario Stefan Pitagros de Melo Araujo', 'Co-Fundador', 1),
  ('Wilson Inocencio', 'Wilson Inocencio', 'Co-Fundador', 2)
ON CONFLICT DO NOTHING;
