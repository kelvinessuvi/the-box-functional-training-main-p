import { NextResponse, type NextRequest } from "next/server"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"

// Função para filtrar URLs externas problemáticas
function filterImageUrl(url: string): string {
  if (!url) return "/placeholder.svg?height=300&width=300&text=Super+Beast"
  if (url.includes("images.unsplash.com") || url.includes("unsplash.com")) {
    return "/placeholder.svg?height=300&width=300&text=Super+Beast"
  }
  // Verificar se é uma URL externa que não seja do próprio domínio
  if (url.startsWith("http")) {
    // Permitir apenas URLs do Supabase (que são seguras)
    if (url.includes("supabase.co")) {
      return url
    }
    // Para outras URLs externas, usar placeholder
    return "/placeholder.svg?height=300&width=300&text=Super+Beast"
  }
  return url
}

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") || null

    const supabase = getServiceClient()!
    let query = supabase
      .from("gallery_images")
      .select("id, title, image_url, category, description, created_at")
      .order("created_at", { ascending: false })
    
    if (category) {
      query = query.eq("category", category)
    }
    
    const { data, error } = await query

    if (error) {
      console.error("[GALLERY] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao carregar galeria" }, { status: 500 })
    }

    // Filtrar URLs externas problemáticas
    const filteredData = (data || []).map(item => ({
      ...item,
      image_url: filterImageUrl(item.image_url)
    }))

    // Retornar com headers de cache para evitar cache
    return new NextResponse(JSON.stringify(filteredData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toISOString(),
        'ETag': `"${Date.now()}"`
      }
    })
  } catch (err) {
    console.error("[GALLERY] Unexpected error:", err)
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[GALLERY-POST] Recebendo requisição POST")
    const admin = await getAuthenticatedAdmin()
    console.log("[GALLERY-POST] Admin verificado:", admin ? admin.email : "NÃO AUTENTICADO")
    
    if (!admin) {
      console.error("[GALLERY-POST] ❌ Acesso negado - não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const formData = await req.formData()
    const title = formData.get("title") as string
    const description = (formData.get("description") as string) || ""
    const category = (formData.get("category") as string) || "geral"
    const image = formData.get("image") as File | null

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: "Categoria é obrigatória" }, { status: 400 })
    }

    const supabase = getServiceClient()!

    let imageUrl: string | null = null
    if (image && image.size > 0) {
      // Validar tipo e tamanho
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
          .upload(`gallery/${fileName}`, blob, { contentType: image.type, upsert: false })
        if (uploadError) {
          console.error("[GALLERY] Upload error:", uploadError)
          return NextResponse.json({ error: `Falha no upload: ${uploadError.message}` }, { status: 500 })
        }
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(`gallery/${fileName}`)
        imageUrl = urlData.publicUrl
      } catch (e: any) {
        console.error("[GALLERY] Upload exception:", e)
        return NextResponse.json({ error: `Erro ao processar upload: ${e?.message || e}` }, { status: 500 })
      }
    }

    const { data, error } = await supabase
      .from("gallery_images")
      .insert({ 
        title: title.trim(), 
        description: description.trim(), 
        category, 
        image_url: imageUrl || "/placeholder.svg" 
      })
      .select()
      .single()

    if (error) {
      console.error("[GALLERY] Insert error:", error)
      return NextResponse.json({ error: `Erro ao salvar imagem: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("[GALLERY] Unexpected error:", err)
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 })
  }
}
