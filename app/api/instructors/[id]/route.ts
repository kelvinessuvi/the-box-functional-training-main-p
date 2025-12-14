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
    const title = formData.get("title") as string
    const bio = formData.get("bio") as string
    const specialtiesStr = formData.get("specialties") as string
    const instagramUrl = formData.get("instagram_url") as string
    const photo = formData.get("photo") as File | null
    const { id } = params

    if (!name || !title) {
      return NextResponse.json({ error: "Nome e título são obrigatórios" }, { status: 400 })
    }

    let specialties: string[] = []
    try {
      specialties = specialtiesStr ? JSON.parse(specialtiesStr) : []
    } catch {
      specialties = []
    }

    const supabase = getServiceClient()!

    // Buscar foto atual se não houver nova
    let currentPhotoUrl: string | null = null
    if (!photo || photo.size === 0) {
      const { data: currentData } = await supabase
        .from("instructors")
        .select("photo_url")
        .eq("id", id)
        .single()
      currentPhotoUrl = currentData?.photo_url || null
    }

    let photoUrl: string | null = currentPhotoUrl
    if (photo && photo.size > 0) {
      if (!photo.type.startsWith('image/')) {
        return NextResponse.json({ error: "Arquivo deve ser uma imagem" }, { status: 400 })
      }
      if (photo.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Imagem deve ter no máximo 10MB" }, { status: 400 })
      }

      try {
        const fileName = `${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const arrayBuffer = await photo.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: photo.type })
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(`instructors/${fileName}`, blob, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('[INSTRUCTORS] Upload error:', uploadError)
          return NextResponse.json({ error: 'Erro ao fazer upload da foto' }, { status: 500 })
        }
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(`instructors/${fileName}`)
        photoUrl = urlData.publicUrl

        // Deletar foto anterior se existir
        if (currentPhotoUrl && currentPhotoUrl.includes('/storage/v1/object/public/images/')) {
          try {
            const oldFileName = currentPhotoUrl.split('/images/')[1]
            if (oldFileName) {
              await supabase.storage.from('images').remove([oldFileName])
            }
          } catch (deleteError) {
            console.warn('[INSTRUCTORS] Error deleting old photo:', deleteError)
          }
        }
      } catch (uploadError) {
        console.error('[INSTRUCTORS] Upload error:', uploadError)
        return NextResponse.json({ error: 'Erro ao fazer upload da foto' }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from("instructors")
      .update({
        name,
        title,
        bio: bio || null,
        photo_url: photoUrl,
        specialties: specialties || [],
        instagram_url: instagramUrl || null,
        active: true,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[INSTRUCTORS] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao atualizar instrutor" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[INSTRUCTORS] Error updating instructor:", error)
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
      return NextResponse.json({ success: true, message: "Instrutor excluído com sucesso" })
    }

    const supabase = getServiceClient()!
    const { error } = await supabase
      .from("instructors")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[INSTRUCTORS] Delete error:", error.message)
      return NextResponse.json({ error: "Erro ao excluir instrutor" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Instrutor excluído com sucesso" })
  } catch (error) {
    console.error("[INSTRUCTORS] Error deleting instructor:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

