"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login")
      }

      console.log("[ADMIN-LOGIN] Login bem-sucedido, redirecionando...")
      console.log("[ADMIN-LOGIN] Dados recebidos:", data)
      
      // Verificar se o cookie foi definido (pode não estar acessível via JavaScript se httpOnly)
      console.log("[ADMIN-LOGIN] Cookies do navegador:", document.cookie)
      
      // Usar window.location.href para forçar reload completo e garantir que o cookie seja enviado
      // Isso garante que o servidor receba o cookie na próxima requisição
      window.location.href = "/admin/dashboard"
      
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="pt-8 pb-2">
            <Link href="/" className="block mx-auto mb-4 hover:opacity-80 transition-opacity">
              <Image
                src="/images/logo.png"
                alt="Super Beast"
                width={400}
                height={120}
                className="h-32 w-auto mx-auto cursor-pointer"
              />
            </Link>
          </div>
          
          <div className="pt-2 pb-2">
            <CardTitle className="text-2xl font-bold">Painel Administrativo</CardTitle>
            <CardDescription className="text-base">Faça login para acessar o painel de controle</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="admin@superbeast.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full gradient-wine-red hover:gradient-wine-red-hover text-white"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  )
}
