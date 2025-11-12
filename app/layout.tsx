import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DatabaseSetupBanner } from "@/components/database-setup-banner"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Super Beast Team Building - Transforme sua Equipe",
  description:
    "Experiências únicas de Team Building que fortalecem laços, desenvolvem liderança e impulsionam resultados. Transforme sua equipe em uma Super Beast.",
  keywords: "team building, liderança, desenvolvimento organizacional, workshops corporativos, coaching de equipe",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className="scroll-smooth">
      <body className={inter.className}>
        <DatabaseSetupBanner />
        <Header />
        <main className="pt-16">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
