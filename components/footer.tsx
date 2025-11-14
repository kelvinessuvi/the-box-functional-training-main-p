"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

interface FooterSettings {
  email: string
  phone: string
  location: string
  companyName?: string
  description?: string
}

export function Footer() {
  const pathname = usePathname()
  
  // Ocultar footer nas páginas administrativas
  if (pathname && pathname.startsWith("/admin")) {
    return null
  }
  const [settings, setSettings] = useState<FooterSettings>({
    email: "geral@theboxacademy.com",
    phone: "+244 923 525 886",
    location: "Luanda e Lisboa",
    companyName: "THE BOX Functional Training",
    description: "Aqui o Sistema é Bruto. Academia de Artes Marciais com foco em Jiu-Jitsu, oferecendo treinos de alta qualidade e desenvolvimento pessoal em Angola e Portugal.",
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
            email: data.email || "geral@theboxacademy.com",
            phone: data.phone || "+244 923 525 886",
            location: data.location || "Luanda e Lisboa",
            companyName: data.companyName || "THE BOX Functional Training",
            description: data.description || "Aqui o Sistema é Bruto. Academia de Artes Marciais com foco em Jiu-Jitsu, oferecendo treinos de alta qualidade e desenvolvimento pessoal em Angola e Portugal.",
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
    <footer className="bg-black text-white border-t border-[#1A1A1A]">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/images/the-box-logo.svg"
              alt="THE BOX Functional Training"
              width={150}
              height={50}
              className="h-12 w-auto"
            />
            <p className="text-[#B3B3B3] text-sm">
              {settings.description || "Aqui o Sistema é Bruto. Academia de Artes Marciais com foco em Jiu-Jitsu, oferecendo treinos de alta qualidade e desenvolvimento pessoal em Angola e Portugal."}
            </p>
            <p className="text-[#D4AF37] text-sm font-semibold uppercase">"Aqui o Sistema é Bruto"</p>

            <div>
              <h4 className="font-semibold text-white mb-3">Siga-nos</h4>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center hover:bg-[#D4AF37] transition-all duration-300"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center hover:bg-[#D4AF37] transition-all duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center hover:bg-[#D4AF37] transition-all duration-300"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#home" className="text-[#B3B3B3] hover:text-[#D4AF37] transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-[#B3B3B3] hover:text-[#D4AF37] transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="#modalities" className="text-[#B3B3B3] hover:text-[#D4AF37] transition-colors">
                  Modalidades
                </Link>
              </li>
              <li>
                <Link href="#instructors" className="text-[#B3B3B3] hover:text-[#D4AF37] transition-colors">
                  Instrutores
                </Link>
              </li>
              <li>
                <Link href="#branches" className="text-[#B3B3B3] hover:text-[#D4AF37] transition-colors">
                  Filiais
                </Link>
              </li>
              <li>
                <Link href="#gallery" className="text-[#B3B3B3] hover:text-[#D4AF37] transition-colors">
                  Galeria
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-[#B3B3B3] hover:text-[#D4AF37] transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Sobre a THE BOX</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-[#B3B3B3]">Fundada em 2021</span>
              </li>
              <li>
                <span className="text-[#B3B3B3]">Associada à GF Team Angola</span>
              </li>
              <li>
                <span className="text-[#B3B3B3]">4 Filiais em Angola e Portugal</span>
              </li>
              <li>
                <span className="text-[#B3B3B3]">Jiu-Jitsu para todos</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-[#B3B3B3] text-sm">{settings.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-[#B3B3B3] text-sm">{settings.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-[#B3B3B3] text-sm">{settings.location}</span>
              </div>
            </div>

            <Button asChild className="mt-4 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold rounded-full">
              <Link href="#contact">Contactar</Link>
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#1A1A1A] mt-8 pt-8">
          <div className="grid md:grid-cols-3 gap-4 items-center text-sm">
            <div>
              <h4 className="font-semibold text-white mb-1">Fundador</h4>
              <p className="text-[#B3B3B3]">Mário Stefan Pitagrós de Melo Araújo</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Associação</h4>
              <p className="text-[#B3B3B3]">GF Team Angola</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Expansão</h4>
              <p className="text-[#B3B3B3]">Angola e Portugal</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-6 pt-6 border-t border-[#1A1A1A]">
            <p className="text-[#B3B3B3] text-sm">
              © 2025 THE BOX Functional Training. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <p className="text-[#B3B3B3] text-sm"> Feito por Veto de Araújo </p>
              <Button variant="ghost" size="sm" asChild className="text-[#B3B3B3] hover:text-[#D4AF37]">
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
