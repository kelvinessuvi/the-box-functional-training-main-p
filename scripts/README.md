# Scripts de Setup - THE BOX Functional Training

Este diretório contém os scripts SQL necessários para configurar o banco de dados do projeto THE BOX no Supabase.

## 📋 Ordem de Execução

Execute os scripts no SQL Editor do Supabase **nesta ordem**:

### 1. `01-create-tables.sql`
Cria todas as tabelas necessárias:
- `users` - Sistema de autenticação
- `site_settings` - Configurações do site
- `modalities` - Modalidades oferecidas
- `instructors` - Instrutores da academia
- `branches` - Filiais da THE BOX
- `gallery_images` - Galeria de imagens
- `contact_messages` - Mensagens de contato
- `statistics` - Estatísticas do site

**Inclui:** Índices, RLS e políticas de segurança básicas.

### 2. `setup-users-system.sql`
Configura o sistema de usuários:
- Funções auxiliares
- Triggers para `updated_at`
- Políticas RLS para a tabela `users`

### 3. `02-create-functions.sql`
Cria funções e triggers para:
- Atualização automática de `updated_at`
- Contadores de estatísticas (mensagens, modalidades, instrutores, filiais, galeria)

### 4. `create-settings-table.sql`
Insere as configurações iniciais do site (pode ser executado mesmo que a tabela já exista).

### 5. `03-seed-data.sql`
Insere dados iniciais:
- Estatísticas zeradas
- 4 filiais da THE BOX (Mulemba, Miramar, Bairro Popular, Lisboa)

**Nota:** Instrutores e Modalidades serão adicionados pelo admin através do painel.

### 6. `create-admin-user-direct.sql`
Cria o usuário administrador inicial:
- **Email:** `geral@theboxft.com`
- **Senha:** `@The-Box-2025`
- **Role:** `super_admin`

## ⚠️ Importante

1. **Certifique-se de executar os scripts na ordem correta**
2. **O usuário admin será criado no último script** - use essas credenciais para acessar o painel administrativo
3. **Após o setup inicial**, você pode adicionar instrutores, modalidades e imagens através do painel admin
4. **As políticas RLS permitem:**
   - Leitura pública de modalidades, instrutores, filiais e galeria
   - Inserção pública de mensagens de contato
   - Todas as operações de escrita (CREATE, UPDATE, DELETE) devem ser feitas através do painel admin autenticado

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema (admin)
- **modalities** - Modalidades oferecidas (ex: Jiu-Jitsu, Muay Thai)
- **instructors** - Instrutores da academia
- **branches** - Filiais da THE BOX
- **gallery_images** - Imagens da galeria (categorias: instrutores, aulas, eventos)
- **contact_messages** - Mensagens recebidas pelo formulário de contato
- **site_settings** - Configurações gerais do site
- **statistics** - Estatísticas atualizadas automaticamente

## 📝 Notas

- Todos os scripts são idempotentes (podem ser executados múltiplas vezes sem causar erros)
- Use `ON CONFLICT DO NOTHING` onde aplicável
- Os triggers atualizam automaticamente os contadores de estatísticas

## 🔧 Troubleshooting

Se encontrar erros:

1. Verifique se executou os scripts na ordem correta
2. Certifique-se de que a extensão `uuid-ossp` está habilitada (já incluída no script 01)
3. Verifique as políticas RLS se tiver problemas de acesso
4. O Service Role Key deve ter permissões para ignorar RLS quando necessário

---

**Desenvolvido para THE BOX Functional Training**  
*Aqui o Sistema é Bruto*

