"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, User } from "lucide-react"

interface FounderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  editData?: any
}

export function FounderModal({ isOpen, onClose, onSave, editData }: FounderModalProps) {
  const [name, setName] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("Co-Fundador")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editData) {
      setName(editData.name || "")
      setFullName(editData.full_name || "")
      setRole(editData.role || "Co-Fundador")
      setPhotoPreview(editData.photo_url || null)
      setPhoto(null)
      setRemovePhoto(false)
    } else {
      resetForm()
    }
  }, [editData, isOpen])

  const resetForm = () => {
    setName("")
    setFullName("")
    setRole("Co-Fundador")
    setPhoto(null)
    setPhotoPreview(null)
    setRemovePhoto(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setRemovePhoto(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    setRemovePhoto(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSave({
        name: name.trim(),
        full_name: fullName.trim() || name.trim(),
        role: role.trim() || "Co-Fundador",
        photo,
        removePhoto,
      })
      resetForm()
      onClose()
    } catch (error) {
      console.error("Erro ao salvar fundador:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-[#1A1A1A] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editData ? "Editar Fundador" : "Adicionar Fundador"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto */}
          <div className="flex flex-col items-center">
            <div 
              className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#B8960C] flex items-center justify-center">
                  <User className="w-12 h-12 text-black" />
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
              >
                <Upload className="w-4 h-4 mr-2" />
                {photoPreview ? "Alterar" : "Adicionar"} Foto
              </Button>
              {photoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePhoto}
                  className="border-red-500/50 text-red-400 hover:border-red-500 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do fundador"
              required
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white"
            />
          </div>

          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white">Nome Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome completo (opcional)"
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white"
            />
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">Cargo</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Co-Fundador, Fundador"
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


