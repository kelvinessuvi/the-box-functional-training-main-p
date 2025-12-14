import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getAuthenticatedAdmin } from '@/lib/auth/auth-utils'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const supabase = getServiceClient()!
    const { data, error } = await supabase
      .from("gallery_images")
      .select("id, title, image_url, category, description, created_at")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("[GALLERY] Fetch by id error:", error.message)
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error("[GALLERY] Unexpected error:", err)
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("[GALLERY-PUT] Recebendo requisição PUT para:", params.id)
    const admin = await getAuthenticatedAdmin()
    console.log("[GALLERY-PUT] Admin verificado:", admin ? admin.email : "NÃO AUTENTICADO")
    
    if (!admin) {
      console.error("[GALLERY-PUT] ❌ Acesso negado - não autenticado")
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const image = formData.get('image') as File
    const { id } = params

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória' },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()!
    const updateData: any = {
      title: title.trim(),
      description: description ? description.trim() : '',
      category,
      updated_at: new Date().toISOString()
    }

    // Buscar imagem atual para deletar se necessário
    let currentImageUrl: string | null = null
    if (image && image.size > 0) {
      const { data: currentData } = await supabase
        .from('gallery_images')
        .select('image_url')
        .eq('id', id)
        .single()
      
      currentImageUrl = currentData?.image_url || null
    }

    if (image && image.size > 0) {
      // Validar tipo de arquivo
      if (!image.type.startsWith('image/')) {
        return NextResponse.json({ error: "Arquivo deve ser uma imagem" }, { status: 400 })
      }

      // Validar tamanho (máximo 10MB)
      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Imagem deve ter no máximo 10MB" }, { status: 400 })
      }

      try {
        // Upload nova imagem
        const fileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(`gallery/${fileName}`, image, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('[GALLERY] Upload error:', uploadError)
          return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
        }
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(`gallery/${fileName}`)
        updateData.image_url = urlData.publicUrl

        // Deletar imagem anterior se existir
        if (currentImageUrl && currentImageUrl.includes('/storage/v1/object/public/images/')) {
          try {
            const oldFileName = currentImageUrl.split('/images/')[1]
            if (oldFileName) {
              await supabase.storage.from('images').remove([oldFileName])
            }
          } catch (deleteError) {
            console.warn('[GALLERY] Error deleting old image:', deleteError)
          }
        }
      } catch (uploadError) {
        console.error('[GALLERY] Upload error:', uploadError)
        return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from('gallery_images')
      .update(updateData)
      .eq('id', id)
      .select('id, title, image_url, category, description, created_at, updated_at')
      .single()

    if (error) {
      console.error('[GALLERY] Database error:', error)
      return NextResponse.json({ error: 'Erro ao atualizar imagem' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GALLERY] Error updating image:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[GALLERY-DELETE] Recebendo requisição DELETE para:", params.id)
    const admin = await getAuthenticatedAdmin()
    console.log("[GALLERY-DELETE] Admin verificado:", admin ? admin.email : "NÃO AUTENTICADO")
    
    if (!admin) {
      console.error("[GALLERY-DELETE] ❌ Acesso negado - não autenticado")
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const supabase = getServiceClient()!

    // Primeiro buscar a imagem para deletar do storage
    console.log('[GALLERY] Buscando imagem com ID:', params.id)
    const { data: imageData, error: fetchError } = await supabase
      .from('gallery_images')
      .select('image_url')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('[GALLERY] Fetch error:', fetchError)
      console.error('[GALLERY] Error code:', fetchError.code)
      console.error('[GALLERY] Error message:', fetchError.message)
      
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })
      }
      
      return NextResponse.json({ error: `Erro ao buscar imagem: ${fetchError.message}` }, { status: 500 })
    }

    console.log('[GALLERY] Imagem encontrada. URL:', imageData?.image_url)

    // Deletar registro do banco
    // Usar RPC ou SQL direto se necessário para evitar problemas com RLS
    console.log('[GALLERY] Deletando registro do banco:', params.id)
    
    // Primeiro, verificar se a imagem existe e obter o ID
    const { data: checkData, error: checkError } = await supabase
      .from('gallery_images')
      .select('id')
      .eq('id', params.id)
      .single()
    
    if (checkError || !checkData) {
      console.error('[GALLERY] Imagem não encontrada para deletar:', checkError)
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })
    }

    // Deletar usando o service role (que tem permissões elevadas)
    const { error: deleteError, data: deleteData } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', params.id)
      .select()

    if (deleteError) {
      console.error('[GALLERY] Delete DB error:', deleteError)
      console.error('[GALLERY] Error code:', deleteError.code)
      console.error('[GALLERY] Error message:', deleteError.message)
      console.error('[GALLERY] Error details:', deleteError)
      
      // Se o erro for relacionado a RLS ou trigger, tentar usar RPC
      if (deleteError.message?.includes('UPDATE requires a WHERE clause') || 
          deleteError.message?.includes('policy') ||
          deleteError.code === '42501') {
        console.log('[GALLERY] Tentando deletar usando método alternativo...')
        
        // Tentar usar rpc ou sql direto
        const { error: rpcError } = await supabase.rpc('delete_gallery_image', { image_id: params.id })
          .catch(async () => {
            // Se RPC não existir, tentar deletar diretamente via SQL usando service role
            const { error: sqlError } = await supabase
              .from('gallery_images')
              .delete()
              .eq('id', params.id)
            
            return { error: sqlError }
          })
        
        if (rpcError) {
          return NextResponse.json({ 
            error: `Erro ao excluir imagem. Possível problema com trigger ou políticas RLS. Execute o script fix-gallery-delete-policy.sql no Supabase. Erro: ${deleteError.message}` 
          }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: `Erro ao excluir imagem: ${deleteError.message}` }, { status: 500 })
      }
    }

    console.log('[GALLERY] Registro deletado com sucesso. Linhas afetadas:', deleteData?.length || 0)

    // Deletar arquivo do storage se existir
    if (imageData?.image_url && imageData.image_url.includes('/storage/v1/object/public/images/')) {
      try {
        const fileName = imageData.image_url.split('/images/')[1]
        if (fileName) {
          console.log('[GALLERY] Deletando arquivo do storage:', fileName)
          const { error: storageError } = await supabase.storage.from('images').remove([fileName])
          if (storageError) {
            console.warn('[GALLERY] Storage removal error (ignorado):', storageError)
          } else {
            console.log('[GALLERY] Arquivo do storage deletado com sucesso')
          }
        }
      } catch (storageErr) {
        console.warn('[GALLERY] Storage removal exception (ignorado):', storageErr)
      }
    } else {
      console.log('[GALLERY] Não há arquivo no storage para deletar ou URL não é do Supabase')
    }

    console.log('[GALLERY] DELETE concluído com sucesso para:', params.id)
    return NextResponse.json({ success: true, message: 'Imagem excluída com sucesso' })
  } catch (err) {
    console.error("[GALLERY] Unexpected error:", err)
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 })
  }
}
