import { CheckCircle } from "lucide-react"

export function WhyParticipate() {
  const benefits = [
    "Melhora significativa na comunicação entre membros da equipe",
    "Desenvolvimento de habilidades de liderança em todos os níveis",
    "Aumento da confiança e colaboração no ambiente de trabalho",
    "Resolução mais eficaz de conflitos e desafios",
    "Maior engajamento e motivação dos colaboradores",
    "Fortalecimento da cultura organizacional",
    "Melhoria nos resultados e produtividade da equipe",
    "Criação de vínculos duradouros entre os participantes",
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Por que Participar?</h2>
            <p className="text-lg text-gray-600">
              Descubra os benefícios transformadores que o Super Beast Team Building pode trazer para sua equipe e
              organização.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
