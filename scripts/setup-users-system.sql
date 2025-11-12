-- Script para configurar o sistema de usuários com super admin
-- Execute este script no seu banco de dados Supabase

-- 1. Criar tabela de usuários
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

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- 3. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Inserir usuário super admin padrão
-- IMPORTANTE: Esta senha é apenas para desenvolvimento
-- Em produção, use uma senha forte e real
INSERT INTO users (email, password_hash, role, is_active) 
VALUES (
    'admin@superbeast.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', -- admin123
    'super_admin', 
    true
) ON CONFLICT (email) DO NOTHING;

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de segurança
-- Super admins podem ver todos os usuários
CREATE POLICY "super_admins_can_view_all_users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Super admins podem inserir novos usuários
CREATE POLICY "super_admins_can_insert_users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Super admins podem atualizar todos os usuários
CREATE POLICY "super_admins_can_update_users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Super admins podem deletar usuários (exceto a si mesmos)
CREATE POLICY "super_admins_can_delete_users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
        AND id != auth.uid()
    );

-- Usuários podem ver seus próprios dados
CREATE POLICY "users_can_view_own_data" ON users
    FOR SELECT USING (id = auth.uid());

-- Usuários podem atualizar seus próprios dados (exceto role)
-- CORRIGIDO: Removida referência a OLD.role que não é suportada
CREATE POLICY "users_can_update_own_data" ON users
    FOR UPDATE USING (id = auth.uid());

-- 8. Funções auxiliares
-- Verificar se usuário é super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se usuário é admin (qualquer tipo)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND (role = 'admin' OR role = 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Verificar configuração
SELECT 
    'Configuração concluída!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM users;
