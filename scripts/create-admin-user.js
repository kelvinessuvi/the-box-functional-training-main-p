const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Ler variáveis de ambiente do .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        process.env[key] = value
      }
    })
  }
}

loadEnv()

async function createAdminUser() {
  console.log('🔧 Criando usuário administrador...\n')

  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas')
    console.log('\nCertifique-se de que o arquivo .env.local contém:')
    console.log('- SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL')
    console.log('- SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Email e senha do admin
  const adminEmail = 'admin@superbeast.com'
  const adminPassword = 'admin123'

  try {
    // Verificar se a tabela users existe
    console.log('1. Verificando tabela users...')
    const { data: tables, error: tableError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    if (tableError && tableError.code === '42P01') {
      console.log('   ⚠️  Tabela users não existe!')
      console.log('\n   Execute primeiro o script SQL: scripts/setup-users-system.sql')
      console.log('   no SQL Editor do Supabase.\n')
      process.exit(1)
    }

    console.log('   ✅ Tabela users existe')

    // Verificar se o usuário já existe
    console.log('\n2. Verificando se usuário admin existe...')
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('email', adminEmail)
      .single()

    if (existingUser && !userError) {
      console.log(`   ✅ Usuário já existe: ${existingUser.email}`)
      console.log(`   - Role: ${existingUser.role}`)
      console.log(`   - Ativo: ${existingUser.is_active ? 'Sim' : 'Não'}`)
      
      // Perguntar se quer atualizar a senha
      console.log('\n   Para atualizar a senha, execute:')
      console.log('   node scripts/update-admin-password.js\n')
      return
    }

    // Gerar hash da senha
    console.log('\n3. Gerando hash da senha...')
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds)
    console.log('   ✅ Hash gerado')

    // Criar usuário admin
    console.log('\n4. Criando usuário administrador...')
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: adminEmail,
        password_hash: passwordHash,
        role: 'super_admin',
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('   ❌ Erro ao criar usuário:', createError.message || JSON.stringify(createError))
      console.error('   Código:', createError.code)
      console.error('   Detalhes:', createError)
      
      if (createError.code === '23505') {
        console.log('\n   Usuário já existe no banco de dados.')
      } else if (createError.code === '42501' || createError.message?.includes('RLS')) {
        console.log('\n   ⚠️  Erro de permissão (RLS).')
        console.log('   O Service Role Key deve ter permissão para ignorar RLS.')
        console.log('   Certifique-se de usar SUPABASE_SERVICE_ROLE_KEY (não ANON_KEY)')
      } else if (createError.message?.includes('permission denied')) {
        console.log('\n   ⚠️  Erro de permissão.')
        console.log('   Execute o script SQL: scripts/setup-users-system.sql')
        console.log('   ou desabilite temporariamente RLS: ALTER TABLE users DISABLE ROW LEVEL SECURITY;')
      }
      process.exit(1)
    }

    console.log('   ✅ Usuário criado com sucesso!')
    console.log('\n📋 Credenciais de acesso:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Senha: ${adminPassword}`)
    console.log(`   Role: ${newUser.role}`)
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n')

  } catch (error) {
    console.error('\n❌ Erro inesperado:', error.message)
    console.error(error)
    process.exit(1)
  }
}

createAdminUser()

