import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { hashPassword } from "@/lib/auth/password"

// GET - Listar todos os usuários (apenas super admin)
export async function GET(req: Request) {
  try {
    // Verificar token de autenticação
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: "Erro de configuração do servidor" }, { status: 500 })
    }

    // Buscar todos os usuários
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, is_active, created_at, updated_at, last_login')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("[ADMIN-USERS] Erro ao buscar usuários:", error)
      return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error("[ADMIN-USERS] Erro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Criar novo usuário (apenas super admin)
export async function POST(req: Request) {
  try {
    // Verificar token de autenticação
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await req.json()
    const { email, password, role = "admin" } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    if (!["admin", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "Role inválido" }, { status: 400 })
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: "Erro de configuração do servidor" }, { status: 500 })
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "Email já existe" }, { status: 409 })
    }

    // Criptografar senha
    const passwordHash = await hashPassword(password)

    // Criar usuário
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role,
        created_by: payload.sub
      })
      .select('id, email, role, is_active, created_at')
      .single()

    if (error) {
      console.error("[ADMIN-USERS] Erro ao criar usuário:", error)
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
    }

    console.log("[ADMIN-USERS] Usuário criado:", email, "Role:", role)
    return NextResponse.json({ 
      message: "Usuário criado com sucesso",
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error("[ADMIN-USERS] Erro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT - Atualizar usuário (apenas super admin)
export async function PUT(req: Request) {
  try {
    // Verificar token de autenticação
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await req.json()
    const { id, email, password, role, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: "Erro de configuração do servidor" }, { status: 500 })
    }

    // Verificar se usuário existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single()

    if (!existingUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Não permitir alterar role de super admin para admin
    if (existingUser.role === "super_admin" && role === "admin") {
      return NextResponse.json({ error: "Não é possível rebaixar um super admin" }, { status: 400 })
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (typeof is_active === 'boolean') updateData.is_active = is_active

    // Se senha for fornecida, criptografar
    if (password) {
      updateData.password_hash = await hashPassword(password)
    }

    // Atualizar usuário
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, role, is_active, updated_at')
      .single()

    if (error) {
      console.error("[ADMIN-USERS] Erro ao atualizar usuário:", error)
      return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
    }

    console.log("[ADMIN-USERS] Usuário atualizado:", id)
    return NextResponse.json({ 
      message: "Usuário atualizado com sucesso",
      user: updatedUser
    })

  } catch (error) {
    console.error("[ADMIN-USERS] Erro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE - Deletar usuário (apenas super admin)
export async function DELETE(req: Request) {
  try {
    // Verificar token de autenticação
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    // Não permitir deletar a si mesmo
    if (id === payload.sub) {
      return NextResponse.json({ error: "Não é possível deletar sua própria conta" }, { status: 400 })
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: "Erro de configuração do servidor" }, { status: 500 })
    }

    // Verificar se usuário existe e não é super admin
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single()

    if (!existingUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (existingUser.role === "super_admin") {
      return NextResponse.json({ error: "Não é possível deletar um super admin" }, { status: 400 })
    }

    // Deletar usuário
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("[ADMIN-USERS] Erro ao deletar usuário:", error)
      return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 })
    }

    console.log("[ADMIN-USERS] Usuário deletado:", id)
    return NextResponse.json({ message: "Usuário deletado com sucesso" })

  } catch (error) {
    console.error("[ADMIN-USERS] Erro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
