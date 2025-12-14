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
      .from("partners")
      .select("id, name, logo_url, website_url, description, active, created_at")
      .order("name", { ascending: true })

    if (error) {
      console.error("[PARTNERS] error:", error.message)
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
    console.error("[PARTNERS] unexpected:", err)
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
    const description = formData.get("description") as string | null
    const website_url = formData.get("website_url") as string | null
    const active = formData.get("active") === "true"
    const logo = formData.get("logo") as File | null

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const supabase = getServiceClient()!

    let logoUrl: string | null = null
    if (logo && logo.size > 0) {
      if (!logo.type || !logo.type.startsWith("image/")) {
        return NextResponse.json({ error: "Arquivo deve ser uma imagem válida" }, { status: 400 })
      }
      if (logo.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Logo deve ter no máximo 5MB" }, { status: 400 })
      }

      const safeName = logo.name?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload.jpg"
      const fileName = `${Date.now()}-${safeName}`

      try {
        const arrayBuffer = await logo.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: logo.type })
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(`partners/${fileName}`, blob, { contentType: logo.type, upsert: false })
        if (uploadError) {
          console.error("[PARTNERS] Upload error:", uploadError)
          return NextResponse.json({ error: `Falha no upload: ${uploadError.message}` }, { status: 500 })
        }
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(`partners/${fileName}`)
        logoUrl = urlData.publicUrl
      } catch (e: any) {
        console.error("[PARTNERS] Upload exception:", e)
        return NextResponse.json({ error: `Erro ao processar upload: ${e?.message || e}` }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from("partners")
      .insert({
        name,
        description: description || null,
        website_url: website_url || null,
        logo_url: logoUrl,
        active,
      })
      .select()
      .single()

    if (error) {
      console.error("[PARTNERS] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao criar parceiro" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[PARTNERS] Error creating partner:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

