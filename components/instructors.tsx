"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Award, User } from "lucide-react"
import { InstructorDetailModal } from "./instructor-detail-modal"
import { useTranslation } from "@/contexts/language-context"

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
  const { t } = useTranslation()

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
          <p className="text-center text-[#B3B3B3]">{t.common.loading}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="instructors" className="py-16 sm:py-20 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4 text-white">
            {t.instructors.title.split(' ').slice(0, -1).join(' ')} <span className="text-[#D4AF37]">{t.instructors.title.split(' ').slice(-1)}</span>
          </h2>
          <p className="text-[#B3B3B3] max-w-3xl mx-auto text-lg">
            {t.instructors.subtitle}
          </p>
        </div>

        {instructors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#B3B3B3]">{t.common.loading}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
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
                  <div className="relative h-44 sm:h-48 bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                    {instructor.photo_url ? (
                      <Image
                        src={instructor.photo_url}
                        alt={instructor.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#D4AF37] rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">{instructor.name}</h3>
                    {instructor.title && (
                      <p className="text-[#D4AF37] font-semibold text-xs sm:text-sm mb-2">{instructor.title}</p>
                    )}
                    {instructor.bio && (
                      <div className="mb-3">
                        <p className="text-[#B3B3B3] text-xs leading-relaxed line-clamp-2">
                          {instructor.bio}
                        </p>
                        <span className="text-[#D4AF37] text-xs font-medium mt-1 inline-block hover:underline">
                          ...{t.instructors.readMore}
                        </span>
                      </div>
                    )}
                    {instructor.specialties && Array.isArray(instructor.specialties) && instructor.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {instructor.specialties.slice(0, 2).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1A1A1A] border border-[#D4AF37] rounded-full text-[10px] text-[#D4AF37]"
                          >
                            <Award className="w-2.5 h-2.5" />
                            {specialty}
                          </span>
                        ))}
                        {instructor.specialties.length > 2 && (
                          <span className="text-[10px] text-[#B3B3B3]">+{instructor.specialties.length - 2}</span>
                        )}
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
