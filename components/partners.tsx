"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslation } from "@/contexts/language-context"

type Partner = {
  id: string
  name: string
  logo_url?: string
  website_url?: string
  active?: boolean
}

export function Partners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/partners")
        const data = await res.json()
        setPartners(Array.isArray(data) ? data.filter((p: Partner) => p.active && p.logo_url) : [])
      } catch {
        setPartners([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Não renderiza se não houver parceiros
  if (isLoading || partners.length === 0) {
    return null
  }

  return (
    <section className="bg-black border-t border-b border-[#1A1A1A] py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-center text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-6">
          {t.partners.title}
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website_url || "#"}
              target={partner.website_url ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="group flex items-center justify-center bg-white rounded-lg p-3 sm:p-4 border border-transparent hover:border-[#D4AF37] transition-all duration-300 hover:scale-105"
              title={partner.name}
            >
              {partner.logo_url && (
                <Image
                  src={partner.logo_url}
                  alt={partner.name}
                  width={120}
                  height={40}
                  className="h-7 sm:h-8 md:h-10 w-auto object-contain transition-all duration-300"
                />
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Partners
