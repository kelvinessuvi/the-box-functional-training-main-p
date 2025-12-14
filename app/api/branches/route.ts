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
      .from("branches")
      .select("id, name, address, city, country, phone, email, image_url, active")
      .order("name", { ascending: true })

    if (error) {
      console.error("[BRANCHES] error:", error.message)
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
    console.error("[BRANCHES] unexpected:", err)
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
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const country = formData.get("country") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const image = formData.get("image") as File | null

    if (!name || !address || !city || !country) {
      return NextResponse.json({ error: "Nome, endereço, cidade e país são obrigatórios" }, { status: 400 })
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
          .upload(`branches/${fileName}`, blob, { contentType: image.type, upsert: false })
        if (uploadError) {
          console.error("[BRANCHES] Upload error:", uploadError)
          return NextResponse.json({ error: `Falha no upload: ${uploadError.message}` }, { status: 500 })
        }
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(`branches/${fileName}`)
        imageUrl = urlData.publicUrl
      } catch (e: any) {
        console.error("[BRANCHES] Upload exception:", e)
        return NextResponse.json({ error: `Erro ao processar upload: ${e?.message || e}` }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from("branches")
      .insert({
        name,
        address,
        city,
        country: country || "Angola",
        phone: phone || null,
        email: email || null,
        image_url: imageUrl,
        active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[BRANCHES] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao criar filial" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[BRANCHES] Error creating branch:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

