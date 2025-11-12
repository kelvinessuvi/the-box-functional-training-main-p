-- Script SQL para criar usuário administrador diretamente no Supabase
-- Execute este script no SQL Editor do Supabase

-- Gerar hash da senha "admin123" com bcrypt (salt rounds 12)
-- Este hash foi gerado previamente usando bcryptjs

-- Verificar se a tabela users existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Tabela users não existe! Execute primeiro scripts/setup-users-system.sql';
    END IF;
END $$;

-- Verificar se o usuário já existe
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@superbeast.com') INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'Usuário admin@superbeast.com já existe. Atualizando senha...';
        
        -- Atualizar senha existente
        UPDATE users 
        SET password_hash = '$2b$12$a3kNBmTpm7el5pDaZGqJtuamprx.V.uloxz9RtNRxau.IAcu17N8y',
            role = 'super_admin',
            is_active = true,
            updated_at = NOW()
        WHERE email = 'admin@superbeast.com';
        
        RAISE NOTICE 'Senha atualizada com sucesso!';
    ELSE
        RAISE NOTICE 'Criando novo usuário administrador...';
        
        -- Inserir novo usuário
        INSERT INTO users (email, password_hash, role, is_active) 
        VALUES (
            'admin@superbeast.com', 
            '$2b$12$a3kNBmTpm7el5pDaZGqJtuamprx.V.uloxz9RtNRxau.IAcu17N8y', -- admin123
            'super_admin', 
            true
        );
        
        RAISE NOTICE 'Usuário criado com sucesso!';
    END IF;
END $$;

-- Verificar resultado
SELECT 
    'Usuário criado/atualizado!' as status,
    email,
    role,
    is_active,
    created_at
FROM users 
WHERE email = 'admin@superbeast.com';

