"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Phone, Building, Calendar, MessageSquare } from "lucide-react"

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  message: any
}

export function MessageModal({ isOpen, onClose, message }: MessageModalProps) {
  if (!message) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Mensagem de {message.name}</DialogTitle>
          <DialogDescription>
            Recebida em {new Date(message.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{message.email}</span>
            </div>
            {message.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{message.phone}</span>
              </div>
            )}
          </div>

          {message.company && (
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{message.company}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Recebida em {new Date(message.created_at).toLocaleString()}</span>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-1" />
              <div>
                <h4 className="font-medium mb-2">{message.subject}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{message.message || "Sem mensagem adicional."}</p>
              </div>
            </div>
          </div>

          {message.participants && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium">Número de participantes: </span>
              <span className="text-sm">{message.participants}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button className="gradient-wine-red hover:gradient-wine-red-hover text-white">Responder por Email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
