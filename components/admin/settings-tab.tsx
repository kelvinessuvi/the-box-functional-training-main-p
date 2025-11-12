"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, Save, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    email: "info@fitem14semanas.com",
    phone: "+244 XXX XXX XXX",
    location: "Luanda, Angola",
    workingHours: "Seg-Sex: 08:00-18:00",
    companyName: "Super Beast - Fit Em 14 Semanas",
    description: "Transformamos equipas através do fitness, entretenimento e desenvolvimento pessoal em Angola."
  })
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para alterar senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Carregar configurações ao montar o componente
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    console.log("[SETTINGS] Iniciando salvamento...", settings)
    
    try {
      console.log("[SETTINGS] Fazendo requisição para /api/settings...")
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(settings),
      })

      console.log("[SETTINGS] Resposta recebida:", response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[SETTINGS] Erro na resposta:", errorData)
        throw new Error(errorData.error || "Erro ao salvar configurações")
      }

      const successData = await response.json()
      console.log("[SETTINGS] Sucesso:", successData)
      toast.success("Configurações salvas com sucesso!")
    } catch (error: any) {
      console.error("[SETTINGS] Erro ao salvar configurações:", error)
      toast.error(error.message || "Erro ao salvar configurações")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Função para alterar senha
  const handleChangePassword = async () => {
    // Validações
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Todos os campos são obrigatórios")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("A nova senha e confirmação não coincidem")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsChangingPassword(true)

    try {
      // Buscar token do cookie
      const cookies = document.cookie.split(";")
      const adminToken = cookies.find(cookie => 
        cookie.trim().startsWith("admin-token=")
      )?.split("=")[1]

      if (!adminToken) {
        toast.error("Token de autenticação não encontrado")
        return
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao alterar senha")
      }

      toast.success("Senha alterada com sucesso!")
      
      // Limpar formulário
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar senha")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações do Site</h2>
        <p className="text-gray-600">Gerencie as informações de contacto, detalhes da empresa e sua conta</p>
      </div>

      {/* Alterar Senha - NOVA SEÇÃO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#bb1e39]" />
            Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button 
              onClick={handleChangePassword} 
              disabled={isChangingPassword}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isChangingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#bb1e39]" />
            Informações de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Principal</Label>
              <Input
                id="email"
                value={settings.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="info@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+244 XXX XXX XXX"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={settings.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Cidade, País"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workingHours">Horário de Funcionamento</Label>
            <Input
              id="workingHours"
              value={settings.workingHours}
              onChange={(e) => handleChange("workingHours", e.target.value)}
              placeholder="Seg-Sex: 08:00-18:00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#bb1e39]" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="Nome da sua empresa"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição da Empresa</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Breve descrição da sua empresa e serviços"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-center">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="gradient-wine-red hover:gradient-wine-red-hover text-white px-8 py-3"
        >
          <Save className="w-5 h-5 mr-2" />
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      {/* Preview das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#bb1e39]" />
                <span className="font-medium">{settings.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#bb1e39]" />
                <span className="font-medium">{settings.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#bb1e39]" />
                <span className="font-medium">{settings.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#bb1e39]" />
                <span className="font-medium">{settings.workingHours}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{settings.companyName}</h4>
              <p className="text-sm text-gray-600">{settings.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
