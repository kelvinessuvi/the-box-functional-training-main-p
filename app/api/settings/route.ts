import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/server"

const defaultSettings = {
  email: "theboxft2021@gmail.com",
  phone: "+244 923 525 886",
  whatsappNumber: "244923525886",
  location: "Luanda e Lisboa",
  workingHours: "Seg-Sex: 08:00-21:00",
  companyName: "THE BOX Functional Training",
  description:
    "A The Box é uma academia de referência em Artes Marciais, presente em Angola e Portugal, dedicada ao ensino técnico, desenvolvimento físico e evolução pessoal através de métodos modernos e rigorosos.\n\nO atendimento é realizado exclusivamente pelo WhatsApp ou presencialmente na academia, garantindo comunicação direta, eficiente e profissional.",
}

function normalizeWhatsAppNumber(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }

  return value.replace(/\D/g, "")
}

function isValidWhatsAppNumber(value: string) {
  return /^[0-9]{8,15}$/.test(value)
}

export async function GET() {
  try {
    console.log("[SETTINGS-GET] Carregando configurações...")

    if (!isSupabaseConfigured()) {
      console.log(
        "[SETTINGS-GET] Supabase não configurado, retornando padrões"
      )

      return NextResponse.json(defaultSettings, {
        headers: {
          "Cache-Control": "no-store",
        },
      })
    }

    const supabase = getServiceClient()

    if (!supabase) {
      console.log(
        "[SETTINGS-GET] Service client não disponível, retornando padrões"
      )

      return NextResponse.json(defaultSettings, {
        headers: {
          "Cache-Control": "no-store",
        },
      })
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "email, phone, whatsapp_number, location, working_hours, company_name, description"
      )
      .eq("id", 1)
      .single()

    if (error) {
      console.error(
        "[SETTINGS-GET] Erro ao buscar configurações:",
        error.message
      )

      return NextResponse.json(defaultSettings, {
        headers: {
          "Cache-Control": "no-store",
        },
      })
    }

    if (!data) {
      console.log(
        "[SETTINGS-GET] Nenhuma configuração encontrada, retornando padrões"
      )

      return NextResponse.json(defaultSettings, {
        headers: {
          "Cache-Control": "no-store",
        },
      })
    }

    const whatsappNumber =
      normalizeWhatsAppNumber(data.whatsapp_number) ||
      defaultSettings.whatsappNumber

    const settings = {
      email: data.email || defaultSettings.email,
      phone: data.phone || defaultSettings.phone,
      whatsappNumber,
      location: data.location || defaultSettings.location,
      workingHours: data.working_hours || defaultSettings.workingHours,
      companyName: data.company_name || defaultSettings.companyName,
      description: data.description || defaultSettings.description,
    }

    console.log("[SETTINGS-GET] Configurações carregadas com sucesso")

    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[SETTINGS-GET] Erro inesperado:", error)

    return NextResponse.json(defaultSettings, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[SETTINGS-POST] Recebendo requisição POST")

    const admin = await getAuthenticatedAdmin()

    console.log(
      "[SETTINGS-POST] Admin verificado:",
      admin ? admin.email : "NÃO AUTENTICADO"
    )

    if (!admin) {
      console.error("[SETTINGS-POST] Acesso negado - não autenticado")

      return NextResponse.json(
        {
          error: "Não autorizado",
        },
        {
          status: 401,
        }
      )
    }

    const body = await request.json()

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error: "Dados inválidos",
        },
        {
          status: 400,
        }
      )
    }

    const email =
      typeof body.email === "string" ? body.email.trim() : ""

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : ""

    const location =
      typeof body.location === "string" ? body.location.trim() : ""

    const workingHours =
      typeof body.workingHours === "string"
        ? body.workingHours.trim()
        : typeof body.working_hours === "string"
          ? body.working_hours.trim()
          : defaultSettings.workingHours

    const companyName =
      typeof body.companyName === "string"
        ? body.companyName.trim()
        : typeof body.company_name === "string"
          ? body.company_name.trim()
          : defaultSettings.companyName

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : defaultSettings.description

    const rawWhatsAppNumber =
      typeof body.whatsappNumber === "string"
        ? body.whatsappNumber
        : typeof body.whatsapp_number === "string"
          ? body.whatsapp_number
          : defaultSettings.whatsappNumber

    const whatsappNumber = normalizeWhatsAppNumber(rawWhatsAppNumber)

    if (!email || !phone || !location) {
      return NextResponse.json(
        {
          error: "Campos obrigatórios em falta",
        },
        {
          status: 400,
        }
      )
    }

    if (!workingHours) {
      return NextResponse.json(
        {
          error: "Horário de funcionamento em falta",
        },
        {
          status: 400,
        }
      )
    }

    if (!companyName) {
      return NextResponse.json(
        {
          error: "Nome da empresa em falta",
        },
        {
          status: 400,
        }
      )
    }

    if (!isValidWhatsAppNumber(whatsappNumber)) {
      return NextResponse.json(
        {
          error:
            "Número de WhatsApp inválido. Utilize um número internacional válido.",
        },
        {
          status: 400,
        }
      )
    }

    const responseSettings = {
      email,
      phone,
      whatsappNumber,
      location,
      workingHours,
      companyName,
      description,
    }

    if (!isSupabaseConfigured()) {
      console.log(
        "[SETTINGS-POST] Supabase não configurado, simulando salvamento"
      )

      return NextResponse.json({
        success: true,
        message: "Configurações salvas com sucesso (modo simulação)",
        settings: responseSettings,
      })
    }

    const supabase = getServiceClient()

    if (!supabase) {
      return NextResponse.json(
        {
          error: "Erro de configuração do servidor",
        },
        {
          status: 500,
        }
      )
    }

    const dbSettings = {
      id: 1,
      email,
      phone,
      whatsapp_number: whatsappNumber,
      location,
      working_hours: workingHours,
      company_name: companyName,
      description,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert(dbSettings, {
        onConflict: "id",
      })

    if (error) {
      console.error(
        "[SETTINGS-POST] Erro ao salvar configurações:",
        error
      )

      return NextResponse.json(
        {
          error: `Erro ao salvar configurações: ${error.message}`,
        },
        {
          status: 500,
        }
      )
    }

    console.log("[SETTINGS-POST] Configurações salvas com sucesso")

    return NextResponse.json({
      success: true,
      message: "Configurações salvas com sucesso",
      settings: responseSettings,
    })
  } catch (error) {
    console.error("[SETTINGS-POST] Erro inesperado:", error)

    const message =
      error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: `Erro ao salvar configurações: ${message}`,
      },
      {
        status: 500,
      }
    )
  }
}