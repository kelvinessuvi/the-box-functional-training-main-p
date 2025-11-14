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
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const country = formData.get("country") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const image = formData.get("image") as File | null
    const { id } = params

    if (!name || !address || !city || !country) {
      return NextResponse.json({ error: "Nome, endereço, cidade e país são obrigatórios" }, { status: 400 })
    }

    const supabase = getServiceClient()!

    // Buscar imagem atual se não houver nova
    let currentImageUrl: string | null = null
    if (!image || image.size === 0) {
      const { data: currentData } = await supabase
        .from("branches")
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
          .upload(`branches/${fileName}`, blob, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('[BRANCHES] Upload error:', uploadError)
          return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
        }
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(`branches/${fileName}`)
        imageUrl = urlData.publicUrl

        // Deletar imagem anterior se existir
        if (currentImageUrl && currentImageUrl.includes('/storage/v1/object/public/images/')) {
          try {
            const oldFileName = currentImageUrl.split('/images/')[1]
            if (oldFileName) {
              await supabase.storage.from('images').remove([oldFileName])
            }
          } catch (deleteError) {
            console.warn('[BRANCHES] Error deleting old image:', deleteError)
          }
        }
      } catch (uploadError) {
        console.error('[BRANCHES] Upload error:', uploadError)
        return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from("branches")
      .update({
        name,
        address,
        city,
        country,
        phone: phone || null,
        email: email || null,
        image_url: imageUrl,
        active: true,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[BRANCHES] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao atualizar filial" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[BRANCHES] Error updating branch:", error)
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
      return NextResponse.json({ success: true, message: "Filial excluída com sucesso" })
    }

    const supabase = getServiceClient()!
    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[BRANCHES] Delete error:", error.message)
      return NextResponse.json({ error: "Erro ao excluir filial" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Filial excluída com sucesso" })
  } catch (error) {
    console.error("[BRANCHES] Error deleting branch:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

