import { type NextRequest, NextResponse } from "next/server"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAuthenticatedAdmin()
    
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const { id } = await params
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string | null
    const website_url = formData.get("website_url") as string | null
    const active = formData.get("active") === "true"
    const logo = formData.get("logo") as File | null
    const keepCurrentLogo = formData.get("keepCurrentLogo") === "true"
    const removeLogo = formData.get("removeLogo") === "true"

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const supabase = getServiceClient()!

    // Buscar parceiro atual para obter a URL do logo
    const { data: currentPartner } = await supabase
      .from("partners")
      .select("logo_url")
      .eq("id", id)
      .single()

    // Definir logoUrl baseado nas flags
    let logoUrl: string | null = null
    if (removeLogo) {
      logoUrl = null // Remover logo explicitamente
    } else if (keepCurrentLogo) {
      logoUrl = currentPartner?.logo_url || null
    }

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
      .update({
        name,
        description: description || null,
        website_url: website_url || null,
        logo_url: logoUrl,
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[PARTNERS] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao atualizar parceiro" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[PARTNERS] Error updating partner:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAuthenticatedAdmin()
    
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const { id } = await params
    const supabase = getServiceClient()!

    const { error } = await supabase
      .from("partners")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[PARTNERS] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao excluir parceiro" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PARTNERS] Error deleting partner:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

