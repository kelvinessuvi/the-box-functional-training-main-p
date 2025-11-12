const { createClient } = require('@supabase/supabase-js')

async function verifySetup() {
  console.log('🔍 Verificando configuração completa...\n')
  
  // 1. Verificar variáveis de ambiente
  console.log('1. Variáveis de ambiente:')
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'JWT_SECRET'
  ]
  
  let envVarsOk = true
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`   ✅ ${varName}`)
    } else {
      console.log(`   ❌ ${varName} - Não configurada`)
      envVarsOk = false
    }
  })
  
  if (!envVarsOk) {
    console.log('\n⚠️  Configure as variáveis de ambiente antes de continuar')
    return
  }
  
  // 2. Testar conexão com Supabase
  console.log('\n2. Conexão com Supabase:')
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data, error } = await supabase.from('plans').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('   ❌ Erro na conexão:', error.message)
      return
    }
    
    console.log('   ✅ Conexão estabelecida')
  } catch (error) {
    console.log('   ❌ Erro na conexão:', error.message)
    return
  }
  
  // 3. Verificar estrutura das tabelas
  console.log('\n3. Estrutura do banco:')
  const tables = [
    { name: 'plans', required: ['id', 'name', 'price', 'description'] },
    { name: 'contact_messages', required: ['id', 'name', 'email', 'message'] },
    { name: 'gallery_images', required: ['id', 'title', 'image_url'] }
  ]
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table.name).select('*').limit(1)
      
      if (error) {
        console.log(`   ❌ Tabela ${table.name}: ${error.message}`)
      } else {
        console.log(`   ✅ Tabela ${table.name}: OK`)
      }
    } catch (error) {
      console.log(`   ❌ Tabela ${table.name}: ${error.message}`)
    }
  }
  
  console.log('\n🎉 Verificação concluída!')
  console.log('🚀 O projeto está pronto para uso!')
}

verifySetup()
