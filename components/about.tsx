"use client"

import { useState, useEffect } from "react"
import { 
  MapPin, 
  Globe,
  Shield, 
  Flame,
  Target,
  Swords,
  Mountain,
  HandHeart,
  Handshake,
  Users,
  Scale,
  TrendingUp,
  Quote,
  Rocket
} from "lucide-react"
import Image from "next/image"
import { useTranslation } from "@/contexts/language-context"

type Founder = {
  id: string
  name: string
  full_name?: string
  role: string
  photo_url?: string | null
}

export default function About() {
  const { t, language } = useTranslation()
  const [founders, setFounders] = useState<Founder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar fundadores da API
  useEffect(() => {
    const loadFounders = async () => {
      try {
        const response = await fetch("/api/founders")
        const data = await response.json()
        setFounders(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Erro ao carregar fundadores:", error)
        // Dados padrão em caso de erro
        setFounders([
          { id: "1", name: "Mário Stefan", full_name: "Mário Stefan Pitagrós de Melo Araújo", role: "Co-Fundador", photo_url: null },
          { id: "2", name: "Wilson Inocêncio", full_name: "Wilson Inocêncio", role: "Co-Fundador", photo_url: null }
        ])
      } finally {
        setIsLoading(false)
      }
    }
    loadFounders()
  }, [])

  const values = [
    { icon: Shield, title: t.about.values.discipline },
    { icon: HandHeart, title: t.about.values.respect },
    { icon: Flame, title: t.about.values.intensity },
    { icon: Target, title: t.about.values.technique },
    { icon: Swords, title: t.about.values.courage },
    { icon: Mountain, title: t.about.values.humility },
    { icon: Handshake, title: t.about.values.commitment },
    { icon: Users, title: t.about.values.inclusion },
    { icon: Scale, title: t.about.values.ethics },
    { icon: TrendingUp, title: t.about.values.overcoming }
  ]

  const stats = [
    { icon: Users, value: "+100", label: language === "pt" ? "Atletas" : "Athletes" },
    { icon: MapPin, value: "4", label: t.about.stats.branches },
    { icon: Globe, value: "2", label: t.about.stats.countries }
  ]

  const coFounder = language === "pt" ? "Co-Fundador" : "Co-Founder"

  return (
    <section id="about" className="bg-black text-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        
        {/* Header com título e slogan */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-5">
            {language === "pt" ? (
              <>Quem <span className="text-[#D4AF37]">Somos</span></>
            ) : (
              <><span className="text-[#D4AF37]">About</span> Us</>
            )}
        </h2>
          
          {/* Slogan em destaque */}
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-[#D4AF37]/20 blur-xl"></div>
            <div className="relative bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black px-5 py-2.5 sm:px-7 sm:py-3 rounded-full">
              <span className="text-base sm:text-lg md:text-xl font-black tracking-wider">
                {t.about.philosophyHighlight}
              </span>
            </div>
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid lg:grid-cols-5 gap-6 mb-10">
          
          {/* Coluna esquerda - Texto (3 colunas) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 w-6 h-6 text-[#D4AF37]/30" />
              <div className="bg-gradient-to-br from-[#111] to-[#0A0A0A] border-l-4 border-[#D4AF37] rounded-r-xl p-5 sm:p-6">
                {language === "pt" ? (
                  <>
                    <p className="text-[#B3B3B3] text-sm sm:text-base leading-relaxed mb-3">
                      A <strong className="text-white">THE BOX</strong>, fundada em <strong className="text-[#D4AF37]">2021</strong> e 
                      associada à <strong className="text-white">GF Team Angola</strong>, nasceu com a missão de elevar o nível do treino 
                      e a profissionalização dos atletas em Angola e Portugal.
                    </p>
                    <p className="text-[#B3B3B3] text-sm sm:text-base leading-relaxed">
                      Aqui cultivamos disciplina, técnica e respeito, formando não apenas competidores, mas indivíduos mais fortes, 
                      confiantes e preparados para qualquer desafio.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[#B3B3B3] text-sm sm:text-base leading-relaxed mb-3">
                      <strong className="text-white">THE BOX</strong>, founded in <strong className="text-[#D4AF37]">2021</strong> and 
                      associated with <strong className="text-white">GF Team Angola</strong>, was born with the mission of elevating 
                      the level of training and professionalization of athletes in Angola and Portugal.
                    </p>
                    <p className="text-[#B3B3B3] text-sm sm:text-base leading-relaxed">
                      Here we cultivate discipline, technique and respect, forming not only competitors, but stronger, 
                      more confident individuals prepared for any challenge.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Stats inline */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div 
                    key={index}
                    className="group relative bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-3 text-center overflow-hidden"
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37] mx-auto mb-1.5" />
                    <div className="text-lg sm:text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-[#888]">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Coluna direita - Fundadores (2 colunas) */}
          <div className="lg:col-span-2">
            <div className="h-full bg-gradient-to-b from-[#0A0A0A] to-[#080808] border border-[#1A1A1A] rounded-xl p-5 sm:p-6">
              <h3 className="text-xs font-semibold text-[#888] uppercase tracking-widest mb-5 text-center">
                {t.about.founders}
              </h3>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                </div>
              ) : (
                <div className="flex justify-center items-start gap-6 sm:gap-8">
                  {founders.map((founder) => (
                    <div key={founder.id} className="text-center group flex-1 max-w-[140px]">
                      {/* Foto com moldura */}
                      <div className="relative mb-3">
                        {/* Ring externo decorativo */}
                        <div className="absolute -inset-1 bg-gradient-to-b from-[#D4AF37] to-[#8B7355] rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
                        
                        {/* Container da foto */}
                        <div className="relative">
                          {/* Borda gradiente */}
                          <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/50 to-transparent rounded-full p-[2px]">
                            <div className="w-full h-full bg-[#0A0A0A] rounded-full"></div>
                          </div>
                          
                          {/* Foto */}
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-all">
                            {founder.photo_url ? (
                              <Image
                                src={founder.photo_url}
                                alt={founder.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#111] to-[#0a0a0a] flex items-center justify-center relative">
                                {/* Iniciais com estilo */}
                                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-[#D4AF37] to-[#B8960C] bg-clip-text text-transparent">
                                  {founder.name.split(' ').map(n => n[0]).join('')}
                                </span>
                                {/* Brilho decorativo */}
                                <div className="absolute top-2 right-3 w-2 h-2 bg-[#D4AF37]/40 rounded-full blur-sm"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Nome e cargo */}
                      <h4 className="text-sm sm:text-base font-bold text-white mb-0.5">{founder.name}</h4>
                      <p className="text-[#D4AF37] text-[10px] sm:text-xs font-medium tracking-wide">
                        {language === "pt" ? founder.role : (founder.role === "Co-Fundador" ? coFounder : founder.role)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>

        {/* Nossa Missão */}
        <div className="mb-10">
          <div className="relative bg-gradient-to-br from-[#0A0A0A] to-[#080808] border border-[#1A1A1A] rounded-xl p-6 sm:p-8 overflow-hidden">
            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Ícone */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                </div>
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-[#D4AF37] mb-3">
                  {t.about.mission.title}
                </h3>
                <p className="text-[#B3B3B3] text-sm sm:text-base leading-relaxed">
                  {t.about.mission.text}
                </p>
              </div>
            </div>
          </div>
        </div>
          
        {/* Valores - Design compacto */}
        <div className="relative pt-2">
          <h3 className="text-xs font-semibold text-[#888] uppercase tracking-widest mb-4 text-center">
            {t.about.values.title}
          </h3>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div 
                  key={index}
                  className="group flex items-center gap-1.5 bg-[#0A0A0A] border border-[#1A1A1A] rounded-full px-2.5 py-1.5 sm:px-3 sm:py-1.5 cursor-default"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-full flex items-center justify-center">
                    <Icon className="w-3 h-3 text-black" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-[#ccc]">{value.title}</span>
                </div>
              )
            })}
        </div>
      </div>

      </div>
    </section>
  )
}
