import { NextResponse } from "next/server"
import { signJWT } from "@/lib/auth/jwt"
import { verifyPassword } from "@/lib/auth/password"
import { getServiceClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || "")
    const password = String(body?.password || "")

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Criar cliente Supabase
    const supabase = getServiceClient()
    if (!supabase) {
      console.error("[AUTH] Supabase não configurado")
      return NextResponse.json({ error: "Erro de configuração do servidor" }, { status: 500 })
    }

    // Buscar usuário no banco de dados
    console.log("[AUTH] Buscando usuário:", email)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, role, is_active')
      .eq('email', email)
      .single()

    if (userError) {
      console.error("[AUTH] Erro ao buscar usuário:", userError.message)
      console.error("[AUTH] Código:", userError.code)
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    if (!user) {
      console.log("[AUTH] Usuário não encontrado:", email)
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    console.log("[AUTH] Usuário encontrado:", user.email, "Role:", user.role, "Ativo:", user.is_active)

    // Verificar se o usuário está ativo
    if (!user.is_active) {
      console.log("[AUTH] Usuário inativo:", email)
      return NextResponse.json({ error: "Conta desativada" }, { status: 401 })
    }

    // Verificar senha
    const isPasswordValid = await verifyPassword(password, user.password_hash)
    if (!isPasswordValid) {
      console.log("[AUTH] Senha inválida para:", email)
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Atualizar último login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Gerar JWT com informações do usuário
    const token = await signJWT({ 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    }, 60 * 60 * 24 * 7) // 7 dias

    console.log("[AUTH] Login bem-sucedido para:", email, "Role:", user.role)

    const res = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }, { status: 200 })
    
    // Configuração do cookie
    // IMPORTANTE: httpOnly deve ser true para segurança, mas precisamos garantir que funcione
    const cookieOptions = {
      httpOnly: true, // Mais seguro - o JavaScript não pode acessar, mas o servidor pode ler
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    }
    
    res.cookies.set("admin-token", token, cookieOptions)
    
    console.log("[AUTH] Cookie admin-token definido com sucesso")
    console.log("[AUTH] Token gerado:", token.substring(0, 20) + "...")
    console.log("[AUTH] Cookie options:", { ...cookieOptions, maxAge: "7 dias" })
    
    return res

  } catch (err) {
    console.error("[AUTH] login error:", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
