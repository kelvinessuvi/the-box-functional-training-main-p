"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Shield, Target, Activity } from "lucide-react"

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
          <p className="text-center text-[#B3B3B3]">Carregando modalidades...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="modalities" className="py-16 sm:py-20 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4 text-white">
            Nossas <span className="text-[#D4AF37]">Modalidades</span>
          </h2>
          <p className="text-[#B3B3B3] max-w-3xl mx-auto text-lg">
            Descubra as modalidades oferecidas pela THE BOX. Cada uma desenvolvida para transformar vidas através do treino e disciplina.
          </p>
        </div>

        {modalities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#B3B3B3]">Nenhuma modalidade disponível no momento.</p>
            <p className="text-[#B3B3B3] text-sm mt-2">As modalidades serão adicionadas em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {modalities.map((modality) => {
              const Icon = getIcon(modality.name)
              return (
                <Card key={modality.id} className="bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#D4AF37] transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-[#D4AF37] rounded-lg flex items-center justify-center mr-4">
                        <Icon className="w-8 h-8 text-black" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{modality.name}</h3>
                    </div>
                    <p className="text-[#B3B3B3] leading-relaxed">{modality.description}</p>
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

