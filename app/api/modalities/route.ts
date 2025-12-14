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
      .from("modalities")
      .select("id, name, description, image_url, active")
      .order("name", { ascending: true })

    if (error) {
      console.error("[MODALITIES] error:", error.message)
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
    console.error("[MODALITIES] unexpected:", err)
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
    const description = formData.get("description") as string
    const active = formData.get("active") === "true"
    const image = formData.get("image") as File | null

    if (!name || !description) {
      return NextResponse.json({ error: "Nome e descrição são obrigatórios" }, { status: 400 })
    }

    const supabase = getServiceClient()!

    let imageUrl: string | null = null
    if (image && image.size > 0) {
      if (!image.type || !image.type.startsWith("image/")) {
        return NextResponse.json({ error: "Arquivo deve ser uma imagem válida" }, { status: 400 })
      }
      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Imagem deve ter no máximo 10MB" }, { status: 400 })
      }

      const safeName = image.name?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload.jpg"
      const fileName = `${Date.now()}-${safeName}`

      try {
        const arrayBuffer = await image.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: image.type })
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(`modalities/${fileName}`, blob, { contentType: image.type, upsert: false })
        if (uploadError) {
          console.error("[MODALITIES] Upload error:", uploadError)
          return NextResponse.json({ error: `Falha no upload: ${uploadError.message}` }, { status: 500 })
        }
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(`modalities/${fileName}`)
        imageUrl = urlData.publicUrl
      } catch (e: any) {
        console.error("[MODALITIES] Upload exception:", e)
        return NextResponse.json({ error: `Erro ao processar upload: ${e?.message || e}` }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from("modalities")
      .insert({
        name,
        description,
        image_url: imageUrl,
        active,
      })
      .select()
      .single()

    if (error) {
      console.error("[MODALITIES] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao criar modalidade" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[MODALITIES] Error creating modality:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

