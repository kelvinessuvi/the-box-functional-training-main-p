import { type NextRequest, NextResponse } from "next/server"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json([])
    }
    const supabase = getServiceClient()!
    const { data, error } = await supabase
      .from("instructors")
      .select("id, name, title, bio, photo_url, specialties, instagram_url, active")
      .order("name", { ascending: true })

    if (error) {
      console.error("[INSTRUCTORS] error:", error.message)
      return NextResponse.json([])
    }
    
    return new NextResponse(JSON.stringify(data || []), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (err) {
    console.error("[INSTRUCTORS] unexpected:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
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

    let photoUrl: string | null = null
    if (photo && photo.size > 0) {
      if (!photo.type || !photo.type.startsWith("image/")) {
        return NextResponse.json({ error: "Arquivo deve ser uma imagem válida" }, { status: 400 })
      }
      if (photo.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Imagem deve ter no máximo 10MB" }, { status: 400 })
      }

      const safeName = photo.name?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload.jpg"
      const fileName = `${Date.now()}-${safeName}`

      try {
        const arrayBuffer = await photo.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: photo.type })
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(`instructors/${fileName}`, blob, { contentType: photo.type, upsert: false })
        if (uploadError) {
          console.error("[INSTRUCTORS] Upload error:", uploadError)
          return NextResponse.json({ error: `Falha no upload: ${uploadError.message}` }, { status: 500 })
        }
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(`instructors/${fileName}`)
        photoUrl = urlData.publicUrl
      } catch (e: any) {
        console.error("[INSTRUCTORS] Upload exception:", e)
        return NextResponse.json({ error: `Erro ao processar upload: ${e?.message || e}` }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from("instructors")
      .insert({
        name,
        title: title || null,
        bio: bio || null,
        photo_url: photoUrl,
        specialties: specialties || [],
        instagram_url: instagramUrl || null,
        active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[INSTRUCTORS] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao criar instrutor" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[INSTRUCTORS] Error creating instructor:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

