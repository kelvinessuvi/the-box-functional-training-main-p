import { NextResponse } from "next/server"
import { isSupabaseConfigured, getServiceClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const config = {
      supabaseConfigured: isSupabaseConfigured(),
      supabaseUrl: process.env.SUPABASE_URL ? "Configurado" : "Não configurado",
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurado" : "Não configurado",
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        error: "Supabase não configurado",
        config 
      })
    }

    const supabase = getServiceClient()!
    
    // Testar conexão
    const { data, error } = await supabase.from("contact_messages").select("count").limit(1)
    
    return NextResponse.json({
      config,
      connection: error ? { error: error.message } : { success: true },
      testQuery: { data, error: error?.message }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Erro no debug",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    })
  }
}
