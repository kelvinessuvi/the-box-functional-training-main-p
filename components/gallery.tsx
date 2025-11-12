"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { id: "Todas", name: "Todas" },
    { id: "treino", name: "Treino" },
    { id: "desafios", name: "Desafios" },
    { id: "equipas", name: "Equipas" },
    { id: "confraternizacao", name: "Confraternização" },
  ]

  // Função para filtrar URLs externas problemáticas
  const filterImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg?height=300&width=300&text=Super+Beast"
    if (url.includes("images.unsplash.com") || url.includes("unsplash.com")) {
      return "/placeholder.svg?height=300&width=300&text=Super+Beast"
    }
    // Verificar se é uma URL externa que não seja do próprio domínio
    if (url.startsWith("http") && !url.includes(window.location.hostname)) {
      // Permitir apenas URLs do Supabase (que são seguras)
      if (url.includes("supabase.co")) {
        return url
      }
      // Para outras URLs externas, usar placeholder
      return "/placeholder.svg?height=300&width=300&text=Super+Beast"
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
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-[#341c20] to-[#bb1e39] bg-clip-text text-transparent">Galeria</span>{" "}
            de Momentos
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Veja alguns dos momentos mais marcantes dos nossos eventos Super Beast. Cada imagem conta uma história de
            superação, união e transformação.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={
                selectedCategory === category.id ? "gradient-wine-red hover:gradient-wine-red-hover text-white" : ""
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-yellow-800 text-center">
              <strong>Aviso:</strong> Não foi possível carregar as imagens do servidor. Mostrando conteúdo de exemplo.
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="col-span-4 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p>Carregando imagens...</p>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="col-span-4 text-center py-12">
              <p className="text-gray-600">Nenhuma imagem encontrada para esta categoria.</p>
            </div>
          ) : (
            galleryItems.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="bg-gray-200 rounded-lg overflow-hidden aspect-square flex items-center justify-center hover:bg-gray-300 transition-colors">
                  {item.image_url && item.image_url !== "/placeholder.svg?height=300&width=300&text=Super+Beast" ? (
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
                            <div class="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 mx-auto">
                              SB
                            </div>
                            <h3 class="font-semibold text-gray-900 group-hover:text-[#bb1e39] transition-colors">
                              ${item.title}
                            </h3>
                          </div>
                        `
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 gradient-wine-red rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 mx-auto">
                        SB
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#bb1e39] transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
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
