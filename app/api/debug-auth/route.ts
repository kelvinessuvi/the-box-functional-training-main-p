import { NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"

export async function GET(req: Request) {
  try {
    const cookies = req.headers.get("cookie") || ""
    const adminToken = cookies.split(";").find(cookie => 
      cookie.trim().startsWith("admin-token=")
    )?.split("=")[1]

    console.log("[DEBUG-AUTH] Cookies recebidos:", cookies)
    console.log("[DEBUG-AUTH] Admin token encontrado:", adminToken ? "SIM" : "NÃO")

    if (!adminToken) {
      return NextResponse.json({ 
        status: "não autenticado",
        message: "Nenhum token admin encontrado",
        cookies: cookies.split(";").map(c => c.trim())
      })
    }

    // Verificar o token
    const payload = await verifyJWT(adminToken)
    
    if (!payload) {
      return NextResponse.json({ 
        status: "token inválido",
        message: "Token admin inválido ou expirado",
        token: adminToken.substring(0, 20) + "..."
      })
    }

    return NextResponse.json({ 
      status: "autenticado",
      message: "Token admin válido",
      payload,
      token: adminToken.substring(0, 20) + "..."
    })

  } catch (error) {
    console.error("[DEBUG-AUTH] Erro:", error)
    return NextResponse.json({ 
      status: "erro",
      message: "Erro ao verificar autenticação",
      error: String(error)
    }, { status: 500 })
  }
}
