"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, Database } from "lucide-react"

export function DatabaseSetupBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem("db-setup-banner-dismissed")
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Check if database is configured by testing an API endpoint
    const checkDatabase = async () => {
      try {
        const response = await fetch("/api/stats")
        const data = await response.json()

        // If we get default/fallback data, show the banner
        if (data.gallery_images === 8 && data.active_plans === 4 && data.monthly_views === 1250) {
          setIsVisible(true)
        }
      } catch (error) {
        setIsVisible(true)
      }
    }

    checkDatabase()
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem("db-setup-banner-dismissed", "true")
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Modo Demonstração Ativo</p>
            <p className="text-xs text-yellow-700">
              O banco de dados não está configurado. Execute o script SQL para ativar todas as funcionalidades.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-yellow-800 border-yellow-300 hover:bg-yellow-100 bg-transparent"
            onClick={() => window.open("/admin", "_blank")}
          >
            <Database className="h-4 w-4 mr-1" />
            Ver Instruções
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-yellow-600 hover:text-yellow-800">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
