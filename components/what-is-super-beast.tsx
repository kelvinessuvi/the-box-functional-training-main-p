import { Users, Target, Heart, TrendingUp } from "lucide-react"

export default function WhatIsSuperBeast() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">
          O Que É o <span className="text-[#bb1e39]">Super Beast</span>
        </h2>
        <div className="max-w-4xl mx-auto space-y-4 text-muted-foreground">
          <p className="text-lg">
            Uma experiência corporativa inovadora que transforma equipas através do fitness, 
            entretenimento e desenvolvimento pessoal.
          </p>
          <p className="text-lg">
            Desperta o teu Monstro Interior e fortalece a tua organização com metodologias únicas 
            e resultados comprovados.
          </p>
        </div>
        <h3 className="text-xl font-semibold mt-8 mb-8 text-[#bb1e39]">Metodologia Única</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* União de Equipas */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
          <div className="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">União de Equipas</h3>
          <p className="text-sm text-muted-foreground">
            Fortalece laços entre colaboradores e cria espírito de equipa através de desafios colaborativos.
          </p>
        </div>

        {/* Superar Desafios */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
          <div className="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Superar Desafios</h3>
          <p className="text-sm text-muted-foreground">
            Desenvolve resiliência e capacidade de superar obstáculos em equipa.
          </p>
        </div>

        {/* Saúde Integral */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
          <div className="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Saúde Integral</h3>
          <p className="text-sm text-muted-foreground">
            Promove bem-estar físico e mental através de exercícios funcionais e mindfulness.
          </p>
        </div>

        {/* Desenvolvimento */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
          <div className="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Desenvolvimento</h3>
          <p className="text-sm text-muted-foreground">
            Potencializa habilidades de liderança e comunicação em equipa.
          </p>
        </div>
      </div>
    </section>
  )
}
