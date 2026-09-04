"use client"

import { useEffect, useState } from "react"
import {
  Clock,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const defaultSettings = {
  email: "theboxft2021@gmail.com",
  phone: "+244 923 525 886",
  whatsappNumber: "244923525886",
  location: "Luanda e Lisboa",
  workingHours: "Seg-Sex: 08:00-21:00",
  companyName: "THE BOX Functional Training",
  description:
    "A The Box é uma academia de referência em Artes Marciais, presente em Angola e Portugal, dedicada ao ensino técnico, desenvolvimento físico e evolução pessoal através de métodos modernos e rigorosos.\n\nO atendimento é realizado exclusivamente pelo WhatsApp ou presencialmente na academia, garantindo comunicação direta, eficiente e profissional.",
}

const cardClass =
  "border-[#242424] bg-[#111111] text-white shadow-none"

const inputClass =
  "h-11 border-[#2A2A2A] bg-[#0A0A0A] text-white placeholder:text-[#666666] focus-visible:border-[#D4AF37] focus-visible:ring-1 focus-visible:ring-[#D4AF37]"

const labelClass =
  "text-sm font-medium text-[#E7E7E7]"

const sectionDescriptionClass =
  "text-sm leading-relaxed text-[#8F8F8F]"

function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "")
}

function formatWhatsAppNumber(value: string) {
  const digits = normalizeWhatsAppNumber(value)

  if (digits.startsWith("244") && digits.length === 12) {
    return `+244 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`
  }

  if (!digits) {
    return "Não configurado"
  }

  return `+${digits}`
}

export default function SettingsTab() {
  const [settings, setSettings] = useState(defaultSettings)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] =
    useState(true)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isChangingPassword, setIsChangingPassword] =
    useState(false)

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings", {
          cache: "no-store",
          headers: {
            "Cache-Control":
              "no-cache, no-store, must-revalidate",
          },
        })

        if (!response.ok) {
          throw new Error(
            "Não foi possível carregar as configurações"
          )
        }

        const data = await response.json()

        setSettings({
          email: data.email || defaultSettings.email,
          phone: data.phone || defaultSettings.phone,
          whatsappNumber:
            data.whatsappNumber ||
            defaultSettings.whatsappNumber,
          location:
            data.location || defaultSettings.location,
          workingHours:
            data.workingHours ||
            defaultSettings.workingHours,
          companyName:
            data.companyName ||
            defaultSettings.companyName,
          description:
            data.description ||
            defaultSettings.description,
        })
      } catch (error) {
        console.error(
          "[SETTINGS] Erro ao carregar configurações:",
          error
        )

        toast.error(
          "Não foi possível carregar as configurações do site"
        )
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    const normalizedWhatsAppNumber =
      normalizeWhatsAppNumber(settings.whatsappNumber)

    if (
      !/^[0-9]{8,15}$/.test(
        normalizedWhatsAppNumber
      )
    ) {
      toast.error(
        "Introduza um número de WhatsApp internacional válido"
      )
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          ...settings,
          whatsappNumber: normalizedWhatsAppNumber,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(
          errorData.error ||
            "Erro ao salvar configurações"
        )
      }

      const successData = await response.json()

      if (successData.settings) {
        setSettings({
          email:
            successData.settings.email ||
            defaultSettings.email,
          phone:
            successData.settings.phone ||
            defaultSettings.phone,
          whatsappNumber:
            successData.settings.whatsappNumber ||
            defaultSettings.whatsappNumber,
          location:
            successData.settings.location ||
            defaultSettings.location,
          workingHours:
            successData.settings.workingHours ||
            defaultSettings.workingHours,
          companyName:
            successData.settings.companyName ||
            defaultSettings.companyName,
          description:
            successData.settings.description ||
            defaultSettings.description,
        })
      }

      toast.success(
        "Configurações salvas com sucesso!"
      )
    } catch (error) {
      console.error(
        "[SETTINGS] Erro ao salvar configurações:",
        error
      )

      const message =
        error instanceof Error
          ? error.message
          : "Erro ao salvar configurações"

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    field: keyof typeof settings,
    value: string
  ) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error(
        "Todos os campos são obrigatórios"
      )
      return
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      toast.error(
        "A nova senha e confirmação não coincidem"
      )
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(
        "A nova senha deve ter pelo menos 6 caracteres"
      )
      return
    }

    setIsChangingPassword(true)

    try {
      const cookies = document.cookie.split(";")

      const adminToken = cookies
        .find((cookie) =>
          cookie
            .trim()
            .startsWith("admin-token=")
        )
        ?.split("=")[1]

      if (!adminToken) {
        toast.error(
          "Token de autenticação não encontrado"
        )
        return
      }

      const response = await fetch(
        "/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            currentPassword:
              passwordForm.currentPassword,
            newPassword:
              passwordForm.newPassword,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()

        throw new Error(
          error.error ||
            "Erro ao alterar senha"
        )
      }

      toast.success("Senha alterada com sucesso!")

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao alterar senha"

      toast.error(message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const togglePasswordVisibility = (
    field: "current" | "new" | "confirm"
  ) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }))
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#D4AF37]" />

          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            Administração
          </span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Configurações do Site
        </h2>

        <p className="max-w-2xl text-sm leading-relaxed text-[#8F8F8F]">
          Gerencie os contactos, informações institucionais
          e credenciais administrativas da THE BOX.
        </p>
      </div>

      <Card className={cardClass}>
        <CardHeader className="border-b border-[#242424] pb-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#3A321A] bg-[#1B170A]">
              <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-lg text-white">
                Segurança da Conta
              </CardTitle>

              <p className={sectionDescriptionClass}>
                Altere a senha utilizada para entrar no
                painel administrativo.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className={labelClass}
              >
                Senha Actual
              </Label>

              <div className="relative">
                <Input
                  id="currentPassword"
                  type={
                    showPasswords.current
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={(event) =>
                    setPasswordForm(
                      (previous) => ({
                        ...previous,
                        currentPassword:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() =>
                    togglePasswordVisibility(
                      "current"
                    )
                  }
                  aria-label={
                    showPasswords.current
                      ? "Ocultar senha actual"
                      : "Mostrar senha actual"
                  }
                  className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-[#737373] transition-colors hover:text-[#D4AF37]"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className={labelClass}
              >
                Nova Senha
              </Label>

              <div className="relative">
                <Input
                  id="newPassword"
                  type={
                    showPasswords.new
                      ? "text"
                      : "password"
                  }
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm(
                      (previous) => ({
                        ...previous,
                        newPassword:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() =>
                    togglePasswordVisibility("new")
                  }
                  aria-label={
                    showPasswords.new
                      ? "Ocultar nova senha"
                      : "Mostrar nova senha"
                  }
                  className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-[#737373] transition-colors hover:text-[#D4AF37]"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className={labelClass}
            >
              Confirmar Nova Senha
            </Label>

            <div className="relative">
              <Input
                id="confirmPassword"
                type={
                  showPasswords.confirm
                    ? "text"
                    : "password"
                }
                value={
                  passwordForm.confirmPassword
                }
                onChange={(event) =>
                  setPasswordForm(
                    (previous) => ({
                      ...previous,
                      confirmPassword:
                        event.target.value,
                    })
                  )
                }
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() =>
                  togglePasswordVisibility(
                    "confirm"
                  )
                }
                aria-label={
                  showPasswords.confirm
                    ? "Ocultar confirmação da senha"
                    : "Mostrar confirmação da senha"
                }
                className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-[#737373] transition-colors hover:text-[#D4AF37]"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="h-11 bg-[#D4AF37] px-6 font-semibold text-black hover:bg-[#B8941F]"
            >
              <Lock className="mr-2 h-4 w-4" />

              {isChangingPassword
                ? "A alterar..."
                : "Alterar Senha"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="border-b border-[#242424] pb-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#3A321A] bg-[#1B170A]">
              <Mail className="h-5 w-5 text-[#D4AF37]" />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-lg text-white">
                Informações de Contacto
              </CardTitle>

              <p className={sectionDescriptionClass}>
                Estes dados são utilizados nas áreas públicas
                do website e nos contactos via WhatsApp.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoadingSettings ? (
            <div className="flex min-h-32 items-center justify-center">
              <p className="text-sm text-[#8F8F8F]">
                A carregar configurações...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={labelClass}
                  >
                    Email Principal
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="info@empresa.com"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className={labelClass}
                  >
                    Telefone
                  </Label>

                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="+244 XXX XXX XXX"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="whatsappNumber"
                    className={labelClass}
                  >
                    Número de WhatsApp
                  </Label>

                  <Input
                    id="whatsappNumber"
                    type="tel"
                    inputMode="numeric"
                    value={settings.whatsappNumber}
                    onChange={(event) =>
                      handleChange(
                        "whatsappNumber",
                        event.target.value
                      )
                    }
                    placeholder="244923525886"
                    className={inputClass}
                  />

                  <p className="text-xs leading-relaxed text-[#707070]">
                    Utilize o número internacional com o
                    indicativo do país. O sistema remove
                    automaticamente espaços e símbolos ao guardar.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className={labelClass}
                  >
                    Localização
                  </Label>

                  <Input
                    id="location"
                    value={settings.location}
                    onChange={(event) =>
                      handleChange(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="Cidade, País"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="workingHours"
                  className={labelClass}
                >
                  Horário de Funcionamento
                </Label>

                <Input
                  id="workingHours"
                  value={settings.workingHours}
                  onChange={(event) =>
                    handleChange(
                      "workingHours",
                      event.target.value
                    )
                  }
                  placeholder="Seg-Sex: 08:00-21:00"
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="border-b border-[#242424] pb-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#3A321A] bg-[#1B170A]">
              <MapPin className="h-5 w-5 text-[#D4AF37]" />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-lg text-white">
                Informações da Empresa
              </CardTitle>

              <p className={sectionDescriptionClass}>
                Conteúdo institucional apresentado em diferentes
                áreas públicas do site.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label
              htmlFor="companyName"
              className={labelClass}
            >
              Nome da Empresa
            </Label>

            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(event) =>
                handleChange(
                  "companyName",
                  event.target.value
                )
              }
              placeholder="Nome da empresa"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className={labelClass}
            >
              Descrição da Empresa
            </Label>

            <Textarea
              id="description"
              value={settings.description}
              onChange={(event) =>
                handleChange(
                  "description",
                  event.target.value
                )
              }
              placeholder="Breve descrição da empresa e dos serviços"
              rows={6}
              className="min-h-36 resize-y border-[#2A2A2A] bg-[#0A0A0A] text-white placeholder:text-[#666666] focus-visible:border-[#D4AF37] focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading || isLoadingSettings}
          className="h-11 min-w-48 bg-[#D4AF37] px-7 font-semibold text-black hover:bg-[#B8941F]"
        >
          <Save className="mr-2 h-4 w-4" />

          {isLoading
            ? "A guardar..."
            : "Guardar Configurações"}
        </Button>
      </div>

      <Card className={cardClass}>
        <CardHeader className="border-b border-[#242424] pb-5">
          <CardTitle className="text-lg text-white">
            Pré-visualização
          </CardTitle>

          <p className={sectionDescriptionClass}>
            Resumo dos dados actualmente configurados.
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <PreviewRow
                icon={Mail}
                value={settings.email}
              />

              <PreviewRow
                icon={Phone}
                value={settings.phone}
              />

              <PreviewRow
                icon={MessageCircle}
                value={formatWhatsAppNumber(
                  settings.whatsappNumber
                )}
              />

              <PreviewRow
                icon={MapPin}
                value={settings.location}
              />

              <PreviewRow
                icon={Clock}
                value={settings.workingHours}
              />
            </div>

            <div className="rounded-xl border border-[#242424] bg-[#0A0A0A] p-5">
              <h4 className="mb-3 font-semibold text-white">
                {settings.companyName}
              </h4>

              <p className="whitespace-pre-line text-sm leading-6 text-[#8F8F8F]">
                {settings.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface PreviewRowProps {
  icon: typeof Mail
  value: string
}

function PreviewRow({
  icon: Icon,
  value,
}: PreviewRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#3A321A] bg-[#1B170A]">
        <Icon className="h-4 w-4 text-[#D4AF37]" />
      </div>

      <span className="break-all text-sm font-medium text-[#E7E7E7]">
        {value}
      </span>
    </div>
  )
}