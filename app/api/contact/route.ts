import { NextResponse, type NextRequest } from "next/server"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { name, email, subject, message, company, phone, participants } = body
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Nome, email, assunto e mensagem são obrigatórios" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      // Accept in demo mode without persistence
      return NextResponse.json({ success: true, id: "demo" }, { status: 201 })
    }

    const supabase = getServiceClient()!
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({ name, email, subject, message, company, phone, participants, read: false })
      .select("id")
      .single()

    if (error) {
      console.error("[CONTACT] Insert error:", error.message)
      return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error("[CONTACT] Unexpected error:", err)
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      // Demo mode: retornar lista vazia para não quebrar a UI
      return NextResponse.json([])
    }

    const supabase = getServiceClient()!
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, company, phone, participants, subject, message, read, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[CONTACT] List error:", error.message)
      return NextResponse.json({ error: "Erro ao listar mensagens" }, { status: 500 })
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
    console.error("[CONTACT] Unexpected error:", err)
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 })
  }
}
