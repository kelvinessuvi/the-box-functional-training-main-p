import { NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { verifyPassword, hashPassword } from "@/lib/auth/password"
import { getServiceClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    // Verificar token de autenticação
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Senha atual e nova senha são obrigatórias" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Nova senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: "Erro de configuração do servidor" }, { status: 500 })
    }

    // Buscar usuário atual
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', payload.sub)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    // Criptografar nova senha
    const newPasswordHash = await hashPassword(newPassword)

    // Atualizar senha
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', payload.sub)

    if (updateError) {
      console.error("[CHANGE-PASSWORD] Erro ao atualizar senha:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 })
    }

    console.log("[CHANGE-PASSWORD] Senha alterada com sucesso para usuário:", payload.sub)
    return NextResponse.json({ message: "Senha alterada com sucesso" })

  } catch (error) {
    console.error("[CHANGE-PASSWORD] Erro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
