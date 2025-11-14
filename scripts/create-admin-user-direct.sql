-- =====================================================
-- THE BOX Functional Training - Criar Usuário Admin
-- Execute este script no SQL Editor do Supabase
-- =====================================================
-- IMPORTANTE: Este script cria o usuário administrador
-- Email: geral@theboxft.com
-- Senha: @The-Box-2025
-- 
-- Para gerar o hash da senha, use um script Node.js ou online:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('@The-Box-2025', 12);
-- =====================================================

-- Verificar se a tabela users existe e tem a coluna password_hash
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Tabela users não existe! Execute primeiro scripts/setup-users-system.sql ou scripts/01-create-tables.sql';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        RAISE EXCEPTION 'Coluna password_hash não existe na tabela users! Execute primeiro scripts/setup-users-system.sql ou scripts/01-create-tables.sql';
    END IF;
END $$;

-- Verificar se o usuário já existe
DO $$
DECLARE
    user_exists BOOLEAN;
    pwd_hash TEXT;
BEGIN
    -- Hash da senha '@The-Box-2025' gerado com bcrypt (salt rounds 12)
    pwd_hash := '$2b$12$pDnMgeLVB9kOmuUrZclU8OBu100bvJh7i0PNtAa3KGBjQtihD02ke';
    
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'geral@theboxft.com') INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'Usuário geral@theboxft.com já existe. Atualizando senha...';
        
        -- Atualizar senha existente
        UPDATE users 
        SET password_hash = pwd_hash,
            role = 'super_admin',
            is_active = true,
            updated_at = NOW()
        WHERE email = 'geral@theboxft.com';
        
        RAISE NOTICE 'Senha atualizada com sucesso!';
    ELSE
        RAISE NOTICE 'Criando novo usuário administrador...';
        
        -- Inserir novo usuário
        INSERT INTO users (email, password_hash, role, is_active) 
        VALUES (
            'geral@theboxft.com', 
            pwd_hash, -- '@The-Box-2025'
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
WHERE email = 'geral@theboxft.com';

