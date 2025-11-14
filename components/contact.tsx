"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle, MessageCircle } from "lucide-react"

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
    phone: "",
    subject: "",
    message: "",
  })
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error" | null
    message: string | null
  }>({ type: null, message: null })
  const [contactInfo, setContactInfo] = useState<ContactSettings>({
    email: "geral@theboxacademy.com",
    phone: "+244 923 525 886",
    location: "Luanda e Lisboa",
    workingHours: "Seg-Sex: 08:00-21:00",
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
            email: data.email || "geral@theboxacademy.com",
            phone: data.phone || "+244 923 525 886",
            location: data.location || "Luanda e Lisboa",
            workingHours: data.workingHours || "Seg-Sex: 08:00-21:00",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Número do WhatsApp da THE BOX
    const whatsappNumber = "244923525886"
    
    // Formatar mensagem
    const message = `*Mensagem da THE BOX Website*

*Nome:* ${formData.name}
*Email:* ${formData.email}
${formData.phone ? `*Telefone:* ${formData.phone}` : ''}
*Assunto:* ${formData.subject}

*Mensagem:*
${formData.message}`

    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message)
    
    // Criar link do WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, '_blank')
    
    // Mostrar mensagem de sucesso
      setFormStatus({
        type: "success",
      message: "Redirecionando para o WhatsApp... A mensagem será enviada diretamente!",
      })
    
    // Limpar formulário
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    
    // Limpar mensagem de sucesso após 3 segundos
    setTimeout(() => {
      setFormStatus({ type: null, message: null })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Construir array de informações de contato a partir das settings carregadas
  const whatsappNumber = "244923525886"
  const whatsappUrl = `https://wa.me/${whatsappNumber}`

  const contactInfoArray = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      content: "+244 923 525 886",
      link: whatsappUrl,
      isLink: true,
    },
    {
      icon: Mail,
      title: "Email",
      content: contactInfo.email,
      link: `mailto:${contactInfo.email}`,
      isLink: true,
    },
    {
      icon: Phone,
      title: "Telefone",
      content: contactInfo.phone,
      link: `tel:${contactInfo.phone.replace(/\s/g, '')}`,
      isLink: true,
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
    <section id="contact" className="py-12 bg-black sm:py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4 text-white">
              Entre em <span className="text-[#D4AF37]">Contacto</span>
            </h2>
            <p className="text-[#B3B3B3] max-w-2xl mx-auto">
              Tem alguma dúvida ou quer saber mais sobre a THE BOX? Entre em contacto connosco!
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-lg bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">Enviar Mensagem</CardTitle>
                </CardHeader>
                <CardContent>
                  {formStatus.type && (
                    <div
                      className={`mb-6 p-4 rounded-lg ${
                        formStatus.type === "success"
                          ? "bg-[#1A1A1A] border border-[#D4AF37]"
                          : "bg-[#1A1A1A] border border-red-500"
                      }`}
                    >
                      <div className="flex items-start">
                        {formStatus.type === "success" ? (
                          <CheckCircle className="h-5 w-5 text-[#D4AF37] mt-0.5 mr-2 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        )}
                        <p className={`text-sm ${formStatus.type === "success" ? "text-[#D4AF37]" : "text-red-500"}`}>
                          {formStatus.message}
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Seu nome"
                          className="bg-[#1A1A1A] border-[#1A1A1A] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="seu@email.com"
                          className="bg-[#1A1A1A] border-[#1A1A1A] text-white"
                        />
                      </div>
                    </div>

                      <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Telefone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+244 XXX XXX XXX"
                        className="bg-[#1A1A1A] border-[#1A1A1A] text-white"
                        />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-white">Assunto *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Assunto da mensagem"
                        className="bg-[#1A1A1A] border-[#1A1A1A] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white">Mensagem *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Conte-nos mais sobre as suas necessidades..."
                        className="bg-[#1A1A1A] border-[#1A1A1A] text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para WhatsApp
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 sm:space-y-6">
              {isLoadingSettings ? (
                <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-[#B3B3B3]">Carregando informações de contato...</div>
              ) : (
                contactInfoArray.map((info, index) => (
                  <Card key={index} className={`bg-[#0A0A0A] border-[#1A1A1A] ${info.isLink ? 'hover:border-[#D4AF37] cursor-pointer transition-all' : ''}`}>
                  <CardContent className="p-6">
                      {info.isLink ? (
                        <a 
                          href={info.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                              <info.icon className="h-6 w-6 text-black" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{info.title}</h3>
                              <p className="text-[#D4AF37] hover:underline">{info.content}</p>
                            </div>
                          </div>
                        </a>
                      ) : (
                    <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                            <info.icon className="h-6 w-6 text-black" />
                      </div>
                      <div>
                            <h3 className="font-semibold text-white">{info.title}</h3>
                            <p className="text-[#B3B3B3]">{info.content}</p>
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
