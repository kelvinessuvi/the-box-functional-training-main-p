import { 
  Shield, 
  Flame,
  Target,
  Swords,
  Mountain,
  HandHeart,
  Handshake,
  Users,
  Scale,
  TrendingUp
} from "lucide-react"

const values = [
  { icon: Shield, title: "Disciplina" },
  { icon: HandHeart, title: "Respeito" },
  { icon: Flame, title: "Intensidade" },
  { icon: Target, title: "Técnica" },
  { icon: Swords, title: "Coragem" },
  { icon: Mountain, title: "Humildade" },
  { icon: Handshake, title: "Compromisso" },
  { icon: Users, title: "Inclusão" },
  { icon: Scale, title: "Ética" },
  { icon: TrendingUp, title: "Superação" }
]

export default function WhatIsSuperBeast() {
  return (
    <section id="philosophy" className="mx-auto max-w-7xl px-4 py-16 sm:py-20 bg-black">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4 text-white">
          Nossa <span className="text-[#D4AF37]">Filosofia</span>
        </h2>
        <div className="max-w-4xl mx-auto space-y-4 text-[#B3B3B3]">
          <p className="text-lg">
            A THE BOX, fundada em 2021 e associada à GF Team Angola, nasceu com a missão de elevar o nível do treino 
            e a profissionalização dos atletas em Angola e Portugal.
          </p>
          <p className="text-lg">
            Aqui cultivamos disciplina, técnica e respeito, formando não apenas competidores, mas indivíduos mais fortes, 
            confiantes e preparados para qualquer desafio.
          </p>
          <p className="text-lg">
            <strong className="text-[#D4AF37] uppercase">"Aqui o Sistema é Bruto"</strong> — porque acreditamos num treino real, 
            intenso e transformador, capaz de despertar o teu potencial máximo e fortalecer corpo e mente através de 
            metodologias únicas e resultados comprovados.
          </p>
        </div>
        <h3 className="text-xl font-semibold mt-12 mb-8 text-[#D4AF37] uppercase">Nossos Valores</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
        {values.map((value, index) => {
          const Icon = value.icon
          return (
            <div 
              key={index}
              className="bg-[#0A0A0A] rounded-lg p-3 border border-[#1A1A1A] text-center hover:border-[#D4AF37] transition-all"
            >
              <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-[10px] sm:text-xs font-bold text-white">{value.title}</h3>
            </div>
          )
        })}
      </div>
    </section>
  )
}
