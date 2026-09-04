import { NextResponse } from "next/server"

import { signJWT } from "@/lib/auth/jwt"
import { verifyPassword } from "@/lib/auth/password"
import { getServiceClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const email = String(body?.email || "").trim()
    const password = String(body?.password || "")

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email e senha são obrigatórios",
        },
        {
          status: 400,
        }
      )
    }

    const supabase = getServiceClient()

    if (!supabase) {
      console.error(
        "[AUTH] Supabase não configurado"
      )

      return NextResponse.json(
        {
          error:
            "Erro de configuração do servidor",
        },
        {
          status: 500,
        }
      )
    }

    console.log(
      "[AUTH] A processar tentativa de login"
    )

    const {
      data: user,
      error: userError,
    } = await supabase
      .from("users")
      .select(
        "id, email, password_hash, role, is_active"
      )
      .eq("email", email)
      .single()

    if (userError || !user) {
      console.warn(
        "[AUTH] Credenciais inválidas ou utilizador não encontrado"
      )

      return NextResponse.json(
        {
          error:
            "Email ou senha inválidos",
        },
        {
          status: 401,
        }
      )
    }

    if (!user.is_active) {
      console.warn(
        "[AUTH] Tentativa de login numa conta inactiva"
      )

      return NextResponse.json(
        {
          error: "Conta desactivada",
        },
        {
          status: 401,
        }
      )
    }

    const isPasswordValid =
      await verifyPassword(
        password,
        user.password_hash
      )

    if (!isPasswordValid) {
      console.warn(
        "[AUTH] Credenciais inválidas"
      )

      return NextResponse.json(
        {
          error:
            "Email ou senha inválidos",
        },
        {
          status: 401,
        }
      )
    }

    const { error: loginUpdateError } =
      await supabase
        .from("users")
        .update({
          last_login:
            new Date().toISOString(),
        })
        .eq("id", user.id)

    if (loginUpdateError) {
      console.warn(
        "[AUTH] Não foi possível actualizar last_login:",
        loginUpdateError.message
      )
    }

    const token = await signJWT(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      60 * 60 * 24 * 7
    )

    const response =
      NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
        {
          status: 200,
        }
      )

    response.cookies.set(
      "admin-token",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge:
          60 * 60 * 24 * 7,
      }
    )

    console.log(
      "[AUTH] Login efectuado com sucesso"
    )

    return response
  } catch (error) {
    console.error(
      "[AUTH] Erro interno no login:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Erro interno do servidor",
      },
      {
        status: 500,
      }
    )
  }
}