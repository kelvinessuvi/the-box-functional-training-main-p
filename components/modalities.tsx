"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Shield, Target, Activity } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"

type Modality = {
  id: string
  name: string
  description: string
  image_url?: string
  active?: boolean
}

export function Modalities() {
  const [modalities, setModalities] = useState<Modality[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/modalities")
        const data = await res.json()
        setModalities(Array.isArray(data) ? data.filter((m: any) => m.active) : [])
      } catch {
        setModalities([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Ícones para diferentes modalidades
  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("jiu") || lowerName.includes("jitsu")) return GraduationCap
    if (lowerName.includes("muay") || lowerName.includes("thai")) return Target
    if (lowerName.includes("box") || lowerName.includes("punch")) return Shield
    return Activity
  }

  if (isLoading) {
    return (
      <section id="modalities" className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <p className="text-center text-[#B3B3B3]">{t.common.loading}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="modalities" className="py-16 sm:py-20 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4 text-white">
            {t.modalities.title.split(' ').slice(0, -1).join(' ')} <span className="text-[#D4AF37]">{t.modalities.title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-[#B3B3B3] max-w-3xl mx-auto text-lg">
            {t.modalities.subtitle}
          </p>
        </div>

        {modalities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#B3B3B3]">
              {t.common.loading}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {modalities.map((modality) => {
              const Icon = getIcon(modality.name)
              const isExpanded = expandedId === modality.id
              return (
                <Card key={modality.id} className="bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#D4AF37] transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mr-3">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{modality.name}</h3>
                    </div>
                    <div>
                      <p className={`text-[#B3B3B3] text-xs sm:text-sm leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {modality.description}
                      </p>
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : modality.id)}
                        className="text-[#D4AF37] text-xs font-medium mt-1 hover:underline"
                      >
                        {isExpanded ? `...${t.modalities.readLess}` : `...${t.modalities.readMore}`}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default Modalities
