"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"

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
  const { t, language } = useTranslation()

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
      <section id="branches" className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <p className="text-center text-[#B3B3B3]">{t.common.loading}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="branches" className="py-12 sm:py-14 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold sm:text-3xl mb-2 text-white">
            {language === "pt" ? (
              <>Nossas <span className="text-[#D4AF37]">Filiais</span></>
            ) : (
              <>Our <span className="text-[#D4AF37]">Locations</span></>
            )}
          </h2>
          <p className="text-[#B3B3B3] text-sm sm:text-base">
            {language === "pt" 
              ? "Estamos presentes em Angola e Portugal"
              : "We are present in Angola and Portugal"
            }
          </p>
        </div>

        {branches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#B3B3B3]">{t.common.loading}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {branches.map((branch) => (
              <Card key={branch.id} className="bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#D4AF37] transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-9 h-9 bg-[#D4AF37] rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <MapPin className="w-4 h-4 text-black" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{branch.name}</h3>
                      <p className="text-[#D4AF37] text-xs font-semibold">{branch.city}, {branch.country}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="w-3 h-3 text-[#D4AF37] mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-[#B3B3B3] text-xs line-clamp-2">{branch.address}</p>
                    </div>
                    
                    {branch.phone && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 text-[#D4AF37] mr-2 flex-shrink-0" />
                        <p className="text-[#B3B3B3] text-xs truncate">{branch.phone}</p>
                      </div>
                    )}
                    
                    {branch.email && (
                      <div className="flex items-center">
                        <Mail className="w-3 h-3 text-[#D4AF37] mr-2 flex-shrink-0" />
                        <p className="text-[#B3B3B3] text-xs truncate">{branch.email}</p>
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
