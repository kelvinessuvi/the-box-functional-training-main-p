"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useTranslation } from "@/contexts/language-context"

interface FooterSettings {
  email: string
  phone: string
  location: string
  companyName?: string
  description?: string
}

export function Footer() {
  const pathname = usePathname()
  const { t, language } = useTranslation()

  const [settings, setSettings] = useState<FooterSettings>({
    email: "geral@theboxacademy.com",
    phone: "+244 923 525 886",
    location: "Luanda e Lisboa",
    companyName: "THE BOX Functional Training",
    description:
      language === "pt"
        ? "Aqui o Sistema é Bruto. Academia de Artes Marciais com foco em Jiu-Jitsu, oferecendo treinos de alta qualidade e desenvolvimento pessoal em Angola e Portugal."
        : "The System is Brutal. Martial Arts academy focused on Jiu-Jitsu, offering high-quality training and personal development in Angola and Portugal.",
  })

  // Carregar configurações da API
  useEffect(() => {
    // Nas páginas administrativas o Footer não é apresentado,
    // por isso também evitamos carregar configurações desnecessariamente.
    if (pathname && pathname.startsWith("/admin")) {
      return
    }

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })

        if (response.ok) {
          const data = await response.json()

          setSettings({
            email: data.email || "geral@theboxacademy.com",
            phone: data.phone || "+244 923 525 886",
            location: data.location || "Luanda e Lisboa",
            companyName: data.companyName || "THE BOX Functional Training",
            description:
              data.description ||
              (language === "pt"
                ? "Aqui o Sistema é Bruto. Academia de Artes Marciais com foco em Jiu-Jitsu, oferecendo treinos de alta qualidade e desenvolvimento pessoal em Angola e Portugal."
                : "The System is Brutal. Martial Arts academy focused on Jiu-Jitsu, offering high-quality training and personal development in Angola and Portugal."),
          })
        }
      } catch (error) {
        console.error("[FOOTER] Erro ao carregar configurações:", error)
      }
    }

    loadSettings()
  }, [language, pathname])

  // Ocultar Footer nas páginas administrativas
  if (pathname && pathname.startsWith("/admin")) {
    return null
  }

  return (
    <footer className="border-t border-[#1A1A1A] bg-black text-white">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/images/the-box-logo.svg"
              alt="THE BOX Functional Training"
              width={150}
              height={50}
              className="h-12 w-auto"
            />

            <p className="text-sm text-[#B3B3B3]">
              {settings.description}
            </p>

            <p className="text-sm font-semibold uppercase text-[#D4AF37]">
              {language === "pt"
                ? '"Aqui o Sistema é Bruto"'
                : '"The System is Brutal"'}
            </p>

            <div>
              <h4 className="mb-3 font-semibold text-white">
                {t.footer.followUs}
              </h4>

              <div className="flex space-x-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A] transition-all duration-300 hover:bg-[#D4AF37]"
                >
                  <Facebook className="h-5 w-5" />
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A] transition-all duration-300 hover:bg-[#D4AF37]"
                >
                  <Instagram className="h-5 w-5" />
                </a>

                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A] transition-all duration-300 hover:bg-[#D4AF37]"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              {language === "pt" ? "Links Rápidos" : "Quick Links"}
            </h3>

            <ul className="space-y-2">
              <li>
                <Link
                  href="/#home"
                  className="text-[#B3B3B3] transition-colors hover:text-[#D4AF37]"
                >
                  {t.nav.home}
                </Link>
              </li>

              <li>
                <Link
                  href="/#about"
                  className="text-[#B3B3B3] transition-colors hover:text-[#D4AF37]"
                >
                  {t.nav.about}
                </Link>
              </li>

              <li>
                <Link
                  href="/#modalities"
                  className="text-[#B3B3B3] transition-colors hover:text-[#D4AF37]"
                >
                  {t.nav.modalities}
                </Link>
              </li>

              <li>
                <Link
                  href="/#instructors"
                  className="text-[#B3B3B3] transition-colors hover:text-[#D4AF37]"
                >
                  {t.nav.instructors}
                </Link>
              </li>

              <li>
                <Link
                  href="/#branches"
                  className="text-[#B3B3B3] transition-colors hover:text-[#D4AF37]"
                >
                  {t.nav.branches}
                </Link>
              </li>

              <li>
                <Link
                  href="/loja"
                  className="text-[#B3B3B3] transition-colors hover:text-[#D4AF37]"
                >
                  {t.nav.store}
                </Link>
              </li>

              <li>
                <Link
                  href="/#gallery"
                  className="text-[#B3B3B3] transition-colors hover:text-[#D4AF37]"
                >
                  {t.nav.gallery}
                </Link>
              </li>

              <li>
                <Link
                  href="/#contact"
                  className="text-[#B3B3B3] transition-colors hover:text-[#D4AF37]"
                >
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              {language === "pt" ? "Sobre a THE BOX" : "About THE BOX"}
            </h3>

            <ul className="space-y-2">
              <li>
                <span className="text-[#B3B3B3]">
                  {language === "pt" ? "Fundada em 2021" : "Founded in 2021"}
                </span>
              </li>

              <li>
                <span className="text-[#B3B3B3]">
                  {language === "pt"
                    ? "5 Filiais em Angola e Portugal"
                    : "5 Locations in Angola and Portugal"}
                </span>
              </li>

              <li>
                <span className="text-[#B3B3B3]">
                  {language === "pt"
                    ? "Jiu-Jitsu para todos"
                    : "Jiu-Jitsu for everyone"}
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              {t.nav.contact}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-sm text-[#B3B3B3]">
                  {settings.email}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-sm text-[#B3B3B3]">
                  {settings.phone}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-[#D4AF37]" />
                <span className="text-sm text-[#B3B3B3]">
                  {settings.location}
                </span>
              </div>
            </div>

            <Button
              asChild
              className="mt-4 rounded-full bg-[#D4AF37] font-semibold text-black hover:bg-[#B8941F]"
            >
              <Link href="/#contact">
                {t.nav.contactBtn}
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-[#1A1A1A] pt-8">
          <div className="grid items-center gap-4 text-sm md:grid-cols-3">
            <div>
              <h4 className="mb-1 font-semibold text-white">
                {language === "pt" ? "Fundadores" : "Founders"}
              </h4>

              <p className="text-[#B3B3B3]">
                Mário Stefan & Wilson Inocêncio
              </p>
            </div>

            <div>
              <h4 className="mb-1 font-semibold text-white">
                {language === "pt" ? "Expansão" : "Expansion"}
              </h4>

              <p className="text-[#B3B3B3]">
                Angola & Portugal
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between border-t border-[#1A1A1A] pt-6 md:flex-row">
            <p className="text-sm text-[#B3B3B3]">
              © 2025 THE BOX Functional Training. {t.footer.rights}.
            </p>

            <div className="mt-4 flex items-center space-x-4 md:mt-0">
              <p className="text-sm text-[#B3B3B3]">
                {language === "pt" ? "Feito por" : "Made by"} Veto de Araújo
              </p>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-[#B3B3B3] hover:text-[#D4AF37]"
              >
                <Link href="/admin">
                  Admin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}