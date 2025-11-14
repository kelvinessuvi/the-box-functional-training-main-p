import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"

// Configurações padrão
const defaultSettings = {
  email: "geral@theboxacademy.com",
  phone: "+244 923 525 886",
  location: "Luanda e Lisboa",
  workingHours: "Seg-Sex: 08:00-21:00",
  companyName: "THE BOX Functional Training",
  description: "Aqui o Sistema é Bruto. Academia de Artes Marciais com foco em Jiu-Jitsu, oferecendo treinos de alta qualidade e desenvolvimento pessoal em Angola e Portugal."
}

export async function GET() {
  try {
    console.log("[SETTINGS-GET] Carregando configurações...")
    
    if (!isSupabaseConfigured()) {
      console.log("[SETTINGS-GET] Supabase não configurado, retornando padrões")
      return NextResponse.json(defaultSettings)
    }

    const supabase = getServiceClient()
    if (!supabase) {
      console.log("[SETTINGS-GET] Service client não disponível, retornando padrões")
      return NextResponse.json(defaultSettings)
    }

    // Buscar configurações do banco
    const { data, error } = await supabase
      .from('site_settings')
      .select('email, phone, location, working_hours, company_name, description')
      .eq('id', 1)
      .single()

    if (error) {
      console.error("[SETTINGS-GET] Erro ao buscar configurações:", error.message)
      // Se não existir registro, retornar padrões
      if (error.code === 'PGRST116') {
        console.log("[SETTINGS-GET] Nenhuma configuração encontrada, retornando padrões")
        return NextResponse.json(defaultSettings)
      }
      return NextResponse.json(defaultSettings)
    }

    if (!data) {
      console.log("[SETTINGS-GET] Nenhuma configuração encontrada, retornando padrões")
      return NextResponse.json(defaultSettings)
    }

    // Mapear campos do banco para o formato esperado
    const settings = {
      email: data.email || defaultSettings.email,
      phone: data.phone || defaultSettings.phone,
      location: data.location || defaultSettings.location,
      workingHours: data.working_hours || defaultSettings.workingHours,
      companyName: data.company_name || defaultSettings.companyName,
      description: data.description || defaultSettings.description
    }

    console.log("[SETTINGS-GET] Configurações carregadas do banco:", settings)
    return NextResponse.json(settings)
  } catch (error) {
    console.error("[SETTINGS-GET] Erro inesperado:", error)
    return NextResponse.json(defaultSettings)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[SETTINGS-POST] Recebendo requisição POST")
    const admin = await getAuthenticatedAdmin()
    console.log("[SETTINGS-POST] Admin verificado:", admin ? admin.email : "NÃO AUTENTICADO")
    
    if (!admin) {
      console.error("[SETTINGS-POST] ❌ Acesso negado - não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const settings = await request.json()
    console.log("[SETTINGS-POST] Configurações recebidas:", settings)

    // Validar campos obrigatórios
    if (!settings.email || !settings.phone || !settings.location) {
      return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      console.log("[SETTINGS-POST] Supabase não configurado, simulando salvamento")
      return NextResponse.json({
        success: true,
        message: "Configurações salvas com sucesso (modo simulação)",
        settings: settings
      })
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: "Erro de configuração do servidor" }, { status: 500 })
    }

    // Mapear campos para o formato do banco
    const dbSettings = {
      email: settings.email,
      phone: settings.phone,
      location: settings.location,
      working_hours: settings.workingHours || settings.working_hours,
      company_name: settings.companyName || settings.company_name,
      description: settings.description,
      updated_at: new Date().toISOString()
    }

    // Tentar atualizar primeiro
    const { data: updateData, error: updateError } = await supabase
      .from('site_settings')
      .update(dbSettings)
      .eq('id', 1)
      .select()
      .single()

    if (updateError) {
      // Se não existir registro, criar um novo
      if (updateError.code === 'PGRST116' || updateError.message?.includes('no rows')) {
        console.log("[SETTINGS-POST] Registro não existe, criando novo...")
        
        const { data: insertData, error: insertError } = await supabase
          .from('site_settings')
          .insert({
            id: 1,
            ...dbSettings
          })
          .select()
          .single()

        if (insertError) {
          console.error("[SETTINGS-POST] Erro ao criar configurações:", insertError)
          return NextResponse.json({ 
            error: `Erro ao criar configurações: ${insertError.message}` 
          }, { status: 500 })
        }

        console.log("[SETTINGS-POST] ✅ Configurações criadas com sucesso")
        return NextResponse.json({
          success: true,
          message: "Configurações salvas com sucesso",
          settings: settings
        })
      }

      console.error("[SETTINGS-POST] Erro ao atualizar configurações:", updateError)
      return NextResponse.json({ 
        error: `Erro ao salvar configurações: ${updateError.message}` 
      }, { status: 500 })
    }

    console.log("[SETTINGS-POST] ✅ Configurações atualizadas com sucesso")
    return NextResponse.json({
      success: true,
      message: "Configurações salvas com sucesso",
      settings: settings
    })
  } catch (error: any) {
    console.error("[SETTINGS-POST] Erro inesperado:", error)
    return NextResponse.json({ 
      error: `Erro ao salvar configurações: ${error.message || 'Erro desconhecido'}` 
    }, { status: 500 })
  }
}
