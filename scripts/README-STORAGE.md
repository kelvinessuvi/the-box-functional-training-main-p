# 📦 Scripts de Configuração de Storage

Este diretório contém scripts para configurar os buckets de storage no Supabase.

## 📄 Arquivos Disponíveis

### 1. `setup-storage-buckets.sql` ⭐ **RECOMENDADO**
Script completo com todas as políticas e verificação de bucket.

**Use quando:**
- Configuração inicial completa
- Quer todas as políticas específicas por pasta
- Precisa de verificação detalhada

### 2. `setup-storage-simple.sql` 🚀 **RÁPIDO**
Script simplificado com políticas básicas.

**Use quando:**
- Quer configuração rápida
- Já criou o bucket manualmente
- Precisa apenas das políticas essenciais

### 3. `STORAGE-SETUP-GUIDE.md` 📖
Guia completo passo a passo com troubleshooting.

## 🎯 Como Usar

### **Opção 1: Script Completo (Recomendado)**

1. **Criar bucket via Dashboard:**
   - Vá para **Storage** > **New Bucket**
   - Nome: `images`
   - Marque como **Public**
   - File size: `10 MB`
   - MIME types: `image/jpeg, image/png, image/gif, image/webp`

2. **Executar script SQL:**
   - Vá para **SQL Editor**
   - Abra `setup-storage-buckets.sql`
   - Execute o script
   - Verifique se não há erros

### **Opção 2: Script Simplificado**

1. **Criar bucket via Dashboard** (mesmo passo acima)

2. **Executar script SQL:**
   - Vá para **SQL Editor**
   - Abra `setup-storage-simple.sql`
   - Execute o script

## ✅ Verificação

Após executar qualquer script:

1. Vá para **Storage** > **Policies**
2. Verifique se as políticas foram criadas
3. Teste fazendo upload de uma imagem pelo admin panel

## 📚 Documentação Completa

Veja `STORAGE-SETUP-GUIDE.md` para:
- Guia detalhado passo a passo
- Troubleshooting
- Explicação das políticas
- Estrutura de pastas

---

**Dúvidas?** Consulte o guia completo em `STORAGE-SETUP-GUIDE.md`

