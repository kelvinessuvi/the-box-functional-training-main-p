"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface InstructorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  editData?: any
}

export function InstructorModal({ isOpen, onClose, onSave, editData }: InstructorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    photo: null as File | null,
    specialties: [] as string[],
    instagram_url: "",
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [currentSpecialty, setCurrentSpecialty] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editData?.name || "",
        title: editData?.title || "",
        bio: editData?.bio || "",
        photo: null,
        specialties: editData?.specialties || [],
        instagram_url: editData?.instagram_url || "",
      })
      setPreviewUrl(editData?.photo_url || null)
      setDragActive(false)
      setCurrentSpecialty("")
      setIsSubmitting(false)
    }
  }, [isOpen, editData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert("Nome é obrigatório")
      return
    }
    
    if (!formData.title.trim()) {
      alert("Título é obrigatório")
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        ...formData,
        specialties: formData.specialties,
      })
      onClose()
      setFormData({ name: "", title: "", bio: "", photo: null, specialties: [], instagram_url: "" })
      setPreviewUrl(null)
    } catch (error) {
      console.error("Erro ao salvar:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        setFormData((prev) => ({ ...prev, photo: file }))
        setPreviewUrl(URL.createObjectURL(file))
      } else {
        alert("Por favor, selecione apenas arquivos de imagem")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('image/')) {
        setFormData((prev) => ({ ...prev, photo: file }))
        setPreviewUrl(URL.createObjectURL(file))
      } else {
        alert("Por favor, selecione apenas arquivos de imagem")
      }
    }
  }

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, photo: null }))
    setPreviewUrl(editData?.photo_url || null)
  }

  const addSpecialty = () => {
    if (currentSpecialty.trim() && !formData.specialties.includes(currentSpecialty.trim())) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, currentSpecialty.trim()],
      }))
      setCurrentSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-[#0A0A0A] border-[#1A1A1A]">
        <DialogHeader>
          <DialogTitle className="text-white">{editData ? "Editar Instrutor" : "Novo Instrutor"}</DialogTitle>
          <DialogDescription className="text-[#B3B3B3]">
            {editData ? "Edite os detalhes do instrutor." : "Adicione um novo instrutor à THE BOX."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: João Silva"
                required
                className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Título/Graduação *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Faixa Preta 3º Dan"
                required
                className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white">Biografia</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Breve biografia do instrutor..."
              rows={4}
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url" className="text-white">Instagram URL</Label>
            <Input
              id="instagram_url"
              type="url"
              value={formData.instagram_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, instagram_url: e.target.value }))}
              placeholder="https://instagram.com/usuario"
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
            />
            <p className="text-xs text-[#B3B3B3]">Opcional: Link do perfil do Instagram do instrutor</p>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Foto do Instrutor</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? "border-[#D4AF37] bg-[#1A1A1A]" 
                  : "border-[#1A1A1A] bg-[#0A0A0A] hover:border-[#D4AF37]"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="space-y-3">
                  <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-2 border-[#D4AF37]">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-[#B3B3B3]">
                      {formData.photo ? formData.photo.name : "Foto atual"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearImage}
                      className="text-[#B3B3B3] hover:text-[#D4AF37]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-[#B3B3B3] mx-auto mb-2" />
                  <p className="text-sm text-[#B3B3B3] mb-2">Arraste uma foto aqui ou clique para selecionar</p>
                  <p className="text-xs text-[#666666] mb-3">Formatos suportados: JPG, PNG, GIF, WebP</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="instructor-file-upload" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    <label htmlFor="instructor-file-upload" className="cursor-pointer">
                      Selecionar Arquivo
                    </label>
                  </Button>
                </div>
              )}
            </div>
            {editData && !formData.photo && (
              <p className="text-xs text-[#B3B3B3] mt-1">
                Deixe em branco para manter a foto atual
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white">Especialidades</Label>
            <div className="flex gap-2">
              <Input
                value={currentSpecialty}
                onChange={(e) => setCurrentSpecialty(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSpecialty()
                  }
                }}
                placeholder="Ex: Jiu-Jitsu, MMA, Wrestling"
                className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
              />
              <Button
                type="button"
                onClick={addSpecialty}
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
              >
                Adicionar
              </Button>
            </div>
            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[#1A1A1A] border border-[#D4AF37] text-[#D4AF37]"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(specialty)}
                      className="hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
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
              disabled={isSubmitting}
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
            >
              {isSubmitting ? "Salvando..." : editData ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

