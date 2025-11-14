import { Calendar, MapPin, Users, Target } from "lucide-react"

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:py-20 md:py-24 bg-black text-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4 text-white">
          Quem <span className="text-[#D4AF37]">Somos</span>
        </h2>
        <p className="text-[#B3B3B3] max-w-2xl mx-auto text-lg">
          Conheça a história e missão da THE BOX Functional Training
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
        {/* Text Content */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#D4AF37] mb-3">Nossa História</h3>
            <p className="text-[#B3B3B3] leading-relaxed">
              A <strong className="text-white">THE BOX Functional Training</strong> é uma academia de Artes Marciais 
              fundada em <strong className="text-[#D4AF37]">2021</strong> por <strong className="text-white">Mário Stefan Pitagrós de Melo Araújo (Miramar)</strong>, 
              associada à <strong className="text-white">GF Team Angola</strong>.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-[#D4AF37] mb-3">Nossa Missão</h3>
            <p className="text-[#B3B3B3] leading-relaxed">
              Levar a THE BOX ao maior número de pessoas, promovendo bem-estar físico, mental e emocional, 
              através da união, companheirismo e superação. Formamos atletas e cidadãos de valor.
        </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-6 text-center hover:border-[#D4AF37] transition-all">
            <Calendar className="h-8 w-8 text-[#D4AF37] mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">2021</div>
            <div className="text-sm text-[#B3B3B3]">Ano de Fundação</div>
          </div>
          
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-6 text-center hover:border-[#D4AF37] transition-all">
            <MapPin className="h-8 w-8 text-[#D4AF37] mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">4</div>
            <div className="text-sm text-[#B3B3B3]">Filiais</div>
          </div>
          
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-6 text-center hover:border-[#D4AF37] transition-all">
            <Users className="h-8 w-8 text-[#D4AF37] mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">GF Team</div>
            <div className="text-sm text-[#B3B3B3]">Angola</div>
          </div>
          
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-6 text-center hover:border-[#D4AF37] transition-all">
            <Target className="h-8 w-8 text-[#D4AF37] mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">2</div>
            <div className="text-sm text-[#B3B3B3]">Países</div>
          </div>
        </div>
      </div>

      {/* Expansion Info */}
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-6 md:p-8">
        <p className="text-[#B3B3B3] leading-relaxed text-center">
          Criada para elevar a qualidade de treino e profissionalização de atletas, a THE BOX já expandiu para várias 
          unidades, incluindo <strong className="text-white">Lisboa, Portugal</strong>, levando nossa metodologia 
          e valores para além das fronteiras de Angola.
        </p>
      </div>
    </section>
  )
}
