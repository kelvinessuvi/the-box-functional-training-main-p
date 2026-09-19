import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DatabaseSetupBanner } from "@/components/database-setup-banner"
import { Toaster } from "sonner"
import { LanguageProvider } from "@/contexts/language-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "THE BOX Functional Training: Aqui o Sistema é Bruto",
  description:
    "Academia de Artes Marciais com foco em Jiu-Jitsu. Transformamos vidas através do treino, disciplina e desenvolvimento pessoal em Angola e Portugal.",
  keywords: "jiu-jitsu, artes marciais, the box, functional training, angola, portugal, gf team, treino, disciplina",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/images/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logo.png', type: 'image/png' },
    ],
    shortcut: '/images/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className="scroll-smooth">
      <body className={inter.className}>
        <LanguageProvider>
          <DatabaseSetupBanner />
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster position="top-right" richColors />
        </LanguageProvider>
      </body>
    </html>
  )
}
