"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Award, User } from "lucide-react"
import { InstructorDetailModal } from "./instructor-detail-modal"

type Instructor = {
  id: string
  name: string
  title?: string
  bio?: string
  photo_url?: string
  specialties?: string[]
  instagram_url?: string
  active?: boolean
}

export function Instructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/instructors")
        const data = await res.json()
        setInstructors(Array.isArray(data) ? data.filter((i: any) => i.active) : [])
      } catch {
        setInstructors([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <section id="instructors" className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <p className="text-center text-[#B3B3B3]">Carregando instrutores...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="instructors" className="py-16 sm:py-20 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4 text-white">
            Nossos <span className="text-[#D4AF37]">Instrutores</span>
          </h2>
          <p className="text-[#B3B3B3] max-w-3xl mx-auto text-lg">
            Conheça os instrutores qualificados da THE BOX, dedicados ao seu desenvolvimento e crescimento no Jiu-Jitsu.
          </p>
        </div>

        {instructors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#B3B3B3]">Nenhum instrutor disponível no momento.</p>
            <p className="text-[#B3B3B3] text-sm mt-2">Os instrutores serão adicionados em breve.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {instructors.map((instructor) => (
                <Card 
                  key={instructor.id} 
                  className="bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#D4AF37] transition-all overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedInstructor(instructor)
                    setIsModalOpen(true)
                  }}
                >
                  <CardContent className="p-0">
                  {/* Photo */}
                  <div className="relative h-64 bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                    {instructor.photo_url ? (
                      <Image
                        src={instructor.photo_url}
                        alt={instructor.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-[#D4AF37] rounded-full flex items-center justify-center">
                        <User className="w-16 h-16 text-black" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{instructor.name}</h3>
                    {instructor.title && (
                      <p className="text-[#D4AF37] font-semibold mb-3">{instructor.title}</p>
                    )}
                    {instructor.bio && (
                      <p className="text-[#B3B3B3] text-sm leading-relaxed mb-4">{instructor.bio}</p>
                    )}
                    {instructor.specialties && Array.isArray(instructor.specialties) && instructor.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {instructor.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#1A1A1A] border border-[#D4AF37] rounded-full text-xs text-[#D4AF37]"
                          >
                            <Award className="w-3 h-3" />
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <InstructorDetailModal
              instructor={selectedInstructor}
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false)
                setSelectedInstructor(null)
              }}
            />
          </>
        )}
      </div>
    </section>
  )
}

export default Instructors

