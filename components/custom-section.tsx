import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CustomSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Precisa de algo personalizado?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Todos os nossos programas podem ser adaptados às necessidades específicas da sua empresa. Entre em contacto
            connosco para criar uma experiência única para a sua equipa.
          </p>
          <Button
            asChild
            className="gradient-wine-red hover:gradient-wine-red-hover text-white px-8 py-3 text-lg rounded-full"
          >
            <Link href="#contact">Solicitar Proposta Personalizada</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
