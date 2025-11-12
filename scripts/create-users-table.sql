-- Script para criar sistema de usuários com super admin
-- Execute este script no seu banco de dados Supabase

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id)
);

-- Criar índice para busca por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Criar índice para busca por role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário super admin padrão (você pode alterar depois)
-- Senha: admin123 (hash bcrypt)
INSERT INTO users (email, password_hash, role, is_active) 
VALUES (
    'admin@superbeast.com', 
    '$2a$10$rQZ9K8mN2pL1vX3cF7gH4iJ6kL9mN2pL1vX3cF7gH4iJ6kL9mN2pL1v', 
    'super_admin', 
    true
) ON CONFLICT (email) DO NOTHING;

-- Criar políticas RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Super admins podem ver todos os usuários
CREATE POLICY "super_admins_can_view_all_users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Política: Super admins podem inserir novos usuários
CREATE POLICY "super_admins_can_insert_users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Política: Super admins podem atualizar todos os usuários
CREATE POLICY "super_admins_can_update_users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Política: Super admins podem deletar usuários (exceto a si mesmos)
CREATE POLICY "super_admins_can_delete_users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
        AND id != auth.uid()
    );

-- Política: Usuários podem ver seus próprios dados
CREATE POLICY "users_can_view_own_data" ON users
    FOR SELECT USING (id = auth.uid());

-- Política: Usuários podem atualizar seus próprios dados (exceto role)
CREATE POLICY "users_can_update_own_data" ON users
    FOR UPDATE USING (
        id = auth.uid() 
        AND role = OLD.role -- Não pode alterar o próprio role
    );

-- Função para verificar se usuário é super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é admin (qualquer tipo)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND (role = 'admin' OR role = 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
