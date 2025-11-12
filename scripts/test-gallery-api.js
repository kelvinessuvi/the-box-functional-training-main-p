// Script para testar a API da galeria
// Execute com: node scripts/test-gallery-api.js

const BASE_URL = 'http://localhost:3000';

async function testGalleryAPI() {
  console.log('🧪 Testando API da Galeria...\n');

  try {
    // 1. Testar GET - Listar imagens
    console.log('1. Testando GET /api/gallery...');
    const getResponse = await fetch(`${BASE_URL}/api/gallery`);
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Dados:', getData);
    console.log('');

    // 2. Testar POST - Adicionar imagem (sem autenticação - deve falhar)
    console.log('2. Testando POST /api/gallery (sem autenticação)...');
    const formData = new FormData();
    formData.append('title', 'Teste API');
    formData.append('description', 'Descrição de teste');
    formData.append('category', 'teste');

    const postResponse = await fetch(`${BASE_URL}/api/gallery`, {
      method: 'POST',
      body: formData
    });
    console.log('Status:', postResponse.status);
    const postData = await postResponse.json();
    console.log('Resposta:', postData);
    console.log('');

    // 3. Testar com filtro de categoria
    console.log('3. Testando GET /api/gallery?category=treino...');
    const filterResponse = await fetch(`${BASE_URL}/api/gallery?category=treino`);
    const filterData = await filterResponse.json();
    console.log('Status:', filterResponse.status);
    console.log('Dados filtrados:', filterData);
    console.log('');

    console.log('✅ Testes concluídos!');
    console.log('\n📝 Notas:');
    console.log('- POST deve retornar 401 (não autorizado) sem login');
    console.log('- GET deve funcionar normalmente');
    console.log('- Para testar upload real, faça login no painel admin');

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

// Executar testes
testGalleryAPI();
