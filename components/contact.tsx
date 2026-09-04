"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react"

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
import { useTranslation } from "@/contexts/language-context"

interface ContactSettings {
  email: string
  phone: string
  whatsappNumber: string
  location: string
  workingHours: string
  companyName?: string
  description?: string
}

const defaultContactSettings: ContactSettings = {
  email: "theboxft2021@gmail.com",
  phone: "+244 923 525 886",
  whatsappNumber: "244923525886",
  location: "Luanda e Lisboa",
  workingHours: "Seg-Sex: 08:00-21:00",
  companyName: "THE BOX Functional Training",
}

function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "")
}

function formatWhatsAppNumber(value: string) {
  const digits = normalizeWhatsAppNumber(value)

  if (digits.startsWith("244") && digits.length === 12) {
    return `+244 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`
  }

  if (!digits) {
    return ""
  }

  return `+${digits}`
}

export function Contact() {
  const { t, language } = useTranslation()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error" | null
    message: string | null
  }>({
    type: null,
    message: null,
  })

  const [contactInfo, setContactInfo] =
    useState<ContactSettings>(defaultContactSettings)

  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })

        if (!response.ok) {
          console.error(
            "[CONTACT] Erro ao carregar configurações:",
            response.status,
            response.statusText
          )
          return
        }

        const data = await response.json()

        setContactInfo({
          email: data.email || defaultContactSettings.email,
          phone: data.phone || defaultContactSettings.phone,
          whatsappNumber:
            normalizeWhatsAppNumber(data.whatsappNumber || "") ||
            defaultContactSettings.whatsappNumber,
          location: data.location || defaultContactSettings.location,
          workingHours:
            data.workingHours || defaultContactSettings.workingHours,
          companyName:
            data.companyName || defaultContactSettings.companyName,
          description: data.description,
        })

        console.log("[CONTACT] Configurações carregadas com sucesso")
      } catch (error) {
        console.error(
          "[CONTACT] Erro ao carregar configurações:",
          error
        )
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadSettings()
  }, [])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const whatsappNumber =
      normalizeWhatsAppNumber(contactInfo.whatsappNumber) ||
      defaultContactSettings.whatsappNumber

    if (!whatsappNumber) {
      setFormStatus({
        type: "error",
        message:
          language === "pt"
            ? "Não foi possível abrir o WhatsApp. Tente novamente mais tarde."
            : "Could not open WhatsApp. Please try again later.",
      })

      return
    }

    const message = `*${
      language === "pt"
        ? "Mensagem da THE BOX Website"
        : "Message from THE BOX Website"
    }*

*${t.contact.form.name}:* ${formData.name}
*Email:* ${formData.email}
${
  formData.phone
    ? `*${t.contact.form.phone}:* ${formData.phone}`
    : ""
}
*${t.contact.form.subject}:* ${formData.subject}

*${t.contact.form.message}:*
${formData.message}`

    const encodedMessage = encodeURIComponent(message)

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")

    setFormStatus({
      type: "success",
      message:
        language === "pt"
          ? "A abrir o WhatsApp para enviar a mensagem."
          : "Opening WhatsApp to send your message.",
    })

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    })

    setTimeout(() => {
      setFormStatus({
        type: null,
        message: null,
      })
    }, 3000)
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
  }

  const whatsappNumber =
    normalizeWhatsAppNumber(contactInfo.whatsappNumber) ||
    defaultContactSettings.whatsappNumber

  const whatsappUrl = `https://wa.me/${whatsappNumber}`

  const contactInfoArray = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      content: formatWhatsAppNumber(whatsappNumber),
      link: whatsappUrl,
      isLink: true,
      external: true,
    },
    {
      icon: Mail,
      title: "Email",
      content: contactInfo.email,
      link: `mailto:${contactInfo.email}`,
      isLink: true,
      external: false,
    },
    {
      icon: Phone,
      title: t.contact.info.phone,
      content: contactInfo.phone,
      link: `tel:${contactInfo.phone.replace(/\s/g, "")}`,
      isLink: true,
      external: false,
    },
    {
      icon: MapPin,
      title: t.contact.info.address,
      content: contactInfo.location,
      isLink: false,
      external: false,
    },
    {
      icon: Clock,
      title: t.contact.info.hours,
      content: contactInfo.workingHours,
      isLink: false,
      external: false,
    },
  ]

  return (
    <section
      id="contact"
      className="bg-black py-12 sm:py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              {language === "pt" ? (
                <>
                  Entre em{" "}
                  <span className="text-[#D4AF37]">
                    Contacto
                  </span>
                </>
              ) : (
                <>
                  Get in{" "}
                  <span className="text-[#D4AF37]">
                    Touch
                  </span>
                </>
              )}
            </h2>

            <p className="mx-auto max-w-2xl text-[#B3B3B3]">
              {t.contact.subtitle}
            </p>
          </div>

          <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <Card className="border-[#1A1A1A] bg-[#0A0A0A] shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">
                    {language === "pt"
                      ? "Enviar Mensagem"
                      : "Send Message"}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {formStatus.type && (
                    <div
                      className={`mb-6 rounded-lg border bg-[#1A1A1A] p-4 ${
                        formStatus.type === "success"
                          ? "border-[#D4AF37]"
                          : "border-red-500"
                      }`}
                    >
                      <div className="flex items-start">
                        {formStatus.type === "success" ? (
                          <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-[#D4AF37]" />
                        ) : (
                          <AlertCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                        )}

                        <p
                          className={`text-sm ${
                            formStatus.type === "success"
                              ? "text-[#D4AF37]"
                              : "text-red-500"
                          }`}
                        >
                          {formStatus.message}
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-white"
                        >
                          {t.contact.form.name} *
                        </Label>

                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder={
                            t.contact.form.namePlaceholder
                          }
                          className="border-[#1A1A1A] bg-[#1A1A1A] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-white"
                        >
                          Email *
                        </Label>

                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder={
                            t.contact.form.emailPlaceholder
                          }
                          className="border-[#1A1A1A] bg-[#1A1A1A] text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-white"
                      >
                        {t.contact.form.phone}
                      </Label>

                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={
                          t.contact.form.phonePlaceholder
                        }
                        className="border-[#1A1A1A] bg-[#1A1A1A] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="subject"
                        className="text-white"
                      >
                        {t.contact.form.subject} *
                      </Label>

                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder={
                          language === "pt"
                            ? "Assunto da mensagem"
                            : "Message subject"
                        }
                        className="border-[#1A1A1A] bg-[#1A1A1A] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="message"
                        className="text-white"
                      >
                        {t.contact.form.message} *
                      </Label>

                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder={
                          t.contact.form.messagePlaceholder
                        }
                        className="border-[#1A1A1A] bg-[#1A1A1A] text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#D4AF37] font-semibold text-black hover:bg-[#B8941F]"
                    >
                      <Send className="mr-2 h-4 w-4" />

                      {language === "pt"
                        ? "Enviar para WhatsApp"
                        : "Send to WhatsApp"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {isLoadingSettings ? (
                <div className="py-6 text-center text-sm text-[#B3B3B3] sm:py-8 sm:text-base">
                  {t.common.loading}
                </div>
              ) : (
                contactInfoArray.map((info, index) => (
                  <Card
                    key={index}
                    className={`border-[#1A1A1A] bg-[#0A0A0A] ${
                      info.isLink
                        ? "cursor-pointer transition-all hover:border-[#D4AF37]"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      {info.isLink && info.link ? (
                        <a
                          href={info.link}
                          target={
                            info.external
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            info.external
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="block"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4AF37]">
                              <info.icon className="h-6 w-6 text-black" />
                            </div>

                            <div>
                              <h3 className="font-semibold text-white">
                                {info.title}
                              </h3>

                              <p className="text-[#D4AF37] hover:underline">
                                {info.content}
                              </p>
                            </div>
                          </div>
                        </a>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4AF37]">
                            <info.icon className="h-6 w-6 text-black" />
                          </div>

                          <div>
                            <h3 className="font-semibold text-white">
                              {info.title}
                            </h3>

                            <p className="text-[#B3B3B3]">
                              {info.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact