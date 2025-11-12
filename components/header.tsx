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
    { name: "Programas", href: "#programs" },
    { name: "Galeria", href: "#gallery" },
    { name: "Contacto", href: "#contact" },
  ]

  // Após usar todos os hooks, podemos decidir ocultar
  if (pathname && pathname.startsWith("/admin")) {
    return null
  }

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Super Beast Team Building"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="text-gray-700 hover:text-red-600 transition-colors">
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!isLoading && isAdmin ? (
              <Button asChild className="gradient-wine-red hover:gradient-wine-red-hover text-white">
                <Link href="/admin/dashboard">Painel Administrativo</Link>
              </Button>
            ) : (
              <Button asChild className="gradient-wine-red hover:gradient-wine-red-hover text-white">
                <Link href="#contact">Contactar</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                {!isLoading && isAdmin ? (
                  <Button asChild className="w-full gradient-wine-red hover:bg-red-700 text-white" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/admin/dashboard">Painel Administrativo</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full gradient-wine-red hover:bg-red-700 text-white">
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
