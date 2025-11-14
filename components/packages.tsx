"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Plan = {
  id: string
  name: string
  price: string
  description: string
  duration?: string
  participants?: string
  features?: string[]
  active?: boolean
}

export function Packages() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/plans")
        const data = await res.json()
        setPlans(Array.isArray(data) ? data.filter((p: any) => p.active) : [])
      } catch {
        setPlans([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <section id="programs" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <p className="text-center">Carregando planos...</p>
        </div>
      </section>
    )
  }

  if (!plans.length) return null

  return (
    <section id="programs" className="py-12 bg-gray-50 sm:py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 sm:text-3xl sm:mb-4 md:text-4xl">Nossos Programas</h2>
          <p className="text-base text-gray-600 max-w-3xl mx-auto sm:text-lg">
            Escolha o pacote ideal para a tua equipa. Cada programa é cuidadosamente 
            desenhado para maximizar o impacto e criar experiências transformadoras.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={plan.id} className={`relative overflow-hidden transition-transform hover:scale-105 ${
              index === 1 ? 'ring-2 ring-red-500 ring-opacity-50' : ''
            }`}>
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-sm font-bold rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-center mb-2">{plan.name}</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold text-red-600">Sob consulta</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-center mb-6">{plan.description}</p>
                
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-700">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 mb-2">Ideal para:</p>
                  <p className="text-sm text-gray-700">
                    {index === 0 && "Pequenas equipas, startups e empresas que querem começar"}
                    {index === 1 && "Empresas que buscam um impacto completo e transformador"}
                    {index === 2 && "Grandes corporações, equipas de alta performance"}
                  </p>
                </div>
                
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3">
                  Escolher Pacote
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Packages
