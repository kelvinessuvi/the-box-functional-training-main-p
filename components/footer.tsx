"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FooterSettings {
  email: string
  phone: string
  location: string
  companyName?: string
  description?: string
}

export function Footer() {
  const [settings, setSettings] = useState<FooterSettings>({
    email: "info@fitem14semanas.com",
    phone: "+244 XXX XXX XXX",
    location: "Luanda, Angola",
    companyName: "Super Beast - Fit Em 14 Semanas",
    description: "Transformando equipas através de fitness, entretenimento e desenvolvimento pessoal. A experiência corporativa mais inovadora de Angola.",
  })

  // Carregar configurações da API
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
          setSettings({
            email: data.email || "info@fitem14semanas.com",
            phone: data.phone || "+244 XXX XXX XXX",
            location: data.location || "Luanda, Angola",
            companyName: data.companyName || "Super Beast - Fit Em 14 Semanas",
            description: data.description || "Transformando equipas através de fitness, entretenimento e desenvolvimento pessoal. A experiência corporativa mais inovadora de Angola.",
          })
        }
      } catch (error) {
        console.error("[FOOTER] Erro ao carregar configurações:", error)
      }
    }

    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/images/logo.png"
              alt="Super Beast Team Building"
              width={150}
              height={50}
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="text-gray-300 text-sm">
              {settings.description || "Transformando equipas através de fitness, entretenimento e desenvolvimento pessoal. A experiência corporativa mais inovadora de Angola."}
            </p>
            <p className="text-gray-400 text-sm italic">"Desperta o teu Monstro Interior"</p>

            <div>
              <h4 className="font-semibold text-white mb-3">Siga-nos</h4>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:gradient-wine-red transition-all duration-300"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:gradient-wine-red transition-all duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:gradient-wine-red transition-all duration-300"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#home" className="text-gray-300 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="#programs" className="text-gray-300 hover:text-white transition-colors">
                  Programas
                </Link>
              </li>
              <li>
                <Link href="#gallery" className="text-gray-300 hover:text-white transition-colors">
                  Galeria
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Nossos Serviços</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300">Pacote Essencial</span>
              </li>
              <li>
                <span className="text-gray-300">Pacote Profissional</span>
              </li>
              <li>
                <span className="text-gray-300">Pacote Premium</span>
              </li>
              <li>
                <span className="text-gray-300">Eventos Personalizados</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-[#bb1e39]" />
                <span className="text-gray-300 text-sm">{settings.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-[#bb1e39]" />
                <span className="text-gray-300 text-sm">{settings.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-[#bb1e39]" />
                <span className="text-gray-300 text-sm">{settings.location}</span>
              </div>
            </div>

            <Button asChild className="mt-4 gradient-wine-red hover:gradient-wine-red-hover text-white rounded-full">
              <Link href="#contact">Solicitar Orçamento</Link>
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid md:grid-cols-3 gap-4 items-center text-sm">
            <div>
              <h4 className="font-semibold text-white mb-1">Fundadores</h4>
              <p className="text-gray-400">Ricardo Buta & Mauro Sérgio</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Experiência</h4>
              <p className="text-gray-400">10+ anos transformando equipas</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Resultados</h4>
              <p className="text-gray-400">95% satisfação • 100+ clientes</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              © 2025 Super Beast - Fit Em 14 Semanas. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">Feito com ❤️ em Angola</p>
              <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white">
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
