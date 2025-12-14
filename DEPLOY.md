# 🚀 Guia de Deploy - Super Beast Website

Este guia explica como hospedar o projeto em produção.

## 📋 Pré-requisitos

Antes de hospedar, certifique-se de que:

1. ✅ O projeto funciona localmente (`npm run dev`)
2. ✅ Você tem uma conta na plataforma de hospedagem
3. ✅ O Supabase está configurado e funcionando
4. ✅ Você tem todas as variáveis de ambiente necessárias

---

## 🌐 Opções de Hospedagem

### **1. Vercel (Recomendado para Next.js)**

A Vercel é a plataforma recomendada para projetos Next.js.

#### Passo 1: Conectar o Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Importe seu repositório: `SuperKilson/Super-Beast-Website-final`
5. Escolha a branch `main`

#### Passo 2: Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione as seguintes variáveis de ambiente:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
ADMIN_EMAIL=admin@superbeast.com
ADMIN_PASSWORD=senha_segura_aqui
JWT_SECRET=sua_chave_secreta_jwt
```

**Como adicionar:**
1. Na página do projeto → **Settings** → **Environment Variables**
2. Clique em **"Add New"**
3. Adicione cada variável (uma por uma)
4. Selecione os ambientes: **Production**, **Preview**, **Development**
5. Salve

#### Passo 3: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (2-5 minutos)
3. Seu site estará disponível em: `https://seu-projeto.vercel.app`

#### Passo 4: Configurar Domínio (Opcional)

1. **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar DNS

---

### **2. Netlify**

#### Passo 1: Conectar Repositório

1. Acesse [netlify.com](https://netlify.com)
2. Faça login com GitHub
3. Clique em **"Add new site"** → **"Import an existing project"**
4. Selecione seu repositório e branch `main`

#### Passo 2: Configurar Build

**Build settings:**
- **Build command:** `npm run build`
- **Publish directory:** `.next`

#### Passo 3: Variáveis de Ambiente

1. **Site settings** → **Environment variables**
2. Adicione todas as variáveis de ambiente listadas acima

#### Passo 4: Deploy

Clique em **"Deploy site"** e aguarde.

---

### **3. Outras Plataformas**

#### Railway
- Similar ao Vercel
- Adicione variáveis de ambiente no dashboard

#### DigitalOcean App Platform
- Importe do GitHub
- Configure variáveis de ambiente
- Build command: `npm run build`

#### AWS Amplify
- Conecte o repositório
- Configure variáveis de ambiente
- Build settings automáticos para Next.js

---

## ⚙️ Configurações Importantes

### Variáveis de Ambiente Obrigatórias

Certifique-se de adicionar **todas** estas variáveis na plataforma de hospedagem:

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key

# Admin
ADMIN_EMAIL=admin@superbeast.com
ADMIN_PASSWORD=senha_segura
JWT_SECRET=sua_chave_secreta_jwt
```

**⚠️ IMPORTANTE:**
- Use senhas fortes em produção
- Gere um `JWT_SECRET` único: `openssl rand -base64 32`
- **NUNCA** compartilhe a `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔧 Configurações do Supabase para Produção

### 1. Configurar URL Permitida

No Supabase Dashboard:
1. **Settings** → **API**
2. Em **"URLs permitidas"**, adicione:
   - `https://seu-dominio.vercel.app`
   - `https://www.seu-dominio.com` (se tiver domínio)

### 2. Verificar RLS Policies

Certifique-se de que as políticas RLS estão configuradas:
- ✅ Leitura pública para `site_settings`
- ✅ Autenticação necessária para operações de admin
- ✅ Policies corretas para `gallery_images`, `plans`, `contact_messages`

### 3. Executar Scripts SQL

Execute os scripts SQL necessários no Supabase:
- `scripts/fix-all-triggers.sql` (se necessário)
- `scripts/create-admin-user-direct.sql` (para criar usuário admin)

---

## ✅ Checklist de Deploy

Antes de fazer deploy:

- [ ] Projeto funciona localmente
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Supabase configurado e acessível
- [ ] URL do site adicionada nas URLs permitidas do Supabase
- [ ] Scripts SQL executados no Supabase
- [ ] Usuário admin criado no banco de dados
- [ ] Testado login admin localmente
- [ ] Build funciona: `npm run build`

Após o deploy:

- [ ] Site carrega corretamente
- [ ] Página de contato funciona
- [ ] Login admin funciona
- [ ] Dashboard admin acessível
- [ ] CRUD operations funcionam (criar, editar, deletar)
- [ ] Imagens carregam corretamente
- [ ] Formulário de contato envia mensagens

---

## 🐛 Troubleshooting

### Build Fails

**Erro:** `Module not found`
- **Solução:** Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente e commit o `package-lock.json`

**Erro:** `Environment variable missing`
- **Solução:** Adicione todas as variáveis de ambiente na plataforma

### Site Não Carrega

- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique os logs na plataforma de hospedagem
- Confirme que o Supabase está acessível

### Erro 500 - API Routes

- Verifique os logs da plataforma
- Confirme que `SUPABASE_SERVICE_ROLE_KEY` está correta
- Verifique se as políticas RLS estão configuradas

### Login Admin Não Funciona

- Execute o script `create-admin-user-direct.sql` no Supabase
- Verifique se `ADMIN_EMAIL` e `ADMIN_PASSWORD` estão corretos
- Confirme que `JWT_SECRET` está configurado

---

## 📝 Notas Adicionais

### Performance

- A Vercel otimiza automaticamente projetos Next.js
- Imagens são otimizadas via Next.js Image
- Cache automático para assets estáticos

### Segurança

- ✅ Variáveis de ambiente nunca são expostas ao cliente (exceto `NEXT_PUBLIC_*`)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` é usado apenas server-side
- ✅ Cookies httpOnly para autenticação
- ✅ JWT para sessões seguras

### Atualizações

Após cada push na branch `main`, o Vercel faz deploy automaticamente.

Para outras plataformas, configure CI/CD ou faça deploy manual.

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique os logs na plataforma de hospedagem
2. Verifique o console do navegador (F12)
3. Verifique se todas as configurações estão corretas
4. Consulte a documentação da plataforma de hospedagem

---

**Boa sorte com o deploy! 🚀**

