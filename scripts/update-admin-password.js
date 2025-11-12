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

async function updateAdminPassword() {
  console.log('🔧 Atualizando senha do administrador...\n')

  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const adminEmail = 'admin@superbeast.com'
  const adminPassword = 'admin123'

  try {
    // Gerar hash da senha
    console.log('1. Gerando novo hash da senha "admin123"...')
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds)
    console.log(`   Hash gerado: ${passwordHash.substring(0, 30)}...`)

    // Verificar se usuário existe
    console.log('\n2. Verificando se usuário existe...')
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', adminEmail)
      .single()

    if (checkError || !existingUser) {
      console.error('   ❌ Usuário não encontrado!')
      console.log(`   Erro: ${checkError?.message}`)
      console.log('\n   Execute primeiro: node scripts/create-admin-user.js')
      process.exit(1)
    }

    console.log(`   ✅ Usuário encontrado: ${existingUser.email} (${existingUser.role})`)

    // Atualizar senha
    console.log('\n3. Atualizando senha no banco de dados...')
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('email', adminEmail)
      .select()

    if (error) {
      console.error('   ❌ Erro ao atualizar senha:', error.message)
      console.error('   Código:', error.code)
      console.error('   Detalhes:', error)
      process.exit(1)
    }

    if (!data || data.length === 0) {
      console.error('   ❌ Nenhum registro foi atualizado!')
      process.exit(1)
    }

    console.log('   ✅ Senha atualizada com sucesso!')

    // Verificar se a senha funciona
    console.log('\n4. Verificando se a nova senha funciona...')
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('email', adminEmail)
      .single()

    if (verifyUser) {
      const isValid = await bcrypt.compare(adminPassword, verifyUser.password_hash)
      if (isValid) {
        console.log('   ✅ Senha verificada com sucesso!')
      } else {
        console.log('   ❌ Erro: Senha não corresponde ao hash!')
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📋 Credenciais de acesso:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Senha: ${adminPassword}`)
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n')

  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

updateAdminPassword()

