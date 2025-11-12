const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 12;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Senha:', password);
    console.log('Hash gerado:', hash);
    
    // Verificar se o hash funciona
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash válido:', isValid);
    
    // Gerar comando SQL para atualizar
    console.log('\n--- COMANDO SQL PARA EXECUTAR ---');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@superbeast.com';`);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

generateHash();
