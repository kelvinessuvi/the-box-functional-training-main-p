import { NextResponse } from "next/server"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[STATS] Iniciando carregamento de estatísticas...")
    console.log("[STATS] Timestamp:", new Date().toISOString())
    console.log("[STATS] Variáveis de ambiente:")
    console.log("- SUPABASE_URL:", process.env.SUPABASE_URL ? "Configurado" : "NÃO CONFIGURADO")
    console.log("- SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurado" : "NÃO CONFIGURADO")
    
    if (!isSupabaseConfigured()) {
      console.log("[STATS] Supabase não configurado")
      return NextResponse.json({ 
        error: "Supabase não configurado",
        config: {
          supabaseUrl: process.env.SUPABASE_URL ? "Configurado" : "Não configurado",
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurado" : "Não configurado"
        }
      }, { status: 500 })
    }

    const supabase = getServiceClient()!
    console.log("[STATS] Cliente Supabase obtido")

    // Verificar se as tabelas existem
    console.log("[STATS] Verificando tabelas...")
    
    // Forçar nova execução da query para evitar cache
    const timestamp = Date.now()
    console.log(`[STATS] Executando queries com timestamp: ${timestamp}`)
    
    const [messages, modalities, gallery] = await Promise.all([
      supabase.from("contact_messages").select("id, read").order("created_at", { ascending: false }),
      supabase.from("modalities").select("id").eq("active", true),
      supabase.from("gallery_images").select("id").order("created_at", { ascending: false })
    ])

    console.log("[STATS] Resultados das queries:")
    console.log("- Messages:", messages)
    console.log("- Modalities data:", modalities.data)
    console.log("- Modalities count:", modalities.data?.length)
    console.log("- Gallery:", gallery)
    console.log("- Gallery count:", gallery.data?.length)

    if (messages.error) {
      console.error("[STATS] Erro na query de mensagens:", messages.error)
      throw messages.error
    }
    if (modalities.error) {
      console.error("[STATS] Erro na query de modalidades:", modalities.error)
      throw modalities.error
    }
    if (gallery.error) {
      console.error("[STATS] Erro na query de galeria:", gallery.error)
      throw gallery.error
    }

    const totalMessages = messages.data?.length ?? 0
    const unreadMessages = messages.data?.filter((m: any) => !m.read).length ?? 0
    const activeModalities = modalities.data?.length ?? 0
    const galleryImages = gallery.data?.length ?? 0

    console.log("[STATS] Dados processados:")
    console.log("- totalMessages:", totalMessages)
    console.log("- unreadMessages:", unreadMessages)
    console.log("- activeModalities:", activeModalities)
    console.log("- galleryImages:", galleryImages)

    const result = {
      total_messages: totalMessages,
      unread_messages: unreadMessages,
      active_plans: activeModalities, // Mantido para compatibilidade
      active_modalities: activeModalities,
      gallery_images: galleryImages,
      timestamp: new Date().toISOString(),
    }

    console.log("[STATS] Estatísticas finais:", result)
    
    // Retornar com headers de cache para evitar cache
    return new NextResponse(JSON.stringify(result), {
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
  } catch (error) {
    console.error("[STATS] Error:", error)
    return NextResponse.json({ 
      error: "Erro ao carregar estatísticas",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
