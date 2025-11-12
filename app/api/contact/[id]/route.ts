import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getAuthenticatedAdmin } from '@/lib/auth/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params

    if (!isSupabaseConfigured()) {
      // Retornar mensagem demo
      return NextResponse.json({
        id,
        name: 'Demo User',
        email: 'demo@email.com',
        company: 'Demo Company',
        subject: 'Demo Subject',
        message: 'Esta é uma mensagem de demonstração.',
        read: true,
        created_at: new Date().toISOString()
      })
    }

    const supabase = getServiceClient()!
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[CONTACT] Database error:', error.message)
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
    }

    // Marcar como lida
    if (!data.read) {
      await supabase
        .from('contact_messages')
        .update({ read: true })
        .eq('id', id)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[CONTACT] Error fetching message:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("[CONTACT-DELETE] Recebendo requisição DELETE para:", params.id)
    const admin = await getAuthenticatedAdmin()
    console.log("[CONTACT-DELETE] Admin verificado:", admin ? admin.email : "NÃO AUTENTICADO")
    
    if (!admin) {
      console.error("[CONTACT-DELETE] ❌ Acesso negado - não autenticado")
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Mensagem excluída (modo demo)'
      })
    }

    const supabase = getServiceClient()!
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[CONTACT] Database error:', error.message)
      return NextResponse.json({ error: 'Erro ao excluir mensagem' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mensagem excluída com sucesso' 
    })
  } catch (error) {
    console.error('[CONTACT] Error deleting message:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 })
    }
    const supabase = getServiceClient()!
    const { error } = await supabase.from("contact_messages").update({ read: true }).eq("id", params.id)
    if (error) {
      console.error("[CONTACT] Update error:", error.message)
      return NextResponse.json({ error: "Erro ao atualizar mensagem" }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[CONTACT] Unexpected error:", err)
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 })
  }
}
