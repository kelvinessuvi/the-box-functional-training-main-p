# 🗂️ Guia de Configuração de Storage - THE BOX

Este guia explica como configurar os buckets de storage no Supabase para o sistema THE BOX.

## 📋 Pré-requisitos

- Acesso ao Dashboard do Supabase
- Permissões de administrador no projeto
- Script SQL pronto (`setup-storage-buckets.sql`)

---

## 🚀 Passo a Passo

### **Opção 1: Via Dashboard (Recomendado)**

#### **Passo 1: Criar o Bucket**

1. Acesse o **Dashboard do Supabase**
2. Vá para **Storage** (menu lateral)
3. Clique em **"New bucket"** ou **"+ New bucket"**
4. Configure:
   - **Nome:** `images`
   - **Public bucket:** ✅ **Marcado** (permite leitura pública)
   - **File size limit:** `10 MB`
   - **Allowed MIME types:** 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/gif`
     - `image/webp`

5. Clique em **"Create bucket"**

#### **Passo 2: Executar Script SQL**

1. Vá para **SQL Editor** no Dashboard
2. Clique em **"New query"**
3. Cole o conteúdo do arquivo `setup-storage-buckets.sql`
4. Clique em **"Run"** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Verifique se não há erros

#### **Passo 3: Verificar Configuração**

1. Vá para **Storage** > **Policies**
2. Verifique se as seguintes políticas foram criadas:
   - ✅ `Public Access - Read Images`
   - ✅ `Authenticated Upload - Images`
   - ✅ `Authenticated Update - Images`
   - ✅ `Service Role Delete - Images`
   - ✅ `Public Read - Gallery`
   - ✅ `Public Read - Modalities`
   - ✅ `Public Read - Instructors`
   - ✅ `Public Read - Branches`

---

### **Opção 2: Apenas SQL (Menos Recomendado)**

Se preferir fazer tudo via SQL:

1. Execute o script `setup-storage-buckets.sql` no SQL Editor
2. Se o bucket não for criado automaticamente, crie manualmente via Dashboard (Passo 1 da Opção 1)
3. Execute o script novamente para criar as políticas

---

## 📁 Estrutura de Pastas

O bucket `images` será organizado assim:

```
images/
├── gallery/          # Imagens da galeria (Instrutores, Aulas, Eventos)
├── modalities/       # Imagens das modalidades
├── instructors/      # Fotos dos instrutores
└── branches/         # Imagens das filiais
```

**Nota:** As pastas são criadas automaticamente quando você faz o primeiro upload em cada categoria.

---

## 🔒 Políticas de Segurança

### **Leitura Pública (SELECT)**
- ✅ Qualquer pessoa pode ver as imagens
- ✅ Necessário para a página pública funcionar
- ✅ Aplica-se a todas as pastas

### **Upload (INSERT)**
- ✅ Apenas via Service Role (API routes autenticadas)
- ✅ Garante que apenas o admin pode fazer uploads
- ✅ Validado no código (verificação de autenticação)

### **Atualização (UPDATE)**
- ✅ Apenas via Service Role
- ✅ Permite substituir imagens antigas

### **Exclusão (DELETE)**
- ✅ Apenas via Service Role
- ✅ Permite remover imagens antigas ao atualizar

---

## 🧪 Testar a Configuração

### **Teste 1: Upload pelo Admin**

1. Faça login no painel admin
2. Vá para **Galeria** > **Nova Imagem**
3. Faça upload de uma imagem de teste
4. Verifique se a imagem aparece na galeria

### **Teste 2: Verificação Pública**

1. Acesse a página pública
2. Vá para a seção **Galeria**
3. Verifique se as imagens são exibidas corretamente

### **Teste 3: Verificar Storage**

1. Vá para **Storage** > **Files**
2. Clique no bucket `images`
3. Verifique se as pastas foram criadas:
   - `gallery/`
   - `modalities/`
   - `instructors/`
   - `branches/`

---

## ⚠️ Troubleshooting

### **Erro: "Bucket not found"**

**Solução:**
1. Verifique se o bucket `images` foi criado
2. Vá para **Storage** > **Buckets**
3. Se não existir, crie manualmente (ver Passo 1 acima)

### **Erro: "Permission denied"**

**Solução:**
1. Verifique se as políticas RLS foram criadas
2. Vá para **Storage** > **Policies**
3. Se não existirem, execute o script SQL novamente

### **Erro: "File size limit exceeded"**

**Solução:**
1. Verifique o limite do bucket (deve ser 10MB)
2. Vá para **Storage** > **Buckets** > **images** > **Settings**
3. Ajuste o **File size limit** se necessário

### **Imagens não aparecem na página pública**

**Solução:**
1. Verifique se o bucket está marcado como **Public**
2. Verifique se as políticas de leitura pública foram criadas
3. Verifique o console do navegador para erros CORS

---

## 📝 Notas Importantes

1. **Bucket Público:** O bucket `images` deve ser público para permitir leitura sem autenticação
2. **Service Role Key:** Os uploads são feitos usando a Service Role Key, que tem permissões totais
3. **Segurança:** Apenas o admin pode fazer uploads (validado no código das API routes)
4. **Limite de Tamanho:** 10MB por arquivo (configurável no bucket)
5. **Tipos Permitidos:** Apenas imagens (jpeg, png, gif, webp)

---

## 🔄 Atualizar Políticas

Se precisar atualizar as políticas no futuro:

1. Vá para **Storage** > **Policies**
2. Remova as políticas antigas
3. Execute o script SQL novamente

Ou use o script de limpeza:

```sql
-- Remover todas as políticas do bucket images
DROP POLICY IF EXISTS "Public Access - Read Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload - Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update - Images" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Delete - Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Modalities" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Instructors" ON storage.objects;
DROP POLICY IF EXISTS "Public Read - Branches" ON storage.objects;
```

---

## ✅ Checklist Final

Antes de considerar a configuração completa:

- [ ] Bucket `images` criado e marcado como público
- [ ] Limite de tamanho configurado (10MB)
- [ ] Tipos MIME permitidos configurados
- [ ] Script SQL executado sem erros
- [ ] Todas as políticas criadas e visíveis
- [ ] Upload de teste funcionando no admin
- [ ] Imagens aparecem na página pública
- [ ] Estrutura de pastas criada automaticamente

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase (**Logs** > **API Logs**)
2. Verifique o console do navegador (F12)
3. Verifique as políticas em **Storage** > **Policies**
4. Execute o script SQL novamente se necessário

---

**Última atualização:** 2025-01-XX

