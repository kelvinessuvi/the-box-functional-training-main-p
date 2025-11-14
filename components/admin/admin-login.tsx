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
        // Mensagens de erro mais específicas
        let errorMessage = data.error || "Erro ao fazer login"
        
        // Adicionar detalhes se disponíveis
        if (data.details) {
          errorMessage += `\n\n${data.details}`
        }
        
        if (response.status === 500) {
          errorMessage = "Erro de configuração do servidor. Verifique se o Supabase está configurado corretamente no arquivo .env.local"
          if (data.details) {
            errorMessage += `\n\n${data.details}`
          }
        } else if (response.status === 401) {
          // Manter a mensagem original da API se for mais específica
          if (!data.error.includes("não encontrado") && !data.error.includes("Senha incorreta")) {
            errorMessage = data.error || "Credenciais inválidas. Verifique se o email e senha estão corretos."
          }
          if (data.details) {
            errorMessage += `\n\n${data.details}`
          }
        }
        
        throw new Error(errorMessage)
      }

      console.log("[ADMIN-LOGIN] Login bem-sucedido, redirecionando...")
      console.log("[ADMIN-LOGIN] Dados recebidos:", data)
      
      // Usar window.location.href para forçar reload completo e garantir que o cookie seja enviado
      window.location.href = "/admin/dashboard"
      
    } catch (error: any) {
      console.error("[ADMIN-LOGIN] Erro:", error)
      setError(error.message || "Ocorreu um erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-[#0A0A0A] border-[#1A1A1A]">
        <CardHeader className="text-center">
          <div className="pt-8 pb-2">
            <Link href="/" className="block mx-auto mb-4 hover:opacity-80 transition-opacity">
              <Image
                src="/images/the-box-logo.svg"
                alt="THE BOX Functional Training"
                width={300}
                height={100}
                className="h-24 w-auto mx-auto cursor-pointer"
              />
            </Link>
          </div>
          
          <div className="pt-2 pb-2">
            <CardTitle className="text-2xl font-bold text-white">Painel Administrativo</CardTitle>
            <CardDescription className="text-base text-[#B3B3B3]">Faça login para acessar o painel de controle</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-[#1A1A1A] border border-red-500 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-500 whitespace-pre-line">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="geral@theboxft.com"
                required
                className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="pr-10 bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-[#D4AF37] focus:outline-none transition-colors"
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
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
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
