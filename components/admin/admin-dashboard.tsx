"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, MessageSquare, ImageIcon, Package, LogOut, Plus, Edit, Trash2, Eye, Lock, RefreshCw } from "lucide-react"
import Link from "next/link"
import { GalleryModal } from "./gallery-modal"
import { PlanModal } from "./plan-modal"
import { MessageModal } from "./message-modal"
import { ChangePasswordModal } from "./change-password-modal"
import SettingsTab from "./settings-tab"
import ExportButtons from "./export-buttons"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { shouldShowDebug } from "@/config/debug"
import { useDirectDatabase } from "@/hooks/use-direct-database"
import { UserManagement } from "./user-management"

export function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)

  // Estado para dados (mantido para compatibilidade, mas será substituído pelo hook)
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    activePlans: 0,
    galleryImages: 0,
    monthlyViews: 0,
  })
  const [messages, setMessages] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [galleryImages, setGalleryImages] = useState<any[]>([])
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string | null>(null)
  const [galleryPage, setGalleryPage] = useState(1)
  const PAGE_SIZE = 6
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState<string>("")
  
  // Estados para filtros de mensagens
  const [messageFilter, setMessageFilter] = useState<string>('all')
  const [messageSort, setMessageSort] = useState<string>('date-desc')

  // Função para recarregar dados
  const refreshData = async () => {
    console.log("[DASHBOARD] Iniciando refreshData...")
    setIsLoading(true)
    
    try {
      // Carregar estatísticas sem timestamp para evitar problemas de hidratação
      const statsResponse = await fetch("/api/stats", { 
        cache: "no-store", 
        credentials: "same-origin",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const statsData = await statsResponse.json()
      console.log("[DASHBOARD] Dados de estatísticas recebidos:", statsData)
      
      setStats({
        totalMessages: statsData.total_messages || 0,
        unreadMessages: statsData.unread_messages || 0,
        activePlans: statsData.active_plans || 0,
        galleryImages: statsData.gallery_images || 0,
        monthlyViews: statsData.monthly_views || 0,
      })

      // Carregar mensagens
      const messagesResponse = await fetch("/api/contact", { 
        cache: "no-store", 
        credentials: "same-origin",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const messagesData = await messagesResponse.json()
      setMessages(messagesData || [])

      // Carregar planos
      const plansResponse = await fetch("/api/plans", { 
        cache: "no-store", 
        credentials: "same-origin",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const plansData = await plansResponse.json()
      setPlans(plansData || [])

      // Carregar imagens da galeria
      const query = new URLSearchParams()
      if (galleryCategoryFilter) query.set('category', galleryCategoryFilter)
      const galleryResponse = await fetch(`/api/gallery${query.toString() ? `?${query.toString()}` : ''}`, { 
        cache: "no-store", 
        credentials: "same-origin",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const galleryData = await galleryResponse.json()
      setGalleryImages(galleryData || [])
      
      console.log("[DASHBOARD] Recarregamento concluído com sucesso")
      setLastUpdateTime(new Date())
      
      // Sem notificações - atualização silenciosa
    } catch (error) {
      console.error("[DASHBOARD] Erro ao recarregar dados:", error)
      // Sem notificações de erro também
    } finally {
      setIsLoading(false)
    }
  }

  // Hook para dados diretos do banco
  const { stats: directStats, isLoading: directLoading, lastUpdate: directLastUpdate, refreshStats } = useDirectDatabase()

  // Função para atualização manual
  const handleManualRefresh = () => {
    refreshStats()
  }

  // Carregar dados
  useEffect(() => {
    setIsMounted(true)
    setCurrentTime(new Date().toLocaleString())
    let isComponentMounted = true
    
    const loadData = async () => {
      if (isComponentMounted) {
        await refreshData()
      }
    }
    
    loadData()
    
    // Atualizar tempo atual a cada segundo
    const timeInterval = setInterval(() => {
      if (isComponentMounted) {
        setCurrentTime(new Date().toLocaleString())
      }
    }, 1000)
    
    // Sistema de atualização em tempo real com Supabase Realtime
    // Os dados serão atualizados automaticamente quando houver mudanças no banco
    
    // Cleanup quando o componente for desmontado
    return () => {
      isComponentMounted = false
      clearInterval(timeInterval)
    }
  }, []) // Sem dependências para evitar re-renders desnecessários

  // Efeito separado para mudanças no filtro da galeria
  useEffect(() => {
    if (galleryCategoryFilter !== null) {
      // Atualizar apenas os dados da galeria, não as estatísticas
      const loadGalleryData = async () => {
        const query = new URLSearchParams()
        if (galleryCategoryFilter) query.set('category', galleryCategoryFilter)
        const galleryResponse = await fetch(`/api/gallery${query.toString() ? `?${query.toString()}` : ''}`, { 
          cache: "no-store", 
          credentials: "same-origin",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        const galleryData = await galleryResponse.json()
        setGalleryImages(galleryData || [])
      }
      loadGalleryData()
    }
  }, [galleryCategoryFilter])

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  // Funções para galeria
  const handleSaveGalleryItem = async (data: any) => {
    try {
      console.log("[DASHBOARD] Salvando imagem da galeria:", data.title, "Editing:", editingItem ? editingItem.id : "novo")
      
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description || "")
      formData.append("category", data.category)

      if (data.image) {
        formData.append("image", data.image)
      }

      if (editingItem) {
        // Atualizar item existente
        console.log("[DASHBOARD] Fazendo PUT para:", `/api/gallery/${editingItem.id}`)
        const response = await fetch(`/api/gallery/${editingItem.id}`, {
          method: "PUT",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        console.log("[DASHBOARD] Resposta PUT galeria:", response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          console.error("[DASHBOARD] Erro ao atualizar imagem:", errorData)
          throw new Error(errorData.error || "Erro ao atualizar imagem")
        }

        const updatedItem = await response.json()
        setGalleryImages((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)))
        toast.success("Imagem atualizada com sucesso!")
        // Atualizar estatísticas diretamente do banco
        refreshStats()
      } else {
        // Criar novo item
        console.log("[DASHBOARD] Fazendo POST para:", "/api/gallery")
        const response = await fetch("/api/gallery", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        console.log("[DASHBOARD] Resposta POST galeria:", response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          console.error("[DASHBOARD] Erro ao adicionar imagem:", errorData)
          throw new Error(errorData.error || "Erro ao adicionar imagem")
        }

        const newItem = await response.json()
        setGalleryImages((prev) => [...prev, newItem])
        toast.success("Imagem adicionada com sucesso!")
        // Atualizar estatísticas diretamente do banco
        refreshStats()
      }

      setEditingItem(null)
    } catch (error: any) {
      console.error("[DASHBOARD] Erro ao salvar imagem:", error)
      toast.error(error.message || "Ocorreu um erro ao salvar a imagem.")
    }
  }

  // Funções para planos
  const handleSavePlan = async (data: any) => {
    try {
      console.log("[DASHBOARD] Salvando plano:", data, "Editing:", editingItem ? editingItem.id : "novo")
      
      if (editingItem) {
        // Atualizar plano existente
        console.log("[DASHBOARD] Fazendo PUT para:", `/api/plans/${editingItem.id}`)
        const response = await fetch(`/api/plans/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(data),
        })

        console.log("[DASHBOARD] Resposta PUT plano:", response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          console.error("[DASHBOARD] Erro ao atualizar plano:", errorData)
          throw new Error(errorData.error || "Erro ao atualizar plano")
        }

        const updatedPlan = await response.json()
        setPlans((prev) => prev.map((plan) => (plan.id === editingItem.id ? updatedPlan : plan)))
        toast.success("Plano atualizado com sucesso!")
        // Atualizar estatísticas diretamente do banco
        refreshStats()
      } else {
        // Criar novo plano
        console.log("[DASHBOARD] Fazendo POST para:", "/api/plans")
        const response = await fetch("/api/plans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(data),
        })

        console.log("[DASHBOARD] Resposta POST plano:", response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          console.error("[DASHBOARD] Erro ao criar plano:", errorData)
          throw new Error(errorData.error || "Erro ao criar plano")
        }

        const newPlan = await response.json()
        setPlans((prev) => [...prev, newPlan])
        toast.success("Plano criado com sucesso!")
        // Atualizar estatísticas diretamente do banco
        refreshStats()
      }

      setEditingItem(null)
    } catch (error: any) {
      console.error("[DASHBOARD] Erro ao salvar plano:", error)
      toast.error(error.message || "Ocorreu um erro ao salvar o plano.")
    }
  }

  // Função para excluir itens
  const handleDeleteItem = async (id: string, type: "gallery" | "plan" | "message") => {
    let itemLabel = type === 'gallery' ? 'imagem' : type === 'plan' ? 'plano' : 'mensagem'
    if (!confirm(`Tem certeza que deseja excluir este(a) ${itemLabel}?`)) return

    try {
      let endpoint = ""

      switch (type) {
        case "gallery":
          endpoint = `/api/gallery/${id}`
          break
        case "plan":
          endpoint = `/api/plans/${id}`
          break
        case "message":
          endpoint = `/api/contact/${id}`
          break
      }

      console.log(`[DASHBOARD] Fazendo DELETE para: ${endpoint}`)
      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      })

      console.log(`[DASHBOARD] Resposta DELETE ${type}:`, response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        console.error(`[DASHBOARD] Erro ao excluir ${type}:`, errorData)
        console.error(`[DASHBOARD] Status da resposta:`, response.status)
        console.error(`[DASHBOARD] Response headers:`, response.headers)
        
        // Mensagens de erro específicas por tipo
        let errorMessage = errorData.error || "Erro desconhecido"
        if (type === "gallery") {
          errorMessage = errorData.error || "Erro ao excluir imagem"
        } else if (type === "plan") {
          errorMessage = errorData.error || "Erro ao excluir plano"
        } else if (type === "message") {
          errorMessage = errorData.error || "Erro ao excluir mensagem"
        }
        
        throw new Error(errorMessage)
      }

      // Atualizar estado após sucesso
      if (type === "gallery") {
        setGalleryImages((prev) => prev.filter((item) => item.id !== id))
        toast.success("Imagem excluída com sucesso!")
        // Atualizar estatísticas diretamente do banco
        refreshStats()
      } else if (type === "plan") {
        setPlans((prev) => prev.filter((plan) => plan.id !== id))
        toast.success("Plano excluído com sucesso!")
        // Atualizar estatísticas diretamente do banco
        refreshStats()
      } else if (type === "message") {
        setMessages((prev) => prev.filter((message) => message.id !== id))
        toast.success("Mensagem excluída com sucesso!")
        // Atualizar estatísticas diretamente do banco
        refreshStats()
      }
    } catch (error: any) {
      console.error(`Erro ao excluir ${type}:`, error)
      toast.error(error.message || `Ocorreu um erro ao excluir o item.`)
    }
  }

  // Função para visualizar mensagem
  const handleViewMessage = async (message: any) => {
    try {
      // Marcar como lida ao visualizar
      const response = await fetch(`/api/contact/${message.id}`)
      if (!response.ok) throw new Error("Erro ao buscar detalhes da mensagem")

      const messageDetails = await response.json()
      setSelectedMessage(messageDetails)
      setMessageModalOpen(true)

      // Atualizar o estado da mensagem para lida
      if (!message.read) {
        setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, read: true } : m)))
        // Atualizar estatísticas diretamente do banco
        refreshStats()
      }
    } catch (error) {
      console.error("Erro ao visualizar mensagem:", error)
      alert("Ocorreu um erro ao carregar os detalhes da mensagem.")
    }
  }

  // Função para alterar senha
  const handleChangePassword = async (data: any) => {
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao alterar senha")
      }

      alert("Senha alterada com sucesso!")
      setChangePasswordModalOpen(false)
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error)
      alert(error.message || "Ocorreu um erro ao alterar a senha.")
    }
  }

  // Função para formatar datas de forma segura
  const formatDate = (dateString: string) => {
    if (!dateString || !isMounted) return "Carregando..."
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Data inválida"
    }
  }

  // Função para formatar tempo de forma segura
  const formatTime = (date: Date | null) => {
    if (!date || !isMounted) return ""
    try {
      return date.toLocaleTimeString()
    } catch (error) {
      return ""
    }
  }

  // Função para filtrar e ordenar mensagens
  const getFilteredAndSortedMessages = () => {
    if (!Array.isArray(messages)) return []
    
    let filteredMessages = [...messages]
    
    // Aplicar filtros
    switch (messageFilter) {
      case 'unread':
        filteredMessages = filteredMessages.filter(m => !m.read)
        break
      case 'read':
        filteredMessages = filteredMessages.filter(m => m.read)
        break
      default:
        // 'all' - não filtrar
        break
    }
    
    // Aplicar ordenação
    switch (messageSort) {
      case 'date-asc':
        filteredMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'date-desc':
        filteredMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'name':
        filteredMessages.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'company':
        filteredMessages.sort((a, b) => (a.company || '').localeCompare(b.company || ''))
        break
      default:
        // 'date-desc' por padrão
        filteredMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }
    
    return filteredMessages
  }

  // Renderizar apenas após montagem para evitar problemas de hidratação
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/images/logo.png" alt="Super Beast" className="h-8 w-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Tempo Real
              </div>
              <Button variant="outline" asChild>
                <Link href="/">Ver Site</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleManualRefresh}
                disabled={directLoading}
                title="Atualizar dados"
                className="hover:bg-gray-100"
              >
                <RefreshCw className={`h-4 w-4 ${directLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Demo Mode */}
        {/* Removed demo mode banner */}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Debug: Mostrar valores atuais dos estados - APENAS EM DESENVOLVIMENTO */}
            {shouldShowDebug() && isMounted && (
              <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono border-l-4 border-orange-500">
                <div className="font-bold text-orange-700 mb-2">🔧 Debug - Estados atuais (Desenvolvimento)</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>totalMessages: <span className="font-mono text-blue-600">{directStats.totalMessages}</span></div>
                  <div>unreadMessages: <span className="font-mono text-blue-600">{directStats.unreadMessages}</span></div>
                  <div>activePlans: <span className="font-mono text-blue-600">{directStats.activePlans}</span></div>
                  <div>galleryImages: <span className="font-mono text-blue-600">{directStats.galleryImages}</span></div>
                  <div>monthlyViews: <span className="font-mono text-blue-600">{directStats.monthlyViews}</span></div>
                  <div>isLoading: <span className="font-mono text-blue-600">{directLoading.toString()}</span></div>
                  <div>messages.length: <span className="font-mono text-blue-600">{Array.isArray(messages) ? messages.length : 'N/A'}</span></div>
                  <div>plans.length: <span className="font-mono text-blue-600">{Array.isArray(plans) ? plans.length : 'N/A'}</span></div>
                  <div>galleryImages.length: <span className="font-mono text-blue-600">{Array.isArray(galleryImages) ? galleryImages.length : 'N/A'}</span></div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <div>lastUpdateTime: {directLastUpdate ? directLastUpdate.toLocaleString() : 'Nunca'}</div>
                  <div>currentTime: {currentTime}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{directStats.totalMessages}</div>
                  <p className="text-xs text-muted-foreground">
                    {directStats.unreadMessages > 0 ? `${directStats.unreadMessages} não lidas` : "Todas lidas"}
                  </p>
                  {isMounted && directLastUpdate && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      Tempo Real: {formatTime(directLastUpdate)}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{directStats.activePlans}</div>
                  <p className="text-xs text-muted-foreground">Planos disponíveis</p>
                  {isMounted && directLastUpdate && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      Tempo Real: {formatTime(directLastUpdate)}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Imagens na Galeria</CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{directStats.galleryImages}</div>
                  <p className="text-xs text-muted-foreground">Imagens publicadas</p>
                  {isMounted && directLastUpdate && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      Tempo Real: {formatTime(directLastUpdate)}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizações Mensais</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{directStats.monthlyViews}</div>
                  <p className="text-xs text-muted-foreground">Atualizadas em tempo real</p>
                  {isMounted && directLastUpdate && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      Tempo Real: {formatTime(directLastUpdate)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mensagens Recentes</CardTitle>
                  <CardDescription>Últimas mensagens recebidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isMounted && Array.isArray(messages) && messages.slice(0, 3).map((message) => (
                      <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{message.name}</p>
                          <p className="text-sm text-gray-600">{message.subject}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(message.created_at)}
                            {!message.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleViewMessage(message)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {isMounted && (!Array.isArray(messages) || messages.length === 0) && (
                      <p className="text-center text-gray-500 py-4">Nenhuma mensagem recebida</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      className="h-20 flex flex-col items-center justify-center gradient-wine-red hover:gradient-wine-red-hover text-white"
                      onClick={() => setGalleryModalOpen(true)}
                    >
                      <Plus className="h-6 w-6 mb-2" />
                      Nova Imagem
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center bg-transparent"
                      onClick={() => setPlanModalOpen(true)}
                    >
                      <Edit className="h-6 w-6 mb-2" />
                      Novo Plano
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center bg-transparent"
                      onClick={() => setActiveTab("messages")}
                    >
                      <MessageSquare className="h-6 w-6 mb-2" />
                      Ver Mensagens
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center bg-transparent"
                      onClick={() => setChangePasswordModalOpen(true)}
                    >
                      <Lock className="h-6 w-6 mb-2" />
                      Alterar Senha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão da Galeria</h2>
              <Button
                className="gradient-wine-red hover:gradient-wine-red-hover text-white"
                onClick={() => {
                  setEditingItem(null)
                  setGalleryModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Imagem
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Filtrar por categoria:</span>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={galleryCategoryFilter || ''}
                      onChange={(e) => {
                        setGalleryPage(1)
                        setGalleryCategoryFilter(e.target.value || null)
                      }}
                    >
                      <option value="">Todas</option>
                      <option value="treino">Treino</option>
                      <option value="desafios">Desafios</option>
                      <option value="equipas">Equipas</option>
                      <option value="confraternizacao">Confraternização</option>
                    </select>
                  </div>
                </div>
                {isLoading ? (
                  <p className="text-center py-8">Carregando imagens...</p>
                ) : !Array.isArray(galleryImages) || galleryImages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma imagem na galeria</h3>
                    <p className="text-gray-500 mb-4">Comece adicionando sua primeira imagem para mostrar os eventos e atividades da Super Beast.</p>
                    <Button
                      className="gradient-wine-red hover:gradient-wine-red-hover text-white"
                      onClick={() => {
                        setEditingItem(null)
                        setGalleryModalOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeira Imagem
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {galleryImages.slice((galleryPage-1)*PAGE_SIZE, galleryPage*PAGE_SIZE).map((image) => (
                      <div key={image.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {image.image_url && image.image_url !== "/placeholder.svg" ? (
                              <img
                                src={image.image_url}
                                alt={image.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{image.title}</h3>
                            <p className="text-sm text-gray-600">Categoria: {image.category}</p>
                            <p className="text-sm text-gray-600 truncate">{image.description}</p>
                            <p className="text-xs text-gray-500">
                              Adicionada em: {formatDate(image.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(image)
                              setGalleryModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteItem(image.id, "gallery")}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {Array.isArray(galleryImages) && galleryImages.length > PAGE_SIZE && (
                      <div className="flex justify-center items-center gap-2 pt-4">
                        <Button variant="outline" size="sm" disabled={galleryPage === 1} onClick={() => setGalleryPage((p) => p - 1)}>
                          Anterior
                        </Button>
                        <span className="text-sm text-gray-600">
                          Página {galleryPage} de {Math.ceil(galleryImages.length / PAGE_SIZE)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={galleryPage >= Math.ceil(galleryImages.length / PAGE_SIZE)}
                          onClick={() => setGalleryPage((p) => p + 1)}
                        >
                          Próxima
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Planos</h2>
              <Button
                className="gradient-wine-red hover:gradient-wine-red-hover text-white"
                onClick={() => {
                  setEditingItem(null)
                  setPlanModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <p className="text-center py-8 col-span-3">Carregando planos...</p>
              ) : !Array.isArray(plans) || plans.length === 0 ? (
                <p className="text-center py-8 col-span-3">Nenhum plano cadastrado</p>
              ) : (
                plans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-red-600">{plan.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      <div className="flex justify-between items-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            plan.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {plan.active ? "Ativo" : "Inativo"}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(plan)
                              setPlanModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteItem(plan.id, "plan")}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mensagens Recebidas</h2>
              <ExportButtons messages={messages} />
            </div>

            {/* Filtros e Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{messages.filter(m => !m.read).length}</div>
                  <p className="text-sm text-gray-600">Não Lidas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{messages.filter(m => m.read).length}</div>
                  <p className="text-sm text-gray-600">Lidas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{messages.length}</div>
                  <p className="text-sm text-gray-600">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {messages.length > 0 ? Math.round((messages.filter(m => !m.read).length / messages.length) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Taxa de Leitura</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Filtrar por:</span>
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={messageFilter || 'all'}
                      onChange={(e) => setMessageFilter(e.target.value)}
                    >
                      <option value="all">Todas as mensagens</option>
                      <option value="unread">Apenas não lidas</option>
                      <option value="read">Apenas lidas</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Ordenar por:</span>
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={messageSort || 'date-desc'}
                      onChange={(e) => setMessageSort(e.target.value)}
                    >
                      <option value="date-desc">Data (mais recente)</option>
                      <option value="date-asc">Data (mais antiga)</option>
                      <option value="name">Nome</option>
                      <option value="company">Empresa</option>
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessageFilter('all')
                      setMessageSort('date-desc')
                    }}
                    className="ml-auto"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                {isLoading ? (
                  <p className="text-center py-8">Carregando mensagens...</p>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                  <p className="text-center py-8">Nenhuma mensagem recebida</p>
                ) : (
                  <div className="space-y-4">
                    {getFilteredAndSortedMessages().map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
                          !message.read 
                            ? "bg-blue-50 border-blue-200 shadow-sm" 
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              {/* Indicador de status de leitura */}
                              <div className={`w-3 h-3 rounded-full mr-3 ${
                                message.read 
                                  ? "bg-green-500" 
                                  : "bg-red-500 animate-pulse"
                              }`}></div>
                              
                              <div>
                                <h3 className={`font-medium ${
                                  !message.read ? "text-blue-900" : "text-gray-900"
                                }`}>
                                  {message.name}
                                  {!message.read && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Nova
                                    </span>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600">{message.email}</p>
                                {message.company && (
                                  <p className="text-sm text-gray-500 font-medium">{message.company}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <p className={`font-medium ${
                                !message.read ? "text-blue-900" : "text-gray-900"
                              }`}>
                                {message.subject}
                              </p>
                              <p className="text-sm text-gray-600 truncate max-w-md">{message.message}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <p className="text-xs text-gray-500">
                                  📅 {formatDate(message.created_at)}
                                </p>
                                {message.read && (
                                  <p className="text-xs text-green-600">
                                    ✅ Lida
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant={!message.read ? "default" : "outline"}
                            onClick={() => handleViewMessage(message)}
                            className={!message.read ? "bg-blue-600 hover:bg-blue-700" : ""}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {!message.read ? "Ver" : "Ver"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteItem(message.id, "message")}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <GalleryModal
        isOpen={galleryModalOpen}
        onClose={() => {
          setGalleryModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSaveGalleryItem}
        editData={editingItem}
      />

      <PlanModal
        isOpen={planModalOpen}
        onClose={() => {
          setPlanModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSavePlan}
        editData={editingItem}
      />

      <MessageModal
        isOpen={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false)
          setSelectedMessage(null)
        }}
        message={selectedMessage}
      />

      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        onSave={handleChangePassword}
      />
    </div>
  )
}
