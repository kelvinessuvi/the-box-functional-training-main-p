"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X, Trash2 } from "lucide-react"
import Image from "next/image"

interface PartnerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  editData?: any
}

export function PartnerModal({ isOpen, onClose, onSave, editData }: PartnerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
    active: true,
    logo: null as File | null,
    removeLogo: false,
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editData?.name || "",
        description: editData?.description || "",
        website_url: editData?.website_url || "",
        active: editData?.active ?? true,
        logo: null,
        removeLogo: false,
      })
      setPreviewUrl(editData?.logo_url || null)
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

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
      setFormData({ name: "", description: "", website_url: "", active: true, logo: null, removeLogo: false })
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
        setFormData((prev) => ({ ...prev, logo: file, removeLogo: false }))
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
        setFormData((prev) => ({ ...prev, logo: file, removeLogo: false }))
        setPreviewUrl(URL.createObjectURL(file))
      } else {
        alert("Por favor, selecione apenas arquivos de imagem")
      }
    }
  }

  // Desfazer nova imagem (volta para a anterior)
  const undoNewImage = () => {
    setFormData((prev) => ({ ...prev, logo: null, removeLogo: false }))
    setPreviewUrl(editData?.logo_url || null)
  }

  // Remover imagem completamente
  const removeImage = () => {
    setFormData((prev) => ({ ...prev, logo: null, removeLogo: true }))
    setPreviewUrl(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-[#0A0A0A] border-[#1A1A1A]">
        <DialogHeader>
          <DialogTitle className="text-white">{editData ? "Editar Parceiro" : "Novo Parceiro"}</DialogTitle>
          <DialogDescription className="text-[#B3B3B3]">
            {editData ? "Edite os detalhes do parceiro." : "Adicione um novo parceiro da THE BOX."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Nome do Parceiro *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: GF Team Angola"
              required
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Breve descrição do parceiro..."
              rows={3}
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url" className="text-white">Website</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://www.exemplo.com"
              className="bg-[#1A1A1A] border-[#1A1A1A] text-white placeholder:text-[#B3B3B3] focus:border-[#D4AF37]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Logo do Parceiro</Label>
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
                  <div className="relative mx-auto w-32 h-32 bg-white rounded-lg p-2">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-[#B3B3B3]">
                      {formData.logo ? formData.logo.name : "Logo atual"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {formData.logo && editData?.logo_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={undoNewImage}
                        className="text-[#B3B3B3] border-[#1A1A1A] hover:text-white hover:border-white"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Desfazer
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="text-red-400 border-red-400/50 hover:text-red-300 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover Logo
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-[#B3B3B3] mx-auto mb-2" />
                  <p className="text-sm text-[#B3B3B3] mb-2">Arraste o logo aqui ou clique para selecionar</p>
                  <p className="text-xs text-[#666666] mb-3">Recomendado: PNG com fundo transparente</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="partner-file-upload" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    <label htmlFor="partner-file-upload" className="cursor-pointer">
                      Selecionar Arquivo
                    </label>
                  </Button>
                </div>
              )}
            </div>
            {formData.removeLogo && (
              <p className="text-xs text-red-400 mt-1">
                ⚠️ O logo será removido ao salvar
              </p>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
            <div>
              <Label htmlFor="active" className="text-white">Ativo</Label>
              <p className="text-xs text-[#B3B3B3]">Parceiro visível no site</p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
            />
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
