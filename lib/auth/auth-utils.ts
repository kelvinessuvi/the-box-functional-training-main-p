import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { signJWT, verifyJWT } from "./jwt"

export type AdminClaims = {
  sub: string
  email: string
  role: "admin"
}

const COOKIE_NAME = "admin-token"

/**
 * Use env vars if set; otherwise provide dev-friendly defaults so preview doesn't block.
 */
export function getAdminEnvCreds() {
  const email = process.env.ADMIN_EMAIL || "geral@theboxft.com"
  const password = process.env.ADMIN_PASSWORD || "admin123"
  return { email, password }
}

/**
 * Create session cookie.
 */
export async function createAdminSession(email: string) {
  const token = await signJWT({ sub: email, email, role: "admin" })
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Not secure in dev/preview to ensure cookies are accepted locally.
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  })
}

/**
 * Destroy session.
 */
export async function destroyAdminSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/**
 * Return the current admin or null.
 */
export async function getAuthenticatedAdmin(): Promise<AdminClaims | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  
  console.log("[AUTH-UTILS] Verificando autenticação...")
  console.log("[AUTH-UTILS] Cookie encontrado:", token ? "SIM" : "NÃO")
  
  if (!token) {
    console.log("[AUTH-UTILS] Nenhum token encontrado nos cookies")
    return null
  }
  
  const payload = await verifyJWT<{ sub?: string; email?: string; role?: string }>(token)
  
  if (!payload?.email) {
    console.log("[AUTH-UTILS] Token inválido ou sem email")
    return null
  }
  
  console.log("[AUTH-UTILS] Token válido para:", payload.email, "Role:", payload.role || "admin")
  
  return {
    sub: payload.sub || payload.email,
    email: payload.email,
    role: "admin",
  }
}

/**
 * Guard helper to enforce auth in Server Components.
 */
export async function requireAdmin() {
  const admin = await getAuthenticatedAdmin()
  if (!admin) redirect("/admin")
  return admin
}
