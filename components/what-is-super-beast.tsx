import { Users, Shield, Heart, Award } from "lucide-react"

export default function WhatIsSuperBeast() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:py-20 bg-black">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4 text-white">
          Nossa <span className="text-[#D4AF37]">Filosofia</span>
        </h2>
        <div className="max-w-4xl mx-auto space-y-4 text-[#B3B3B3]">
          <p className="text-lg">
            A THE BOX é uma academia de Artes Marciais fundada em 2021, associada à GF Team Angola, 
            criada para elevar a qualidade de treino e profissionalização de atletas.
          </p>
          <p className="text-lg">
            <strong className="text-[#D4AF37] uppercase">"Aqui o Sistema é Bruto"</strong> - Desperta o teu 
            potencial interior e fortalece a tua mente e corpo através de metodologias únicas e resultados comprovados.
          </p>
        </div>
        <h3 className="text-xl font-semibold mt-8 mb-8 text-[#D4AF37] uppercase">Nossos Valores</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Irmandade */}
        <div className="bg-[#0A0A0A] rounded-lg p-6 border border-[#1A1A1A] text-center hover:border-[#D4AF37] transition-all">
          <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">Irmandade</h3>
          <p className="text-sm text-[#B3B3B3]">
            Todos fazem parte da vitória e da derrota da equipa. Criamos laços que vão além do tatami.
          </p>
        </div>

        {/* Integridade */}
        <div className="bg-[#0A0A0A] rounded-lg p-6 border border-[#1A1A1A] text-center hover:border-[#D4AF37] transition-all">
          <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">Integridade</h3>
          <p className="text-sm text-[#B3B3B3]">
            Respeito, disciplina e espírito de equipa são fundamentais. Kimonos limpos, conduta exemplar.
          </p>
        </div>

        {/* Desenvolvimento */}
        <div className="bg-[#0A0A0A] rounded-lg p-6 border border-[#1A1A1A] text-center hover:border-[#D4AF37] transition-all">
          <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">Desenvolvimento</h3>
          <p className="text-sm text-[#B3B3B3]">
            Formação contínua de atletas e cidadãos de valor. Instrutores com papel vital no crescimento.
          </p>
        </div>

        {/* Partilha */}
        <div className="bg-[#0A0A0A] rounded-lg p-6 border border-[#1A1A1A] text-center hover:border-[#D4AF37] transition-all">
          <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">Partilha</h3>
          <p className="text-sm text-[#B3B3B3]">
            Jiu-Jitsu para todos - crianças, mulheres, masters. Política de portas abertas e limpeza espiritual (Soji).
          </p>
        </div>
      </div>
    </section>
  )
}
