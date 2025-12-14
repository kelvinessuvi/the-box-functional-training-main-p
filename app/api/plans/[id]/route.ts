import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedAdmin } from '@/lib/auth/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const supabase = getServiceClient()
    if (!supabase) {
      // Retornar plano demo
      return NextResponse.json({
        id,
        name: 'Plano Demo',
        price: 'R$ 1.000',
        description: 'Este é um plano de demonstração',
        duration: '4 horas',
        participants: '10-20 pessoas',
        features: ['Feature 1', 'Feature 2'],
        active: true,
        created_at: new Date().toISOString()
      })
    }

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[PLANS] Database error:', error)
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PLANS] Error fetching plan:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("[PLANS-PUT] Recebendo requisição PUT para:", params.id)
    const admin = await getAuthenticatedAdmin()
    console.log("[PLANS-PUT] Admin verificado:", admin ? admin.email : "NÃO AUTENTICADO")
    
    if (!admin) {
      console.error("[PLANS-PUT] ❌ Acesso negado - não autenticado")
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, price, description, duration, participants, features, active } = body
    const { id } = params

    if (!name || !price || !description) {
      return NextResponse.json(
        { error: 'Nome, preço e descrição são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()
    if (!supabase) {
      // Modo demo - simular sucesso
      const updatedPlan = {
        id,
        name,
        price,
        description,
        duration: duration || '',
        participants: participants || '',
        features: features || [],
        active: active ?? true,
        updated_at: new Date().toISOString()
      }
      return NextResponse.json(updatedPlan)
    }

    const { data, error } = await supabase
      .from('plans')
      .update({
        name,
        price,
        description,
        duration: duration || '',
        participants: participants || '',
        features: features || [],
        active: active ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PLANS] Database error:', error)
      return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PLANS] Error updating plan:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("[PLANS-DELETE] Recebendo requisição DELETE para:", params.id)
    const admin = await getAuthenticatedAdmin()
    console.log("[PLANS-DELETE] Admin verificado:", admin ? admin.email : "NÃO AUTENTICADO")
    
    if (!admin) {
      console.error("[PLANS-DELETE] ❌ Acesso negado - não autenticado")
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: 'Plano excluído (modo demo)'
      })
    }

    // Primeiro verificar se o plano existe
    const { data: checkData, error: checkError } = await supabase
      .from('plans')
      .select('id')
      .eq('id', id)
      .single()
    
    if (checkError || !checkData) {
      console.error('[PLANS] Plano não encontrado para deletar:', checkError)
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    console.log('[PLANS] Deletando plano do banco:', id)
    const { error, data: deleteData } = await supabase
      .from('plans')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('[PLANS] Delete DB error:', error)
      console.error('[PLANS] Error code:', error.code)
      console.error('[PLANS] Error message:', error.message)
      console.error('[PLANS] Error details:', error)
      
      // Se o erro for relacionado a RLS ou trigger, dar mensagem mais informativa
      if (error.message?.includes('UPDATE requires a WHERE clause') || 
          error.message?.includes('policy') ||
          error.code === '42501') {
        return NextResponse.json({ 
          error: `Erro ao excluir plano. Possível problema com trigger ou políticas RLS. Execute o script fix-trigger-update-plans.sql no Supabase. Erro: ${error.message}` 
        }, { status: 500 })
      }
      
      return NextResponse.json({ error: `Erro ao excluir plano: ${error.message}` }, { status: 500 })
    }

    console.log('[PLANS] Registro deletado com sucesso. Linhas afetadas:', deleteData?.length || 0)

    return NextResponse.json({ 
      success: true, 
      message: 'Plano excluído com sucesso' 
    })
  } catch (error) {
    console.error('[PLANS] Error deleting plan:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
