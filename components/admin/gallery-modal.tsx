"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface GalleryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  editData?: any
}

export function GalleryModal({ isOpen, onClose, onSave, editData }: GalleryModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null as File | null,
  })
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens/closes or editData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: editData?.title || "",
        description: editData?.description || "",
        category: editData?.category || "",
        image: null,
      })
      setPreviewUrl(editData?.image_url || null)
      setIsSubmitting(false)
    }
  }, [isOpen, editData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert("Título é obrigatório")
      return
    }
    
    if (!formData.category) {
      alert("Categoria é obrigatória")
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
      setFormData({ title: "", description: "", category: "", image: null })
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
    setPreviewUrl(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Editar Imagem" : "Nova Imagem"}</DialogTitle>
          <DialogDescription>
            {editData ? "Edite os detalhes da imagem." : "Adicione uma nova imagem à galeria."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Título da imagem"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da imagem"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="treino">Treino</SelectItem>
                <SelectItem value="desafios">Desafios</SelectItem>
                <SelectItem value="equipas">Equipas</SelectItem>
                <SelectItem value="confraternizacao">Confraternização</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Imagem</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? "border-red-500 bg-red-50" : "border-gray-300"
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
                    <span className="text-sm text-gray-600">
                      {formData.image ? formData.image.name : "Imagem atual"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Arraste uma imagem aqui ou clique para selecionar</p>
                  <p className="text-xs text-gray-500 mb-3">Formatos suportados: JPG, PNG, GIF, WebP</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="file-upload" 
                  />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Selecionar Arquivo
                    </label>
                  </Button>
                </div>
              )}
            </div>
            {editData && !formData.image && (
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para manter a imagem atual
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="gradient-wine-red hover:gradient-wine-red-hover text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : (editData ? "Salvar Alterações" : "Adicionar Imagem")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
