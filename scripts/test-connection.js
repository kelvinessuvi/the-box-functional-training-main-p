const { createClient } = require('@supabase/supabase-js')

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️  Variáveis de ambiente não configuradas')
      console.log('SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada')
      console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Configurada' : '❌ Não configurada')
      return
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Testar conexão básica
    const { data, error } = await supabase.from('plans').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message)
      return
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    console.log('📊 Número de planos na base:', data?.length || 0)
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message)
  }
}

testConnection()
