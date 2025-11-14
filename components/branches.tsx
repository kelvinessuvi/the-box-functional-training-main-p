"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail } from "lucide-react"

type Branch = {
  id: string
  name: string
  address: string
  city: string
  country: string
  phone?: string
  email?: string
  image_url?: string
  active?: boolean
}

export function Branches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/branches")
        const data = await res.json()
        setBranches(Array.isArray(data) ? data.filter((b: any) => b.active) : [])
      } catch {
        setBranches([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <section id="branches" className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <p className="text-center text-[#B3B3B3]">Carregando filiais...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="branches" className="py-16 sm:py-20 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4 text-white">
            Nossas <span className="text-[#D4AF37]">Filiais</span>
          </h2>
          <p className="text-[#B3B3B3] max-w-3xl mx-auto text-lg">
            Encontre a filial THE BOX mais próxima de si. Estamos presentes em Angola e Portugal.
          </p>
        </div>

        {branches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#B3B3B3]">Nenhuma filial disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {branches.map((branch) => (
              <Card key={branch.id} className="bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#D4AF37] transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{branch.name}</h3>
                      <p className="text-[#D4AF37] text-sm font-semibold">{branch.city}, {branch.country}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 ml-16">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-[#D4AF37] mt-1 mr-3 flex-shrink-0" />
                      <p className="text-[#B3B3B3] text-sm">{branch.address}</p>
                    </div>
                    
                    {branch.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-[#D4AF37] mr-3 flex-shrink-0" />
                        <p className="text-[#B3B3B3] text-sm">{branch.phone}</p>
                      </div>
                    )}
                    
                    {branch.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-[#D4AF37] mr-3 flex-shrink-0" />
                        <p className="text-[#B3B3B3] text-sm">{branch.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Branches

