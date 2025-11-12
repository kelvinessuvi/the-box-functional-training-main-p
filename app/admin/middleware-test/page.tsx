import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth/jwt"

export const dynamic = "force-dynamic"

export default async function MiddlewareTestPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin-token")?.value

  let status = "Não autenticado"
  let payload = null

  if (token) {
    try {
      payload = await verifyJWT(token)
      if (payload) {
        status = "Autenticado"
      } else {
        status = "Token inválido"
      }
    } catch (error) {
      status = `Erro: ${String(error)}`
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Middleware/Auth</h1>
      <div className="space-y-2">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Token encontrado:</strong> {token ? "SIM" : "NÃO"}</p>
        {token && (
          <p><strong>Token (primeiros 20 chars):</strong> {token.substring(0, 20)}...</p>
        )}
        {payload && (
          <div>
            <p><strong>Payload:</strong></p>
            <pre className="bg-gray-100 p-4 rounded mt-2">{JSON.stringify(payload, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

