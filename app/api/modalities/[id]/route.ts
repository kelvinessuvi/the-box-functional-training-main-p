import { type NextRequest, NextResponse } from "next/server"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin()
    
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const active = formData.get("active") === "true"
    const image = formData.get("image") as File | null
    const { id } = params

    if (!name || !description) {
      return NextResponse.json({ error: "Nome e descrição são obrigatórios" }, { status: 400 })
    }

    const supabase = getServiceClient()!

    // Buscar imagem atual se não houver nova
    let currentImageUrl: string | null = null
    if (!image || image.size === 0) {
      const { data: currentData } = await supabase
        .from("modalities")
        .select("image_url")
        .eq("id", id)
        .single()
      currentImageUrl = currentData?.image_url || null
    }

    let imageUrl: string | null = currentImageUrl
    if (image && image.size > 0) {
      if (!image.type.startsWith('image/')) {
        return NextResponse.json({ error: "Arquivo deve ser uma imagem" }, { status: 400 })
      }
      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Imagem deve ter no máximo 10MB" }, { status: 400 })
      }

      try {
        const fileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const arrayBuffer = await image.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: image.type })
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(`modalities/${fileName}`, blob, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('[MODALITIES] Upload error:', uploadError)
          return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
        }
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(`modalities/${fileName}`)
        imageUrl = urlData.publicUrl

        // Deletar imagem anterior se existir
        if (currentImageUrl && currentImageUrl.includes('/storage/v1/object/public/images/')) {
          try {
            const oldFileName = currentImageUrl.split('/images/')[1]
            if (oldFileName) {
              await supabase.storage.from('images').remove([oldFileName])
            }
          } catch (deleteError) {
            console.warn('[MODALITIES] Error deleting old image:', deleteError)
          }
        }
      } catch (uploadError) {
        console.error('[MODALITIES] Upload error:', uploadError)
        return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from("modalities")
      .update({
        name,
        description,
        image_url: imageUrl,
        active,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[MODALITIES] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao atualizar modalidade" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[MODALITIES] Error updating modality:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin()
    
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = params

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, message: "Modalidade excluída com sucesso" })
    }

    const supabase = getServiceClient()!
    const { error } = await supabase
      .from("modalities")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[MODALITIES] Delete error:", error.message)
      return NextResponse.json({ error: "Erro ao excluir modalidade" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Modalidade excluída com sucesso" })
  } catch (error) {
    console.error("[MODALITIES] Error deleting modality:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

