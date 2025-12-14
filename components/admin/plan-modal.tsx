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

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  editData?: any
}

export function PlanModal({ isOpen, onClose, onSave, editData }: PlanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null as File | null,
    active: true,
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
    name: editData?.name || "",
    description: editData?.description || "",
        image: null,
    active: editData?.active ?? true,
  })
      setPreviewUrl(editData?.image_url || null)
      setDragActive(false)
      setIsSubmitting(false)
    }
  }, [isOpen, editData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert("Nome é obrigatório")
      return
    }
    
    if (!formData.description.trim()) {
      alert("Descrição é obrigatória")
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
      setFormData({ name: "", description: "", image: null, active: true })
      setPreviewUrl(null)
    } catch (error) {
      console.error("Erro ao salvar modalidade:", error)
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
        setFormData((prev) => ({ ...prev, image: file }))
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
        setFormData((prev) => ({ ...prev, image: file }))
        setPreviewUrl(URL.createObjectURL(file))
      } else {
        alert("Por favor, selecione apenas arquivos de imagem")
      }
    }
  }

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setPreviewUrl(editData?.image_url || null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-[#0A0A0A] border-[#1A1A1A]">
        <DialogHeader>
          <DialogTitle className="text-white">{editData ? "Editar Modalidade" : "Nova Modalidade"}</DialogTitle>
          <DialogDescription className="text-[#B3B3B3]">
            {editData ? "Edite os detalhes da modalidade." : "Adicione uma nova modalidade oferecida pela THE BOX."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Nome da Modalidade *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Jiu-Jitsu, MMA, Wrestling"
                required
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a modalidade e seus benefícios..."
              rows={4}
              required
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Imagem</Label>
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
                  <div className="relative mx-auto w-32 h-32">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
            </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-[#B3B3B3]">
                      {formData.image ? formData.image.name : "Imagem atual"}
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
                  <p className="text-sm text-[#B3B3B3] mb-2">Arraste uma imagem aqui ou clique para selecionar</p>
                  <p className="text-xs text-[#666666] mb-3">Formatos suportados: JPG, PNG, GIF, WebP</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="modality-file-upload" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    <label htmlFor="modality-file-upload" className="cursor-pointer">
                      Selecionar Arquivo
                    </label>
                  </Button>
                </div>
              )}
            </div>
            {editData && !formData.image && (
              <p className="text-xs text-[#B3B3B3] mt-1">
                Deixe em branco para manter a imagem atual
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
              className="rounded bg-[#1A1A1A] border-[#1A1A1A] text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <Label htmlFor="active" className="text-white">Modalidade ativa</Label>
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
