"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/contexts/language-context"

export function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, language } = useTranslation()

  const categories = language === "pt" 
    ? [
        { id: "Todas", name: "Todas" },
        { id: "instrutores", name: "Instrutores" },
        { id: "aulas", name: "Aulas" },
        { id: "eventos", name: "Eventos" },
      ]
    : [
        { id: "Todas", name: "All" },
        { id: "instrutores", name: "Instructors" },
        { id: "aulas", name: "Classes" },
        { id: "eventos", name: "Events" },
      ]

  // Função para filtrar URLs externas problemáticas
  const filterImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg?height=300&width=300&text=THE+BOX"
    if (url.includes("images.unsplash.com") || url.includes("unsplash.com")) {
      return "/placeholder.svg?height=300&width=300&text=THE+BOX"
    }
    // Verificar se é uma URL externa que não seja do próprio domínio
    if (url.startsWith("http") && !url.includes(window.location.hostname)) {
      // Permitir apenas URLs do Supabase (que são seguras)
      if (url.includes("supabase.co")) {
        return url
      }
      // Para outras URLs externas, usar placeholder
      return "/placeholder.svg?height=300&width=300&text=THE+BOX"
    }
    return url
  }


  useEffect(() => {
    const fetchGalleryItems = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const url = selectedCategory === "Todas" ? "/api/gallery" : `/api/gallery?category=${selectedCategory}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Se a resposta contém um erro
        if (data.error) {
          throw new Error(data.error)
        }

        // Usar apenas dados do banco
        setGalleryItems(data || [])
      } catch (error: any) {
        console.error("Erro ao carregar galeria:", error)
        setError(error.message || "Erro ao carregar imagens")

        // Em caso de erro, mostrar lista vazia
        setGalleryItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGalleryItems()
  }, [selectedCategory])

  return (
    <section id="gallery" className="py-16 sm:py-20 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4 text-white">
            <span className="text-[#D4AF37]">{t.gallery.title}</span> {language === "pt" ? "de Momentos" : "of Moments"}
          </h2>
          <p className="text-[#B3B3B3] max-w-3xl mx-auto text-lg">
            {t.gallery.subtitle}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={
                selectedCategory === category.id 
                  ? "bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold" 
                  : "border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#1A1A1A] border border-[#D4AF37] rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-[#D4AF37] text-center">
              <strong>{language === "pt" ? "Aviso:" : "Warning:"}</strong> {language === "pt" ? "Não foi possível carregar as imagens do servidor." : "Could not load images from server."}
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-[#B3B3B3]">{t.common.loading}</p>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center py-8 sm:py-12">
              <p className="text-sm text-[#B3B3B3] sm:text-base">
                {language === "pt" ? "Nenhuma imagem encontrada para esta categoria." : "No images found for this category."}
              </p>
            </div>
          ) : (
            galleryItems.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg overflow-hidden aspect-square flex items-center justify-center hover:border-[#D4AF37] transition-all">
                  {item.image_url && item.image_url !== "/placeholder.svg?height=300&width=300&text=THE+BOX" ? (
                    <img
                      src={filterImageUrl(item.image_url)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Se a imagem falhar ao carregar, mostrar placeholder
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        target.parentElement!.innerHTML = `
                          <div class="text-center">
                            <div class="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-2xl mb-4 mx-auto">
                              TB
                            </div>
                            <h3 class="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                              ${item.title}
                            </h3>
                          </div>
                        `
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-2xl mb-4 mx-auto">
                        TB
                      </div>
                      <h3 className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-[#B3B3B3]">{item.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default Gallery
