"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
}

export function ChangePasswordModal({ isOpen, onClose, onSave }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("A senha deve ter pelo menos 8 caracteres")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra maiúscula")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra minúscula")
    }
    if (!/\d/.test(password)) {
      errors.push("A senha deve conter pelo menos um número")
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("A senha deve conter pelo menos um caractere especial")
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsLoading(true)

    // Validações
    const validationErrors: string[] = []

    if (!formData.currentPassword) {
      validationErrors.push("A senha atual é obrigatória")
    }

    if (!formData.newPassword) {
      validationErrors.push("A nova senha é obrigatória")
    } else {
      const passwordErrors = validatePassword(formData.newPassword)
      validationErrors.push(...passwordErrors)
    }

    if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.push("As senhas não coincidem")
    }

    if (formData.currentPassword === formData.newPassword) {
      validationErrors.push("A nova senha deve ser diferente da senha atual")
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setIsLoading(false)
      return
    }

    try {
      // Simular verificação da senha atual
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simular senha atual incorreta às vezes
          if (formData.currentPassword !== "admin123") {
            reject(new Error("Senha atual incorreta"))
          } else {
            resolve(true)
          }
        }, 1000)
      })

      // Se chegou aqui, a senha foi alterada com sucesso
      onSave({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      alert("Senha alterada com sucesso!")
      onClose()
    } catch (error: any) {
      setErrors([error.message])
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" }

    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    if (score <= 2) return { strength: score, label: "Fraca", color: "bg-red-500" }
    if (score <= 3) return { strength: score, label: "Média", color: "bg-yellow-500" }
    if (score <= 4) return { strength: score, label: "Boa", color: "bg-blue-500" }
    return { strength: score, label: "Muito Forte", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Alterar Senha
          </DialogTitle>
          <DialogDescription>
            Altere sua senha de acesso ao painel administrativo. Use uma senha forte para manter sua conta segura.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Erros */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Erro na validação:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Digite sua senha atual"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Digite sua nova senha"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>

            {/* Indicador de força da senha */}
            {formData.newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Força da senha:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength.strength <= 2
                        ? "text-red-600"
                        : passwordStrength.strength <= 3
                          ? "text-yellow-600"
                          : passwordStrength.strength <= 4
                            ? "text-blue-600"
                            : "text-green-600"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirme sua nova senha"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>

            {/* Indicador de confirmação */}
            {formData.confirmPassword && (
              <div className="flex items-center text-sm">
                {formData.newPassword === formData.confirmPassword ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    As senhas coincidem
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    As senhas não coincidem
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Requisitos da senha */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Requisitos da senha:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Pelo menos 8 caracteres</li>
              <li>• Uma letra maiúscula</li>
              <li>• Uma letra minúscula</li>
              <li>• Um número</li>
              <li>• Um caractere especial (!@#$%^&*)</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gradient-wine-red hover:gradient-wine-red-hover text-white"
              disabled={isLoading}
            >
              {isLoading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
