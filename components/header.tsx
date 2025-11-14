"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAdmin, isLoading } = useAuth()
  const pathname = usePathname()

  const navigation = [
    { name: "Início", href: "#home" },
    { name: "Sobre Nós", href: "#about" },
    { name: "Modalidades", href: "#modalities" },
    { name: "Instrutores", href: "#instructors" },
    { name: "Filiais", href: "#branches" },
    { name: "Galeria", href: "#gallery" },
    { name: "Contacto", href: "#contact" },
  ]

  // Após usar todos os hooks, podemos decidir ocultar
  if (pathname && pathname.startsWith("/admin")) {
    return null
  }

  return (
    <header className="fixed top-0 w-full bg-black border-b border-[#1A1A1A] z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 sm:h-24 md:h-28">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/the-box-logo.svg"
              alt="THE BOX Functional Training"
              width={240}
              height={80}
              className="h-16 sm:h-20 md:h-24 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="text-white hover:text-[#D4AF37] transition-colors font-medium">
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!isLoading && isAdmin ? (
              <Button asChild className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold">
                <Link href="/admin/dashboard">Painel Administrativo</Link>
              </Button>
            ) : (
              <Button asChild className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold">
                <Link href="#contact">Contactar</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:text-[#D4AF37]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1A1A1A] bg-black">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-[#D4AF37] transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                {!isLoading && isAdmin ? (
                  <Button asChild className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/admin/dashboard">Painel Administrativo</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold">
                    <Link href="#contact">Contactar</Link>
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
