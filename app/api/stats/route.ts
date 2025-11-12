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
    
    const [messages, plans, gallery, stats] = await Promise.all([
      supabase.from("contact_messages").select("id, read").order("created_at", { ascending: false }),
      supabase.from("plans").select("id").eq("active", true),
      supabase.from("gallery_images").select("id").order("created_at", { ascending: false }),
      supabase.from("statistics").select("monthly_views").order("monthly_views", { ascending: false }).limit(1)
    ])

    console.log("[STATS] Resultados das queries:")
    console.log("- Messages:", messages)
    console.log("- Plans (raw):", plans)
    console.log("- Plans data:", plans.data)
    console.log("- Plans count:", plans.data?.length)
    console.log("- Gallery:", gallery)
    console.log("- Stats:", stats)

    if (messages.error) {
      console.error("[STATS] Erro na query de mensagens:", messages.error)
      throw messages.error
    }
    if (plans.error) {
      console.error("[STATS] Erro na query de planos:", plans.error)
      throw plans.error
    }
    if (gallery.error) {
      console.error("[STATS] Erro na query de galeria:", gallery.error)
      throw gallery.error
    }

    const totalMessages = messages.data?.length ?? 0
    const unreadMessages = messages.data?.filter((m: any) => !m.read).length ?? 0
    const activePlans = plans.data?.length ?? 0
    const galleryImages = gallery.data?.length ?? 0
    const monthlyViews = stats.data?.[0]?.monthly_views ?? 0

    console.log("[STATS] Dados processados:")
    console.log("- totalMessages:", totalMessages)
    console.log("- unreadMessages:", unreadMessages)
    console.log("- activePlans:", activePlans)
    console.log("- galleryImages:", galleryImages)
    console.log("- monthlyViews:", monthlyViews)
    console.log("- messages.data:", messages.data)
    console.log("- plans.data:", plans.data)
    console.log("- gallery.data:", gallery.data)

    const result = {
      total_messages: totalMessages,
      unread_messages: unreadMessages,
      active_plans: activePlans,
      gallery_images: galleryImages,
      monthly_views: monthlyViews,
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
