"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"

interface ContactSettings {
  email: string
  phone: string
  location: string
  workingHours: string
  companyName?: string
  description?: string
}

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    participants: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error" | null
    message: string | null
  }>({ type: null, message: null })
  const [contactInfo, setContactInfo] = useState<ContactSettings>({
    email: "info@fitem14semanas.com",
    phone: "+244 XXX XXX XXX",
    location: "Luanda, Angola",
    workingHours: "Seg-Sex: 08:00-18:00",
  })
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  // Carregar configurações de contato da API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings", {
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        })
        if (response.ok) {
          const data = await response.json()
          setContactInfo({
            email: data.email || "info@fitem14semanas.com",
            phone: data.phone || "+244 XXX XXX XXX",
            location: data.location || "Luanda, Angola",
            workingHours: data.workingHours || "Seg-Sex: 08:00-18:00",
            companyName: data.companyName,
            description: data.description,
          })
          console.log("[CONTACT] Configurações carregadas:", data)
        }
      } catch (error) {
        console.error("[CONTACT] Erro ao carregar configurações:", error)
        // Usar valores padrão em caso de erro
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormStatus({ type: null, message: null })

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar mensagem")
      }

      setFormStatus({
        type: "success",
        message: "Mensagem enviada com sucesso! Entraremos em contacto em breve.",
      })
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        participants: "",
        subject: "",
        message: "",
      })
    } catch (error: any) {
      setFormStatus({
        type: "error",
        message: error.message || "Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Construir array de informações de contato a partir das settings carregadas
  const contactInfoArray = [
    {
      icon: Mail,
      title: "Email",
      content: contactInfo.email,
    },
    {
      icon: Phone,
      title: "Telefone",
      content: contactInfo.phone,
    },
    {
      icon: MapPin,
      title: "Localização",
      content: contactInfo.location,
    },
    {
      icon: Clock,
      title: "Horário",
      content: contactInfo.workingHours,
    },
  ]

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Solicitar Orçamento</CardTitle>
                </CardHeader>
                <CardContent>
                  {formStatus.type && (
                    <div
                      className={`mb-6 p-4 rounded-lg ${
                        formStatus.type === "success"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-start">
                        {formStatus.type === "success" ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        )}
                        <p className={`text-sm ${formStatus.type === "success" ? "text-green-700" : "text-red-700"}`}>
                          {formStatus.message}
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Seu nome"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Nome da empresa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+244 XXX XXX XXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="participants">Número de Participantes</Label>
                      <Select
                        value={formData.participants}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, participants: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10-20">10-20 pessoas</SelectItem>
                          <SelectItem value="20-30">20-30 pessoas</SelectItem>
                          <SelectItem value="30-50">30-50 pessoas</SelectItem>
                          <SelectItem value="50+">50+ pessoas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Assunto da mensagem"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Conte-nos mais sobre as suas necessidades..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-wine-red hover:gradient-wine-red-hover text-white"
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {isLoadingSettings ? (
                <div className="text-center py-8 text-gray-500">Carregando informações de contato...</div>
              ) : (
                contactInfoArray.map((info, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 gradient-wine-red rounded-lg flex items-center justify-center">
                        <info.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{info.title}</h3>
                        <p className="text-gray-600">{info.content}</p>
                      </div>
                    </div>
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
