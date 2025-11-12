import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export default function PersonalizedOffer() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="gradient-wine-red rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">
          Precisa de algo personalizado?
        </h2>
        <p className="max-w-3xl mx-auto text-lg mb-8 opacity-90">
          Os nossos programas podem ser adaptados às necessidades específicas da tua empresa. 
          Criamos experiências únicas que se alinham com os teus objetivos e cultura organizacional.
        </p>
        
        <Button 
          size="lg" 
          variant="secondary"
          className="bg-white text-[#bb1e39] hover:bg-gray-100 font-semibold px-8 py-3"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Solicitar Proposta Personalizada
        </Button>
      </div>
    </section>
  )
}
