"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"
import { Award, User, X, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"

type Instructor = {
  id: string
  name: string
  title?: string
  bio?: string
  photo_url?: string
  specialties?: string[]
  instagram_url?: string
}

interface InstructorDetailModalProps {
  instructor: Instructor | null
  isOpen: boolean
  onClose: () => void
}

export function InstructorDetailModal({ instructor, isOpen, onClose }: InstructorDetailModalProps) {
  if (!instructor) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-[#0A0A0A] border-[#1A1A1A] p-0 gap-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Imagem do Instrutor */}
          <div className="relative h-64 md:h-full min-h-[400px] bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
            {instructor.photo_url ? (
              <Image
                src={instructor.photo_url}
                alt={instructor.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-32 h-32 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-black" />
              </div>
            )}
          </div>

          {/* Informações do Instrutor */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Nome e Título */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {instructor.name}
              </h2>
              {instructor.title && (
                <p className="text-lg md:text-xl text-[#D4AF37] font-semibold">
                  {instructor.title}
                </p>
              )}
            </div>

            {/* Biografia */}
            {instructor.bio && (
              <div>
                <h3 className="text-sm font-semibold text-[#B3B3B3] uppercase mb-2">
                  Sobre
                </h3>
                <p className="text-[#B3B3B3] leading-relaxed">
                  {instructor.bio}
                </p>
              </div>
            )}

            {/* Especialidades */}
            {instructor.specialties && Array.isArray(instructor.specialties) && instructor.specialties.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#B3B3B3] uppercase mb-3">
                  Especialidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-[#1A1A1A] border border-[#D4AF37] rounded-full text-sm text-[#D4AF37]"
                    >
                      <Award className="w-4 h-4" />
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Instagram */}
            {instructor.instagram_url && (
              <div>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  <a
                    href={instructor.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Instagram className="w-5 h-5" />
                    Ver Perfil no Instagram
                  </a>
                </Button>
              </div>
            )}

            {/* Botão fechar (mobile) */}
            <div className="md:hidden pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

