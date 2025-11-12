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

async function diagnose() {
  console.log('🔍 Diagnóstico do Sistema de Login\n')
  console.log('=' .repeat(50))

  // 1. Verificar variáveis de ambiente
  console.log('\n1. Verificando variáveis de ambiente...')
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const jwtSecret = process.env.JWT_SECRET

  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`   JWT_SECRET: ${jwtSecret ? '✅ Configurado' : '❌ Não configurado'}`)

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Variáveis de ambiente essenciais faltando!')
    return
  }

  // 2. Testar conexão com Supabase
  console.log('\n2. Testando conexão com Supabase...')
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Verificar se consegue acessar a tabela users
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })

    if (testError) {
      console.log(`   ❌ Erro ao conectar: ${testError.message}`)
      console.log(`   Código: ${testError.code}`)
      if (testError.code === '42P01') {
        console.log('\n   ⚠️  Tabela users não existe!')
        console.log('   Execute: scripts/setup-users-system.sql no Supabase')
      }
      return
    }
    console.log('   ✅ Conexão estabelecida')

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
    return
  }

  // 3. Verificar se o usuário existe
  console.log('\n3. Verificando usuário admin...')
  const adminEmail = 'admin@superbeast.com'

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_active, password_hash, created_at')
      .eq('email', adminEmail)
      .single()

    if (userError) {
      console.log(`   ❌ Erro ao buscar usuário: ${userError.message}`)
      console.log(`   Código: ${userError.code}`)
      if (userError.code === 'PGRST116') {
        console.log(`\n   ⚠️  Usuário não encontrado!`)
        console.log(`   Execute: scripts/create-admin-user-direct.sql no Supabase`)
      }
      return
    }

    if (!user) {
      console.log('   ❌ Usuário não encontrado')
      console.log(`\n   Execute: scripts/create-admin-user-direct.sql no Supabase`)
      return
    }

    console.log('   ✅ Usuário encontrado:')
    console.log(`      - Email: ${user.email}`)
    console.log(`      - Role: ${user.role}`)
    console.log(`      - Ativo: ${user.is_active ? 'Sim' : 'Não'}`)
    console.log(`      - Criado em: ${user.created_at}`)
    console.log(`      - Tem hash de senha: ${user.password_hash ? 'Sim' : 'Não'}`)

    // 4. Testar senha
    console.log('\n4. Testando senha "admin123"...')
    if (!user.password_hash) {
      console.log('   ❌ Hash de senha não encontrado!')
      console.log('\n   Execute: scripts/create-admin-user-direct.sql no Supabase')
      return
    }

    const testPassword = 'admin123'
    const isValid = await bcrypt.compare(testPassword, user.password_hash)

    if (isValid) {
      console.log('   ✅ Senha válida!')
    } else {
      console.log('   ❌ Senha inválida!')
      console.log('\n   O hash no banco não corresponde à senha "admin123"')
      console.log('   Execute: scripts/create-admin-user-direct.sql no Supabase para atualizar')
    }

    // 5. Verificar RLS (Row Level Security)
    console.log('\n5. Verificando políticas RLS...')
    const { data: policies, error: policyError } = await supabase
      .rpc('pg_policies', { table_name: 'users' })
      .select('*')

    if (policyError) {
      // Tentar verificar de outra forma
      const { data: testRead, error: readError } = await supabase
        .from('users')
        .select('email')
        .eq('email', adminEmail)
        .limit(1)

      if (readError && readError.message?.includes('policy')) {
        console.log('   ⚠️  Problema com políticas RLS')
        console.log('   O Service Role Key deve ter permissão para ler a tabela')
        console.log('   Verifique se SUPABASE_SERVICE_ROLE_KEY está correto')
      } else {
        console.log('   ✅ Sem problemas aparentes de RLS')
      }
    } else {
      console.log(`   Políticas encontradas: ${policies?.length || 0}`)
    }

    // 6. Testar autenticação completa
    console.log('\n6. Teste de autenticação completa...')
    const testLogin = {
      email: adminEmail,
      password: testPassword
    }

    console.log('   Simulando requisição de login...')
    console.log(`   Email: ${testLogin.email}`)
    console.log(`   Senha: ${testLogin.password}`)

    if (user.is_active && isValid) {
      console.log('   ✅ Tudo parece estar correto!')
      console.log('\n📋 Resumo:')
      console.log('   - Usuário existe no banco ✅')
      console.log('   - Senha está correta ✅')
      console.log('   - Usuário está ativo ✅')
      console.log('\n💡 Se ainda não consegue fazer login:')
      console.log('   1. Verifique os logs do servidor Next.js')
      console.log('   2. Verifique se o servidor foi reiniciado após criar o usuário')
      console.log('   3. Limpe os cookies do navegador e tente novamente')
    } else {
      if (!user.is_active) {
        console.log('   ❌ Usuário está inativo!')
      }
      if (!isValid) {
        console.log('   ❌ Senha está incorreta!')
      }
    }

  } catch (error) {
    console.log(`   ❌ Erro inesperado: ${error.message}`)
    console.error(error)
  }

  console.log('\n' + '='.repeat(50))
  console.log('\n✅ Diagnóstico concluído!\n')
}

diagnose().catch(console.error)

