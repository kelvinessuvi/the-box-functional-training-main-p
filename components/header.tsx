"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useTranslation } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const { isAdmin, isLoading } = useAuth()
  const pathname = usePathname()
  const { t, language, setLanguage } = useTranslation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const navigation = [
    { name: t.nav.home, href: "/#home" },
    { name: t.nav.about, href: "/#about" },
    { name: t.nav.modalities, href: "/#modalities" },
    { name: t.nav.instructors, href: "/#instructors" },
    { name: t.nav.branches, href: "/#branches" },
    { name: t.nav.store, href: "/loja" },
    { name: t.nav.gallery, href: "/#gallery" },
    { name: t.nav.contact, href: "/#contact" },
  ]

  // Ocultar Header nas páginas administrativas
  if (pathname && pathname.startsWith("/admin")) {
    return null
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-lg"
          : "bg-black/95 border-b border-[#1A1A1A]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center sm:h-18">
          {/* Logo */}
          <Link href="/" className="flex flex-shrink-0 items-center">
            <Image
              src="/images/the-box-logo.svg"
              alt="THE BOX Functional Training"
              width={160}
              height={50}
              className="h-10 w-auto sm:h-12"
              priority
            />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop Navigation */}
          <nav className="mr-4 hidden items-center space-x-5 lg:flex">
            {navigation.map((item) => {
              const isStoreActive =
                item.href === "/loja" && pathname?.startsWith("/loja")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isStoreActive
                      ? "text-[#D4AF37]"
                      : "text-white/90 hover:text-[#D4AF37]"
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Language Selector - Desktop */}
          <div className="mr-4 hidden items-center lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 px-2 text-white/90 hover:bg-transparent hover:text-[#D4AF37]"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">
                    {language}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="min-w-[120px] border-[#1A1A1A] bg-[#0A0A0A]"
              >
                <DropdownMenuItem
                  onClick={() => setLanguage("pt")}
                  className={`cursor-pointer hover:bg-[#1A1A1A] hover:text-[#D4AF37] ${
                    language === "pt" ? "text-[#D4AF37]" : "text-white"
                  }`}
                >
                  <span className="mr-2">🇵🇹</span>
                  Português
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className={`cursor-pointer hover:bg-[#1A1A1A] hover:text-[#D4AF37] ${
                    language === "en" ? "text-[#D4AF37]" : "text-white"
                  }`}
                >
                  <span className="mr-2">🇬🇧</span>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center lg:flex">
            {!isLoading && isAdmin ? (
              <Button
                asChild
                size="sm"
                className="bg-[#D4AF37] px-5 font-semibold text-black hover:bg-[#B8941F]"
              >
                <Link href="/admin/dashboard">{t.nav.adminPanel}</Link>
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-[#D4AF37] px-5 font-semibold text-black hover:bg-[#B8941F]"
              >
                <Link href="/#contact">{t.nav.contactBtn}</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-white hover:bg-transparent hover:text-[#D4AF37] lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={
              isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"
            }
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-[#1A1A1A] py-4 lg:hidden">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => {
                const isStoreActive =
                  item.href === "/loja" && pathname?.startsWith("/loja")

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`py-1 font-medium transition-colors ${
                      isStoreActive
                        ? "text-[#D4AF37]"
                        : "text-white/90 hover:text-[#D4AF37]"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}

              {/* Language Selector - Mobile */}
              <div className="mt-2 flex items-center gap-2 border-t border-[#1A1A1A] pt-4">
                <Globe className="h-4 w-4 text-white/70" />

                <span className="text-sm text-white/70">
                  {language === "pt" ? "Idioma:" : "Language:"}
                </span>

                <button
                  type="button"
                  onClick={() => setLanguage("pt")}
                  className={`rounded px-2 py-1 text-sm ${
                    language === "pt"
                      ? "bg-[#D4AF37] font-semibold text-black"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  🇵🇹 PT
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded px-2 py-1 text-sm ${
                    language === "en"
                      ? "bg-[#D4AF37] font-semibold text-black"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>

              {/* Mobile CTA */}
              <div className="flex flex-col gap-2 pt-3">
                {!isLoading && isAdmin ? (
                  <Button
                    asChild
                    className="w-full bg-[#D4AF37] font-semibold text-black hover:bg-[#B8941F]"
                  >
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.nav.adminPanel}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full bg-[#D4AF37] font-semibold text-black hover:bg-[#B8941F]"
                  >
                    <Link
                      href="/#contact"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.nav.contactBtn}
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}