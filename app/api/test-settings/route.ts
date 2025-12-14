import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedAdmin } from "@/lib/auth/auth-utils"

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin()
    
    return NextResponse.json({
      success: true,
      hasAdmin: !!admin,
      admin: admin ? {
        sub: admin.sub,
        email: admin.email,
        role: admin.role
      } : null,
      message: admin ? "Admin autenticado com sucesso" : "Nenhum admin autenticado"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
