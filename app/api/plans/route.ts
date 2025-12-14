import { type NextRequest, NextResponse } from "next/server"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      // Sem fallback de demo — retorna vazio até o admin criar
      return NextResponse.json([])
    }
    const supabase = getServiceClient()!
    const { data, error } = await supabase
      .from("plans")
      .select("id, name, price, description, active")
      .eq("active", true)
      .order("name", { ascending: true })

    if (error) {
      console.error("[PLANS] error:", error.message)
      return NextResponse.json([])
    }
    
    // Retornar com headers de cache para evitar cache
    return new NextResponse(JSON.stringify(data || []), {
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
    console.error("[PLANS] unexpected:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[PLANS-POST] Recebendo requisição POST")
    const admin = await getAuthenticatedAdmin()
    console.log("[PLANS-POST] Admin verificado:", admin ? admin.email : "NÃO AUTENTICADO")
    
    if (!admin) {
      console.error("[PLANS-POST] ❌ Acesso negado - não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { name, price, description, duration, participants, features } = await request.json()

    if (!name || !price || !description) {
      return NextResponse.json({ error: "Nome, preço e descrição são obrigatórios" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      // Modo demo - simular sucesso
      const newPlan = {
        id: Date.now().toString(),
        name,
        price,
        description,
        duration: duration || "",
        participants: participants || "",
        features: features || [],
        active: true,
        created_at: new Date().toISOString(),
      }
      return NextResponse.json(newPlan)
    }

    const supabase = getServiceClient()!
    const { data, error } = await supabase
      .from("plans")
      .insert({
        name,
        price,
        description,
        duration: duration || "",
        participants: participants || "",
        features: features || [],
        active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[PLANS] Database error:", error.message)
      return NextResponse.json({ error: "Erro ao criar plano" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[PLANS] Error creating plan:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
