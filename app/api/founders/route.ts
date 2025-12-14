import { type NextRequest, NextResponse } from "next/server"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      // Retornar dados padrão se Supabase não estiver configurado
      return NextResponse.json([
        { id: "1", name: "Mário Stefan", full_name: "Mário Stefan Pitagrós de Melo Araújo", role: "Co-Fundador", photo_url: null },
        { id: "2", name: "Wilson Inocêncio", full_name: "Wilson Inocêncio", role: "Co-Fundador", photo_url: null }
      ])
    }

    const supabase = getServiceClient()!
    
    const { data, error } = await supabase
      .from("founders")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      console.error("[FOUNDERS API] Erro ao buscar fundadores:", error)
      // Retornar dados padrão se a tabela não existir
      return NextResponse.json([
        { id: "1", name: "Mário Stefan", full_name: "Mário Stefan Pitagrós de Melo Araújo", role: "Co-Fundador", photo_url: null },
        { id: "2", name: "Wilson Inocêncio", full_name: "Wilson Inocêncio", role: "Co-Fundador", photo_url: null }
      ])
    }

    // Se não houver fundadores, retornar dados padrão
    if (!data || data.length === 0) {
      return NextResponse.json([
        { id: "1", name: "Mário Stefan", full_name: "Mário Stefan Pitagrós de Melo Araújo", role: "Co-Fundador", photo_url: null },
        { id: "2", name: "Wilson Inocêncio", full_name: "Wilson Inocêncio", role: "Co-Fundador", photo_url: null }
      ])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[FOUNDERS API] Erro:", error)
    // Retornar dados padrão em caso de erro
    return NextResponse.json([
      { id: "1", name: "Mário Stefan", full_name: "Mário Stefan Pitagrós de Melo Araújo", role: "Co-Fundador", photo_url: null },
      { id: "2", name: "Wilson Inocêncio", full_name: "Wilson Inocêncio", role: "Co-Fundador", photo_url: null }
    ])
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const supabase = getServiceClient()!
    const formData = await request.formData()
    
    const name = formData.get("name") as string
    const full_name = formData.get("full_name") as string
    const role = formData.get("role") as string || "Co-Fundador"
    const photo = formData.get("photo") as File | null

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    let photo_url: string | null = null

    // Upload da foto se fornecida
    if (photo && photo.size > 0) {
      // Validar tipo de arquivo
      if (!photo.type || !photo.type.startsWith("image/")) {
        return NextResponse.json({ error: "Arquivo deve ser uma imagem válida" }, { status: 400 })
      }
      
      // Validar tamanho (máx 10MB)
      if (photo.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Imagem deve ter no máximo 10MB" }, { status: 400 })
      }

      const safeName = photo.name?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload.jpg"
      const fileName = `${Date.now()}-${safeName}`
      const filePath = `founders/${fileName}`

      try {
        // Converter File para ArrayBuffer e depois para Blob
        const arrayBuffer = await photo.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: photo.type })
        
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, blob, {
            contentType: photo.type,
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error("[FOUNDERS API] Erro no upload:", uploadError)
          return NextResponse.json({ error: `Falha no upload: ${uploadError.message}` }, { status: 500 })
        }

        const { data: publicUrl } = supabase.storage
          .from("images")
          .getPublicUrl(filePath)

        photo_url = publicUrl.publicUrl
      } catch (e: any) {
        console.error("[FOUNDERS API] Upload exception:", e)
        return NextResponse.json({ error: `Erro ao processar upload: ${e?.message || e}` }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from("founders")
      .insert({
        name,
        full_name: full_name || name,
        role,
        photo_url,
      })
      .select()
      .single()

    if (error) {
      console.error("[FOUNDERS API] Erro ao criar fundador:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[FOUNDERS API] Erro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
