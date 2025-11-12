import { Award, Target, CheckCircle, Users } from "lucide-react"

export function WhyChooseUs() {
  const reasons = [
    {
      icon: Award,
      title: "Experiência Comprovada",
      description: "Mais de 10 anos transformando equipas em Angola",
    },
    {
      icon: Target,
      title: "Metodologia Adaptada",
      description: "Programa especialmente desenvolvido para a realidade empresarial angolana",
    },
    {
      icon: CheckCircle,
      title: "Resultados Garantidos",
      description: "95% de satisfação dos clientes e 100% de empresas que repetem a experiência",
    },
    {
      icon: Users,
      title: "Equipa Especializada",
      description: "Coaches certificados com formação internacional",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Who We Are */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Quem{" "}
                <span className="bg-gradient-to-r from-[#341c20] to-[#bb1e39] bg-clip-text text-transparent">
                  Somos
                </span>
              </h2>
              <div className="space-y-6">
                <p className="text-gray-600">
                  O Super Beast é um produto do <strong>Fit Em 14 Semanas</strong>, empresa líder em transformação
                  física e mental em Angola.
                </p>
                <p className="text-gray-600">
                  Fundada por <strong>Ricardo Buta</strong> e <strong>Mauro Sérgio</strong>, a empresa conta com mais de
                  10 anos de experiência, 4+ coaches especializados e já transformou mais de 100 clientes.
                </p>
                <p className="text-gray-600">
                  Nossa missão é revolucionar o desenvolvimento de equipas em Angola através de metodologias inovadoras
                  e resultados comprovados.
                </p>
              </div>

              {/* Founders */}
              <div className="mt-8 flex items-center space-x-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mb-2 mx-auto"></div>
                  <h4 className="font-semibold text-gray-900">Ricardo Buta</h4>
                  <p className="text-sm text-gray-600">Co-Fundador</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mb-2 mx-auto"></div>
                  <h4 className="font-semibold text-gray-900">Mauro Sérgio</h4>
                  <p className="text-sm text-gray-600">Co-Fundador</p>
                </div>
              </div>
            </div>

            {/* Right Column - Why Choose Us */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Porquê{" "}
                <span className="bg-gradient-to-r from-[#341c20] to-[#bb1e39] bg-clip-text text-transparent">
                  Escolher-nos
                </span>
              </h2>
              <div className="space-y-6">
                {reasons.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 gradient-wine-red rounded-lg flex items-center justify-center">
                      <reason.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{reason.title}</h3>
                      <p className="text-gray-600">{reason.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
