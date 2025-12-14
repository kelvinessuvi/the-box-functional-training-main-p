import { type NextRequest, NextResponse } from "next/server"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin()
    
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }

    const { orderedIds } = await request.json()

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Lista de IDs inválida" }, { status: 400 })
    }

    const supabase = getServiceClient()!

    // Atualizar a ordem de cada instrutor
    const updates = orderedIds.map((id: string, index: number) => 
      supabase
        .from("instructors")
        .update({ display_order: index })
        .eq("id", id)
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[INSTRUCTORS] Error reordering:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

