"use client"

import { Star, Quote } from "lucide-react"

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">O Que Dizem os Nossos Clientes</h2>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
          Mais de 20 empresas já transformaram as suas equipas com o Super Beast. 
          Descobre o que dizem sobre a nossa metodologia.
        </p>
      </div>

      {/* Testimonial Card */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-100 text-center relative">
          <Quote className="w-12 h-12 text-[#bb1e39] mx-auto mb-6" />
          <blockquote className="text-lg text-muted-foreground mb-6 italic">
            "O Super Beast transformou completamente a dinâmica da nossa equipa. 
            Os colaboradores estão mais unidos, motivados e produtivos. 
            É incrível como uma experiência de um dia pode ter um impacto tão duradouro."
          </blockquote>
          
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
          </div>
          
          <div className="font-semibold text-lg">Maria Costa</div>
          <div className="text-sm text-muted-foreground">Diretora de Recursos Humanos, TechCorp Angola</div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-[#bb1e39]">95%</div>
          <div className="text-sm text-muted-foreground">Satisfação dos Clientes</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-[#bb1e39]">100%</div>
          <div className="text-sm text-muted-foreground">Empresas que Repetem</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-[#bb1e39]">20+</div>
          <div className="text-sm text-muted-foreground">Equipas Transformadas</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-[#bb1e39]">5★</div>
          <div className="text-sm text-muted-foreground">Avaliação Média</div>
        </div>
      </div>
    </section>
  )
}
