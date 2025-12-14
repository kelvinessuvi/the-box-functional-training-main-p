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
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: t.nav.home, href: "#home" },
    { name: t.nav.about, href: "#about" },
    { name: t.nav.modalities, href: "#modalities" },
    { name: t.nav.instructors, href: "#instructors" },
    { name: t.nav.branches, href: "#branches" },
    { name: t.nav.gallery, href: "#gallery" },
    { name: t.nav.contact, href: "#contact" },
  ]

  // Após usar todos os hooks, podemos decidir ocultar
  if (pathname && pathname.startsWith("/admin")) {
    return null
  }

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-black/80 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-lg" 
          : "bg-black/95 border-b border-[#1A1A1A]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 sm:h-18">
          {/* Logo - alinhado à esquerda */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/the-box-logo.svg"
              alt="THE BOX Functional Training"
              width={160}
              height={50}
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Spacer para empurrar navegação para direita */}
          <div className="flex-1"></div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-5 mr-4">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className="text-sm text-white/90 hover:text-[#D4AF37] transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Language Selector - Desktop */}
          <div className="hidden lg:flex items-center mr-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/90 hover:text-[#D4AF37] hover:bg-transparent gap-1.5 px-2"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-[#0A0A0A] border-[#1A1A1A] min-w-[120px]"
              >
                <DropdownMenuItem 
                  onClick={() => setLanguage("pt")}
                  className={`cursor-pointer ${language === "pt" ? "text-[#D4AF37]" : "text-white"} hover:text-[#D4AF37] hover:bg-[#1A1A1A]`}
                >
                  <span className="mr-2">🇵🇹</span>
                  Português
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("en")}
                  className={`cursor-pointer ${language === "en" ? "text-[#D4AF37]" : "text-white"} hover:text-[#D4AF37] hover:bg-[#1A1A1A]`}
                >
                  <span className="mr-2">🇬🇧</span>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden lg:flex items-center">
            {!isLoading && isAdmin ? (
              <Button asChild size="sm" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-5">
                <Link href="/admin/dashboard">{t.nav.adminPanel}</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold px-5">
                <Link href="#contact">{t.nav.contactBtn}</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-white hover:text-[#D4AF37] hover:bg-transparent ml-auto" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#1A1A1A]">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white/90 hover:text-[#D4AF37] transition-colors font-medium py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Language Selector - Mobile */}
              <div className="flex items-center gap-2 py-2 border-t border-[#1A1A1A] mt-2 pt-4">
                <Globe className="h-4 w-4 text-white/70" />
                <span className="text-white/70 text-sm">Idioma:</span>
                <button
                  onClick={() => setLanguage("pt")}
                  className={`px-2 py-1 text-sm rounded ${language === "pt" ? "bg-[#D4AF37] text-black font-semibold" : "text-white/70 hover:text-white"}`}
                >
                  🇵🇹 PT
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-1 text-sm rounded ${language === "en" ? "bg-[#D4AF37] text-black font-semibold" : "text-white/70 hover:text-white"}`}
                >
                  🇬🇧 EN
                </button>
              </div>

              <div className="pt-3 flex flex-col gap-2">
                {!isLoading && isAdmin ? (
                  <Button asChild className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/admin/dashboard">{t.nav.adminPanel}</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold">
                    <Link href="#contact">{t.nav.contactBtn}</Link>
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
