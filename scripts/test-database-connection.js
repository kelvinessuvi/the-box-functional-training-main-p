const { createClient } = require('@supabase/supabase-js')

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testando estrutura do banco de dados...')
    
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️  Configuração do Supabase não encontrada')
      console.log('Execute: npm run setup-env')
      return
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Testar cada tabela
    const tables = ['plans', 'contact_messages', 'gallery_images']
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`)
        } else {
          console.log(`✅ Tabela ${table}: ${count || 0} registros`)
        }
      } catch (tableError) {
        console.log(`❌ Tabela ${table}: ${tableError.message}`)
      }
    }
    
    console.log('\n🎉 Teste de estrutura concluído!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testDatabaseConnection()
