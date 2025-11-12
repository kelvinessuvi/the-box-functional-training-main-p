import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Clock, Users, Star } from "lucide-react"

export function Programs() {
  const programs = [
    {
      name: "Essencial",
      subtitle: "Sob consulta",
      duration: "4 horas",
      participants: "15-25 pessoas",
      color: "bg-blue-500",
      features: [
        "Treino funcional em grupo (30 min)",
        "2 desafios de team building",
        "Dinâmicas de integração",
        "Lanche saudável",
        "Certificado de participação",
      ],
      ideal: "Equipas pequenas e primeiro contacto com o Super Beast",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Profissional",
      subtitle: "Sob consulta",
      duration: "6 horas",
      participants: "25-50 pessoas",
      color: "gradient-wine-red",
      popular: true,
      features: [
        "Treino funcional completo (45 min)",
        "4 desafios de team building",
        "Corrida com obstáculos",
        "Dinâmicas avançadas de autoconhecimento",
        "Confraternização com churrasco",
        "Prémios e reconhecimentos",
        "Vídeo do evento",
      ],
      ideal: "Empresas que querem a experiência completa Super Beast",
      buttonColor: "gradient-wine-red hover:gradient-wine-red-hover text-white",
    },
    {
      name: "Premium",
      subtitle: "Sob consulta",
      duration: "8 horas",
      participants: "50+ pessoas",
      color: "bg-purple-600",
      features: [
        "Programa completo personalizado",
        "Coaching individual para líderes",
        "Actividades customizadas",
        "Troféus personalizados",
        "Vídeo promocional profissional",
        "Catering completo",
        "Acompanhamento pós-evento (30 dias)",
        "Relatório de resultados",
      ],
      ideal: "Grandes empresas e eventos corporativos especiais",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  ]

  return (
    <section id="programs" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Nossos{" "}
            <span className="bg-gradient-to-r from-[#341c20] to-[#bb1e39] bg-clip-text text-transparent">
              Programas
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Escolha o pacote ideal para transformar a sua equipa. Cada programa é cuidadosamente estruturado para
            maximizar resultados e criar experiências inesquecíveis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {programs.map((program, index) => (
            <Card key={index} className={`relative ${program.popular ? "border-red-500 shadow-lg scale-105" : ""}`}>
              {program.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="gradient-wine-red text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    POPULAR
                  </div>
                </div>
              )}

              <CardHeader className={`${program.color} text-white text-center rounded-t-lg`}>
                <CardTitle className="text-2xl font-bold">{program.name}</CardTitle>
                <div className="text-xl font-semibold">{program.subtitle}</div>
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {program.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {program.participants}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <ul className="space-y-3 mb-6">
                  {program.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Ideal para:</h4>
                  <p className="text-gray-600 text-sm">{program.ideal}</p>
                </div>

                <Button className={`w-full ${program.buttonColor}`}>Escolher Pacote →</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
