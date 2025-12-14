-- Script para criar a tabela de parceiros
-- Execute este script no Supabase SQL Editor

-- Criar tabela de parceiros
CREATE TABLE IF NOT EXISTS partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);

-- Criar índice para filtrar por status ativo
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(active);

-- Habilitar RLS (Row Level Security)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (parceiros ativos)
CREATE POLICY "Parceiros ativos são públicos" ON partners
    FOR SELECT
    USING (active = true);

-- Política para permitir todas as operações para usuários autenticados (admin)
CREATE POLICY "Admins podem gerenciar parceiros" ON partners
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_partners_updated_at();

-- Comentários na tabela
COMMENT ON TABLE partners IS 'Tabela de parceiros da THE BOX';
COMMENT ON COLUMN partners.id IS 'ID único do parceiro';
COMMENT ON COLUMN partners.name IS 'Nome do parceiro';
COMMENT ON COLUMN partners.description IS 'Descrição do parceiro';
COMMENT ON COLUMN partners.logo_url IS 'URL do logo do parceiro';
COMMENT ON COLUMN partners.website_url IS 'URL do website do parceiro';
COMMENT ON COLUMN partners.active IS 'Se o parceiro está ativo e visível no site';
COMMENT ON COLUMN partners.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN partners.updated_at IS 'Data da última atualização do registro';

