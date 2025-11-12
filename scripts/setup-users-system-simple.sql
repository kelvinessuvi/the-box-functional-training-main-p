-- Script SIMPLIFICADO para configurar o sistema de usuários
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

-- 2. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Inserir usuário super admin padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO users (email, password_hash, role, is_active) 
VALUES (
    'admin@superbeast.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq',
    'super_admin', 
    true
) ON CONFLICT (email) DO NOTHING;

-- 6. Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Políticas SIMPLES e compatíveis
-- Permitir que super admins vejam todos os usuários
CREATE POLICY "super_admins_view_all" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Permitir que super admins criem usuários
CREATE POLICY "super_admins_create_users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Permitir que super admins atualizem usuários
CREATE POLICY "super_admins_update_users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Permitir que super admins deletem usuários (exceto a si mesmos)
CREATE POLICY "super_admins_delete_users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super_admin'
        )
        AND id != auth.uid()
    );

-- Permitir que usuários vejam seus próprios dados
CREATE POLICY "users_view_own" ON users
    FOR SELECT USING (id = auth.uid());

-- Permitir que usuários atualizem seus próprios dados
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid());

-- 8. Verificar configuração
SELECT 
    'Configuração concluída!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM users;
