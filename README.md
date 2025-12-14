# Super Beast - Fit Em 14 Semanas

Website oficial da Super Beast, plataforma de team building através de fitness, entretenimento e desenvolvimento pessoal em Angola.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Supabase** - Backend como serviço (PostgreSQL, Auth, Storage)
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Git

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/SuperKilson/Super-Beast-Website-final.git
cd Super-Beast-Website-final
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
```

4. **Edite o `.env.local` com suas credenciais:**
- Chaves do Supabase
- Email e senha do admin
- JWT_SECRET

5. **Execute o projeto:**
```bash
npm run dev
```

O projeto estará disponível em: `http://localhost:3000`

## 🌐 Deploy e Hospedagem

📖 **Guia completo de deploy:** Veja [DEPLOY.md](./DEPLOY.md)

**Resumo rápido:**

1. Escolha uma plataforma (Vercel recomendado)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente
4. Deploy automático!

## ⚙️ Configuração do Banco de Dados

Antes de usar o projeto, execute os scripts SQL no Supabase:

1. Crie as tabelas necessárias
2. Execute `scripts/create-admin-user-direct.sql` para criar usuário admin
3. Configure as políticas RLS
4. Execute `scripts/fix-all-triggers.sql` se necessário

## 📁 Estrutura do Projeto

```
├── app/              # Rotas e páginas (App Router)
├── components/       # Componentes React
├── lib/              # Bibliotecas e utilitários
├── scripts/          # Scripts SQL e utilitários
├── public/           # Assets estáticos
└── .env.local        # Variáveis de ambiente (não commitado)
```

## 🔐 Acesso Admin

- **URL:** `/admin`
- **Credenciais:** Configuradas no `.env.local` (ADMIN_EMAIL, ADMIN_PASSWORD)

## 📝 Variáveis de Ambiente

Consulte `.env.example` para ver todas as variáveis necessárias.

**Importante:** O arquivo `.env.local` não é commitado por segurança.

## 🐛 Troubleshooting

Consulte [DEPLOY.md](./DEPLOY.md) para soluções de problemas comuns.

## 📄 Licença

Este projeto é privado e proprietário da Super Beast.

---

**Desenvolvido com ❤️ em Angola**
