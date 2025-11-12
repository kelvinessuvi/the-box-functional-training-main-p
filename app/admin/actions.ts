"use server"

import { redirect } from "next/navigation"
import { createAdminSession, destroyAdminSession, getAdminEnvCreds } from "@/lib/auth/auth-utils"

export type LoginState = {
  ok: boolean
  error?: string
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState | void> {
  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")

  const env = getAdminEnvCreds()
  const valid = email === env.email && password === env.password

  if (!valid) {
    return { ok: false, error: "Credenciais inválidas" }
  }

  await createAdminSession(email)
  // Server-side redirect avoids any client promise/suspense issues.
  redirect("/admin/dashboard")
}

export async function logoutAction() {
  await destroyAdminSession()
  redirect("/admin")
}
