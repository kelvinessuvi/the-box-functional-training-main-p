"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, MessageSquare, ImageIcon, Package, LogOut, Plus, Edit, Trash2, Eye, Lock, RefreshCw, Users, MapPin } from "lucide-react"
import Link from "next/link"
import { GalleryModal } from "./gallery-modal"
import { PlanModal } from "./plan-modal"
import { MessageModal } from "./message-modal"
import { ChangePasswordModal } from "./change-password-modal"
import { InstructorModal } from "./instructor-modal"
import { BranchModal } from "./branch-modal"
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
  const [instructorModalOpen, setInstructorModalOpen] = useState(false)
  const [branchModalOpen, setBranchModalOpen] = useState(false)
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
  const [modalities, setModalities] = useState<any[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
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
      // Garantir que messages seja sempre um array
      const messagesArray = Array.isArray(messagesData) ? messagesData : (messagesData?.error ? [] : [])
      setMessages(messagesArray)

      // Carregar modalidades
      const modalitiesResponse = await fetch("/api/modalities", { 
        cache: "no-store", 
        credentials: "same-origin",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const modalitiesData = await modalitiesResponse.json()
      setModalities(Array.isArray(modalitiesData) ? modalitiesData : [])

      // Carregar instrutores
      const instructorsResponse = await fetch("/api/instructors", { 
        cache: "no-store", 
        credentials: "same-origin",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const instructorsData = await instructorsResponse.json()
      setInstructors(Array.isArray(instructorsData) ? instructorsData : [])

      // Carregar filiais
      const branchesResponse = await fetch("/api/branches", { 
        cache: "no-store", 
        credentials: "same-origin",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const branchesData = await branchesResponse.json()
      setBranches(Array.isArray(branchesData) ? branchesData : [])

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
        refreshStats()
        await refreshData()
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
        refreshStats()
        await refreshData()
      }

      setEditingItem(null)
    } catch (error: any) {
      console.error("[DASHBOARD] Erro ao salvar imagem:", error)
      toast.error(error.message || "Ocorreu um erro ao salvar a imagem.")
    }
  }

  // Funções para modalidades
  const handleSaveModality = async (data: any) => {
    try {
      console.log("[DASHBOARD] Salvando modalidade:", data, "Editing:", editingItem ? editingItem.id : "novo")
      
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description || "")
      if (data.image) {
        formData.append("image", data.image)
      }
      formData.append("active", data.active ? "true" : "false")
      
      if (editingItem) {
        const response = await fetch(`/api/modalities/${editingItem.id}`, {
          method: "PUT",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao atualizar modalidade")
        }

        const updatedModality = await response.json()
        setModalities((prev) => prev.map((modality: any) => (modality.id === editingItem.id ? updatedModality : modality)))
        toast.success("Modalidade atualizada com sucesso!")
        refreshStats()
        await refreshData()
      } else {
        const response = await fetch("/api/modalities", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao criar modalidade")
        }

        const newModality = await response.json()
        setModalities((prev) => [...prev, newModality])
        toast.success("Modalidade criada com sucesso!")
        refreshStats()
        await refreshData()
      }

      setEditingItem(null)
    } catch (error: any) {
      console.error("[DASHBOARD] Erro ao salvar modalidade:", error)
      toast.error(error.message || "Ocorreu um erro ao salvar a modalidade.")
    }
  }

  // Funções para instrutores
  const handleSaveInstructor = async (data: any) => {
    try {
      console.log("[DASHBOARD] Salvando instrutor:", data, "Editing:", editingItem ? editingItem.id : "novo")
      
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("title", data.title || "")
      formData.append("bio", data.bio || "")
      formData.append("instagram_url", data.instagram_url || "")
      if (data.photo) {
        formData.append("photo", data.photo)
      }
      formData.append("specialties", JSON.stringify(data.specialties || []))
      
      if (editingItem) {
        const response = await fetch(`/api/instructors/${editingItem.id}`, {
          method: "PUT",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao atualizar instrutor")
        }

        const updatedInstructor = await response.json()
        setInstructors((prev) => prev.map((instructor: any) => (instructor.id === editingItem.id ? updatedInstructor : instructor)))
        toast.success("Instrutor atualizado com sucesso!")
        refreshStats()
        await refreshData()
      } else {
        const response = await fetch("/api/instructors", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao criar instrutor")
        }

        const newInstructor = await response.json()
        setInstructors((prev) => [...prev, newInstructor])
        toast.success("Instrutor criado com sucesso!")
        refreshStats()
        await refreshData()
      }

      setEditingItem(null)
    } catch (error: any) {
      console.error("[DASHBOARD] Erro ao salvar instrutor:", error)
      toast.error(error.message || "Ocorreu um erro ao salvar o instrutor.")
    }
  }

  // Funções para filiais
  const handleSaveBranch = async (data: any) => {
    try {
      console.log("[DASHBOARD] Salvando filial:", data, "Editing:", editingItem ? editingItem.id : "novo")
      
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("address", data.address || "")
      formData.append("city", data.city || "")
      formData.append("country", data.country || "Angola")
      formData.append("phone", data.phone || "")
      formData.append("email", data.email || "")
      if (data.image) {
        formData.append("image", data.image)
      }
      
      if (editingItem) {
        const response = await fetch(`/api/branches/${editingItem.id}`, {
          method: "PUT",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao atualizar filial")
        }

        const updatedBranch = await response.json()
        setBranches((prev) => prev.map((branch: any) => (branch.id === editingItem.id ? updatedBranch : branch)))
        toast.success("Filial atualizada com sucesso!")
        refreshStats()
        await refreshData()
      } else {
        const response = await fetch("/api/branches", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao criar filial")
        }

        const newBranch = await response.json()
        setBranches((prev) => [...prev, newBranch])
        toast.success("Filial criada com sucesso!")
        refreshStats()
        await refreshData()
      }

      setEditingItem(null)
    } catch (error: any) {
      console.error("[DASHBOARD] Erro ao salvar filial:", error)
      toast.error(error.message || "Ocorreu um erro ao salvar a filial.")
    }
  }

  // Função para excluir itens
  const handleDeleteItem = async (id: string, type: "gallery" | "modality" | "message" | "instructor" | "branch") => {
    let itemLabel = type === 'gallery' ? 'imagem' : type === 'modality' ? 'modalidade' : type === 'message' ? 'mensagem' : type === 'instructor' ? 'instrutor' : 'filial'
    if (!confirm(`Tem certeza que deseja excluir este(a) ${itemLabel}?`)) return

    try {
      let endpoint = ""

      switch (type) {
        case "gallery":
          endpoint = `/api/gallery/${id}`
          break
        case "modality":
          endpoint = `/api/modalities/${id}`
          break
        case "message":
          endpoint = `/api/contact/${id}`
          break
        case "instructor":
          endpoint = `/api/instructors/${id}`
          break
        case "branch":
          endpoint = `/api/branches/${id}`
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
        } else if (type === "modality") {
          errorMessage = errorData.error || "Erro ao excluir modalidade"
        } else if (type === "message") {
          errorMessage = errorData.error || "Erro ao excluir mensagem"
        } else if (type === "instructor") {
          errorMessage = errorData.error || "Erro ao excluir instrutor"
        } else if (type === "branch") {
          errorMessage = errorData.error || "Erro ao excluir filial"
        }
        
        throw new Error(errorMessage)
      }

      // Atualizar estado após sucesso
      if (type === "gallery") {
        setGalleryImages((prev) => prev.filter((item) => item.id !== id))
        toast.success("Imagem excluída com sucesso!")
        refreshStats()
        await refreshData()
      } else if (type === "modality") {
        setModalities((prev) => prev.filter((modality: any) => modality.id !== id))
        toast.success("Modalidade excluída com sucesso!")
        refreshStats()
        await refreshData()
      } else if (type === "message") {
        setMessages((prev) => prev.filter((message) => message.id !== id))
        toast.success("Mensagem excluída com sucesso!")
        refreshStats()
        await refreshData()
      } else if (type === "instructor") {
        setInstructors((prev) => prev.filter((instructor: any) => instructor.id !== id))
        toast.success("Instrutor excluído com sucesso!")
        refreshStats()
        await refreshData()
      } else if (type === "branch") {
        setBranches((prev) => prev.filter((branch: any) => branch.id !== id))
        toast.success("Filial excluída com sucesso!")
        refreshStats()
        await refreshData()
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#D4AF37] mx-auto"></div>
          <p className="mt-4 text-[#B3B3B3]">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <img src="/images/the-box-logo.svg" alt="THE BOX Functional Training" className="h-12 sm:h-16 md:h-20 w-auto" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Painel Administrativo</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-[#D4AF37]">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                <span>Tempo Real</span>
              </div>
              <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]">
                <Link href="/">Ver Site</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleManualRefresh}
                disabled={directLoading}
                title="Atualizar dados"
                className="hover:bg-[#1A1A1A] text-white h-8 w-8 sm:h-10 sm:w-10"
              >
                <RefreshCw className={`h-4 w-4 ${directLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-[#1A1A1A] text-white h-8 w-8 sm:h-10 sm:w-10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 md:py-8">
        {/* Banner de Demo Mode */}
        {/* Removed demo mode banner */}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-1 sm:gap-2 h-auto bg-[#0A0A0A] border border-[#1A1A1A] overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-2 sm:px-3 md:px-4 min-w-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37] text-[#B3B3B3] hover:text-white">Visão Geral</TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs sm:text-sm py-2 px-2 sm:px-3 md:px-4 min-w-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37] text-[#B3B3B3] hover:text-white">Galeria</TabsTrigger>
            <TabsTrigger value="modalities" className="text-xs sm:text-sm py-2 px-2 sm:px-3 md:px-4 min-w-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37] text-[#B3B3B3] hover:text-white">Modalidades</TabsTrigger>
            <TabsTrigger value="instructors" className="text-xs sm:text-sm py-2 px-2 sm:px-3 md:px-4 min-w-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37] text-[#B3B3B3] hover:text-white">Instrutores</TabsTrigger>
            <TabsTrigger value="branches" className="text-xs sm:text-sm py-2 px-2 sm:px-3 md:px-4 min-w-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37] text-[#B3B3B3] hover:text-white">Filiais</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs sm:text-sm py-2 px-2 sm:px-3 md:px-4 min-w-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37] text-[#B3B3B3] hover:text-white">Mensagens</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm py-2 px-2 sm:px-3 md:px-4 min-w-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37] text-[#B3B3B3] hover:text-white">Usuários</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm py-2 px-2 sm:px-3 md:px-4 min-w-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#D4AF37] text-[#B3B3B3] hover:text-white">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Debug: Mostrar valores atuais dos estados - APENAS EM DESENVOLVIMENTO */}
            {shouldShowDebug() && isMounted && (
              <div className="bg-[#0A0A0A] border-t border-r border-b border-[#1A1A1A] p-4 rounded-lg text-xs font-mono border-l-4 border-l-[#D4AF37]">
                <div className="font-bold text-[#D4AF37] mb-2">🔧 Debug - Estados atuais (Desenvolvimento)</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-white">totalMessages: <span className="font-mono text-[#D4AF37]">{directStats.totalMessages}</span></div>
                  <div className="text-white">unreadMessages: <span className="font-mono text-[#D4AF37]">{directStats.unreadMessages}</span></div>
                  <div className="text-white">activePlans: <span className="font-mono text-[#D4AF37]">{directStats.activePlans}</span></div>
                  <div className="text-white">galleryImages: <span className="font-mono text-[#D4AF37]">{directStats.galleryImages}</span></div>
                  <div className="text-white">monthlyViews: <span className="font-mono text-[#D4AF37]">{directStats.monthlyViews}</span></div>
                  <div className="text-white">isLoading: <span className="font-mono text-[#D4AF37]">{directLoading.toString()}</span></div>
                  <div className="text-white">messages.length: <span className="font-mono text-[#D4AF37]">{Array.isArray(messages) ? messages.length : 'N/A'}</span></div>
                  <div className="text-white">modalities.length: <span className="font-mono text-[#D4AF37]">{Array.isArray(modalities) ? modalities.length : 'N/A'}</span></div>
                  <div className="text-white">instructors.length: <span className="font-mono text-[#D4AF37]">{Array.isArray(instructors) ? instructors.length : 'N/A'}</span></div>
                  <div className="text-white">branches.length: <span className="font-mono text-[#D4AF37]">{Array.isArray(branches) ? branches.length : 'N/A'}</span></div>
                  <div className="text-white">galleryImages.length: <span className="font-mono text-[#D4AF37]">{Array.isArray(galleryImages) ? galleryImages.length : 'N/A'}</span></div>
                </div>
                <div className="mt-2 text-xs text-[#B3B3B3]">
                  <div>lastUpdateTime: {directLastUpdate ? directLastUpdate.toLocaleString() : 'Nunca'}</div>
                  <div>currentTime: {currentTime}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              <div className="min-w-0">
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total de Mensagens</CardTitle>
                  <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{directStats.totalMessages}</div>
                  <p className="text-xs text-[#B3B3B3]">
                    {directStats.unreadMessages > 0 ? `${directStats.unreadMessages} não lidas` : "Todas lidas"}
                  </p>
                  {isMounted && directLastUpdate && (
                    <p className="text-xs text-[#D4AF37] mt-1 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></div>
                      Tempo Real: {formatTime(directLastUpdate)}
                    </p>
                  )}
                </CardContent>
              </Card>
              </div>

              <div className="min-w-0">
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Modalidades Ativas</CardTitle>
                  <Package className="h-4 w-4 text-[#D4AF37]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {Array.isArray(modalities) ? modalities.filter(m => m.active).length : directStats.activePlans || 0}
                    </div>
                    <p className="text-xs text-[#B3B3B3]">Modalidades disponíveis</p>
                  {isMounted && directLastUpdate && (
                      <p className="text-xs text-[#D4AF37] mt-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></div>
                      Tempo Real: {formatTime(directLastUpdate)}
                    </p>
                  )}
                </CardContent>
              </Card>
              </div>

              <div className="min-w-0">
                <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Imagens na Galeria</CardTitle>
                    <ImageIcon className="h-4 w-4 text-[#D4AF37]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {Array.isArray(galleryImages) ? galleryImages.length : directStats.galleryImages || 0}
                    </div>
                    <p className="text-xs text-[#B3B3B3]">Imagens publicadas</p>
                  {isMounted && directLastUpdate && (
                      <p className="text-xs text-[#D4AF37] mt-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></div>
                      Tempo Real: {formatTime(directLastUpdate)}
                    </p>
                  )}
                </CardContent>
              </Card>
              </div>

              <div className="min-w-0">
                <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Instrutores Ativos</CardTitle>
                    <Users className="h-4 w-4 text-[#D4AF37]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{Array.isArray(instructors) ? instructors.filter(i => i.active).length : 0}</div>
                    <p className="text-xs text-[#B3B3B3]">Instrutores cadastrados</p>
                </CardContent>
              </Card>
              </div>

              <div className="min-w-0">
                <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Filiais Ativas</CardTitle>
                    <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{Array.isArray(branches) ? branches.filter(b => b.active).length : 0}</div>
                    <p className="text-xs text-[#B3B3B3]">Filiais cadastradas</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="text-white">Mensagens Recentes</CardTitle>
                  <CardDescription className="text-[#B3B3B3]">Últimas mensagens recebidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isMounted && Array.isArray(messages) && messages.slice(0, 3).map((message) => (
                      <div key={message.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 bg-[#1A1A1A] rounded-lg border border-[#1A1A1A] hover:border-[#D4AF37] transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate text-white">{message.name}</p>
                          <p className="text-xs sm:text-sm text-[#B3B3B3] truncate">{message.subject}</p>
                          <p className="text-xs text-[#B3B3B3] flex items-center gap-2 mt-1">
                            <span>{formatDate(message.created_at)}</span>
                            {!message.read && (
                              <span className="inline-block w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0"></span>
                            )}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleViewMessage(message)} className="w-full sm:w-auto border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]">
                          <Eye className="h-4 w-4 mr-1 sm:mr-0" />
                          <span className="sm:hidden">Ver</span>
                        </Button>
                      </div>
                    ))}
                    {isMounted && (!Array.isArray(messages) || messages.length === 0) && (
                      <p className="text-center text-[#B3B3B3] py-4">Nenhuma mensagem recebida</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="text-white">Ações Rápidas</CardTitle>
                  <CardDescription className="text-[#B3B3B3]">Acesso rápido às funcionalidades principais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    <Button
                      className="h-16 sm:h-20 flex flex-col items-center justify-center bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold text-xs sm:text-sm"
                      onClick={() => setGalleryModalOpen(true)}
                    >
                      <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-center leading-tight">Nova Imagem</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex flex-col items-center justify-center bg-transparent text-white text-xs sm:text-sm border-[#1A1A1A] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      onClick={() => setActiveTab("modalities")}
                    >
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-center leading-tight">Nova Modalidade</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex flex-col items-center justify-center bg-transparent text-white text-xs sm:text-sm border-[#1A1A1A] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      onClick={() => setActiveTab("instructors")}
                    >
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-center leading-tight">Novo Instrutor</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex flex-col items-center justify-center bg-transparent text-white text-xs sm:text-sm border-[#1A1A1A] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      onClick={() => setActiveTab("branches")}
                    >
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-center leading-tight">Nova Filial</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex flex-col items-center justify-center bg-transparent text-white text-xs sm:text-sm border-[#1A1A1A] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      onClick={() => setActiveTab("messages")}
                    >
                      <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-center leading-tight">Ver Mensagens</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex flex-col items-center justify-center bg-transparent text-white text-xs sm:text-sm border-[#1A1A1A] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      onClick={() => setChangePasswordModalOpen(true)}
                    >
                      <Lock className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-center leading-tight">Alterar Senha</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Gestão da Galeria</h2>
              <Button
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold text-sm sm:text-base w-full sm:w-auto"
                onClick={() => {
                  setEditingItem(null)
                  setGalleryModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Imagem
              </Button>
            </div>

            <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs sm:text-sm text-[#B3B3B3]">Filtrar por categoria:</span>
                    <select
                      className="border border-[#1A1A1A] rounded px-2 py-1.5 text-sm w-full sm:w-auto bg-[#1A1A1A] text-white"
                      value={galleryCategoryFilter || ''}
                      onChange={(e) => {
                        setGalleryPage(1)
                        setGalleryCategoryFilter(e.target.value || null)
                      }}
                    >
                      <option value="">Todas</option>
                      <option value="instrutores">Instrutores</option>
                      <option value="aulas">Aulas</option>
                      <option value="eventos">Eventos</option>
                    </select>
                  </div>
                </div>
                {isLoading ? (
                  <p className="text-center py-8 text-[#B3B3B3]">Carregando imagens...</p>
                ) : !Array.isArray(galleryImages) || galleryImages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="h-12 w-12 text-[#B3B3B3] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Nenhuma imagem na galeria</h3>
                    <p className="text-[#B3B3B3] mb-4">Comece adicionando sua primeira imagem para mostrar os eventos e atividades da THE BOX.</p>
                    <Button
                      className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
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
                  <div className="space-y-3 sm:space-y-4">
                    {galleryImages.slice((galleryPage-1)*PAGE_SIZE, galleryPage*PAGE_SIZE).map((image) => (
                      <div key={image.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 border border-[#1A1A1A] rounded-lg bg-[#1A1A1A] hover:border-[#D4AF37] transition-colors">
                        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0A0A0A] rounded-lg overflow-hidden flex-shrink-0 border border-[#1A1A1A]">
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
                              <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A]">
                                <ImageIcon className="h-6 w-6 text-[#B3B3B3]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm sm:text-base truncate text-white">{image.title}</h3>
                            <p className="text-xs sm:text-sm text-[#B3B3B3]">Categoria: {image.category}</p>
                            <p className="text-xs sm:text-sm text-[#B3B3B3] truncate">{image.description}</p>
                            <p className="text-xs text-[#B3B3B3]">
                              Adicionada em: {formatDate(image.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0 justify-end sm:justify-start">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(image)
                              setGalleryModalOpen(true)
                            }}
                            className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteItem(image.id, "gallery")} className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {Array.isArray(galleryImages) && galleryImages.length > PAGE_SIZE && (
                      <div className="flex justify-center items-center gap-2 pt-4">
                        <Button variant="outline" size="sm" disabled={galleryPage === 1} onClick={() => setGalleryPage((p) => p - 1)} className="border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]">
                          Anterior
                        </Button>
                        <span className="text-sm text-[#B3B3B3]">
                          Página {galleryPage} de {Math.ceil(galleryImages.length / PAGE_SIZE)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={galleryPage >= Math.ceil(galleryImages.length / PAGE_SIZE)}
                          onClick={() => setGalleryPage((p) => p + 1)}
                          className="border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
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

          <TabsContent value="modalities" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Gestão de Modalidades</h2>
              <Button
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold text-sm sm:text-base w-full sm:w-auto"
                onClick={() => {
                  setEditingItem(null)
                  setPlanModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Modalidade
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {isLoading ? (
                <p className="text-center py-8 col-span-3 text-[#B3B3B3]">Carregando modalidades...</p>
              ) : !Array.isArray(modalities) || modalities.length === 0 ? (
                <p className="text-center py-8 col-span-3 text-[#B3B3B3]">Nenhuma modalidade cadastrada</p>
              ) : (
                modalities.map((modality) => (
                  <Card key={modality.id} className="bg-[#0A0A0A] border-[#1A1A1A]">
                    <CardHeader>
                      <CardTitle className="text-white">{modality.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[#B3B3B3] mb-4">{modality.description}</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                        <span
                          className={`px-2 py-1 rounded-full text-xs w-fit ${
                            modality.active ? "bg-[#1A1A1A] text-[#D4AF37] border border-[#D4AF37]" : "bg-[#1A1A1A] text-[#B3B3B3] border border-[#1A1A1A]"
                          }`}
                        >
                          {modality.active ? "Ativa" : "Inativa"}
                        </span>
                        <div className="flex space-x-2 justify-end sm:justify-start">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(modality)
                              setPlanModalOpen(true)
                            }}
                            className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteItem(modality.id, "modality")} className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="instructors" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Gestão de Instrutores</h2>
              <Button
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold text-sm sm:text-base w-full sm:w-auto"
                onClick={() => {
                  setEditingItem(null)
                  setInstructorModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Instrutor
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {isLoading ? (
                <p className="text-center py-8 col-span-full text-[#B3B3B3]">Carregando instrutores...</p>
              ) : !Array.isArray(instructors) || instructors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="h-12 w-12 text-[#B3B3B3] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum instrutor cadastrado</h3>
                  <p className="text-[#B3B3B3] mb-4">Comece adicionando seu primeiro instrutor à THE BOX.</p>
                  <Button
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
                    onClick={() => {
                      setEditingItem(null)
                      setInstructorModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Instrutor
                  </Button>
                </div>
              ) : (
                instructors.map((instructor) => (
                  <Card key={instructor.id} className="bg-[#0A0A0A] border-[#1A1A1A]">
                    <CardHeader>
                      {instructor.photo_url && (
                        <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#D4AF37] bg-[#1A1A1A]">
                          <img
                            src={instructor.photo_url}
                            alt={instructor.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <CardTitle className="text-white text-center">{instructor.name}</CardTitle>
                      <CardDescription className="text-[#D4AF37] text-center">{instructor.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {instructor.bio && (
                        <p className="text-sm text-[#B3B3B3] mb-4 line-clamp-3">{instructor.bio}</p>
                      )}
                      {instructor.specialties && Array.isArray(instructor.specialties) && instructor.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {instructor.specialties.map((specialty: string, idx: number) => (
                            <span key={idx} className="bg-[#1A1A1A] text-[#B3B3B3] text-xs px-2 py-1 rounded-full border border-[#1A1A1A]">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                        <span
                          className={`px-2 py-1 rounded-full text-xs w-fit ${
                            instructor.active ? "bg-[#1A1A1A] text-[#D4AF37] border border-[#D4AF37]" : "bg-[#1A1A1A] text-[#B3B3B3] border border-[#1A1A1A]"
                          }`}
                        >
                          {instructor.active ? "Ativo" : "Inativo"}
                        </span>
                        <div className="flex space-x-2 justify-end sm:justify-start">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(instructor)
                              setInstructorModalOpen(true)
                            }}
                            className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteItem(instructor.id, "instructor")} className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="branches" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Gestão de Filiais</h2>
              <Button
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold text-sm sm:text-base w-full sm:w-auto"
                onClick={() => {
                  setEditingItem(null)
                  setBranchModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Filial
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {isLoading ? (
                <p className="text-center py-8 col-span-full text-[#B3B3B3]">Carregando filiais...</p>
              ) : !Array.isArray(branches) || branches.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <MapPin className="h-12 w-12 text-[#B3B3B3] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhuma filial cadastrada</h3>
                  <p className="text-[#B3B3B3] mb-4">Comece adicionando sua primeira filial da THE BOX.</p>
                  <Button
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
                    onClick={() => {
                      setEditingItem(null)
                      setBranchModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Filial
                  </Button>
                </div>
              ) : (
                branches.map((branch) => (
                  <Card key={branch.id} className="bg-[#0A0A0A] border-[#1A1A1A]">
                    <CardHeader>
                      {branch.image_url && (
                        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border border-[#1A1A1A]">
                          <img
                            src={branch.image_url}
                            alt={branch.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <CardTitle className="text-white">{branch.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[#B3B3B3] mb-2">{branch.address}</p>
                      <p className="text-sm text-[#B3B3B3] mb-2">{branch.city}, {branch.country}</p>
                      {branch.phone && (
                        <p className="text-xs text-[#B3B3B3] mb-1">📞 {branch.phone}</p>
                      )}
                      {branch.email && (
                        <p className="text-xs text-[#B3B3B3] mb-4">✉️ {branch.email}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                        <span
                          className={`px-2 py-1 rounded-full text-xs w-fit ${
                            branch.active ? "bg-[#1A1A1A] text-[#D4AF37] border border-[#D4AF37]" : "bg-[#1A1A1A] text-[#B3B3B3] border border-[#1A1A1A]"
                          }`}
                        >
                          {branch.active ? "Ativa" : "Inativa"}
                        </span>
                        <div className="flex space-x-2 justify-end sm:justify-start">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(branch)
                              setBranchModalOpen(true)
                            }}
                            className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteItem(branch.id, "branch")} className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Mensagens Recebidas</h2>
              <div className="w-full sm:w-auto">
                <ExportButtons messages={messages} />
              </div>
            </div>

            {/* Filtros e Estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#D4AF37]">
                    {Array.isArray(messages) ? messages.filter(m => !m.read).length : 0}
                  </div>
                  <p className="text-sm text-[#B3B3B3]">Não Lidas</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#D4AF37]">
                    {Array.isArray(messages) ? messages.filter(m => m.read).length : 0}
                  </div>
                  <p className="text-sm text-[#B3B3B3]">Lidas</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {Array.isArray(messages) ? messages.length : 0}
                  </div>
                  <p className="text-sm text-[#B3B3B3]">Total</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#D4AF37]">
                    {Array.isArray(messages) && messages.length > 0 
                      ? Math.round((messages.filter(m => !m.read).length / messages.length) * 100) 
                      : 0}%
                  </div>
                  <p className="text-sm text-[#B3B3B3]">Taxa de Leitura</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros */}
            <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap text-white">Filtrar por:</span>
                    <select
                      className="border border-[#1A1A1A] rounded px-3 py-2 text-sm w-full sm:w-auto flex-1 sm:flex-initial bg-[#1A1A1A] text-white"
                      value={messageFilter || 'all'}
                      onChange={(e) => setMessageFilter(e.target.value)}
                    >
                      <option value="all">Todas as mensagens</option>
                      <option value="unread">Apenas não lidas</option>
                      <option value="read">Apenas lidas</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap text-white">Ordenar por:</span>
                    <select
                      className="border border-[#1A1A1A] rounded px-3 py-2 text-sm w-full sm:w-auto flex-1 sm:flex-initial bg-[#1A1A1A] text-white"
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
                    className="w-full sm:w-auto sm:ml-auto border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
              <CardContent className="p-3 sm:p-4 md:p-6">
                {isLoading ? (
                  <p className="text-center py-8 text-[#B3B3B3]">Carregando mensagens...</p>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                  <p className="text-center py-8 text-[#B3B3B3]">Nenhuma mensagem recebida</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {getFilteredAndSortedMessages().map((message) => (
                      <div
                        key={message.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg transition-all duration-200 ${
                          !message.read 
                            ? "bg-[#1A1A1A] border-[#D4AF37]" 
                            : "bg-[#1A1A1A] border-[#1A1A1A] hover:border-[#D4AF37]"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                              {/* Indicador de status de leitura */}
                              <div className={`w-3 h-3 rounded-full mr-3 ${
                                message.read 
                                  ? "bg-[#D4AF37]" 
                                  : "bg-[#D4AF37] animate-pulse"
                              }`}></div>
                              
                              <div className="min-w-0 flex-1">
                                <h3 className={`font-medium text-sm sm:text-base ${
                                  !message.read ? "text-[#D4AF37]" : "text-white"
                                }`}>
                                  {message.name}
                                  {!message.read && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#1A1A1A] border border-[#D4AF37] text-[#D4AF37]">
                                      Nova
                                    </span>
                                  )}
                                </h3>
                                <p className="text-xs sm:text-sm text-[#B3B3B3] truncate">{message.email}</p>
                                {message.company && (
                                  <p className="text-xs sm:text-sm text-[#B3B3B3] font-medium truncate">{message.company}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm sm:text-base ${
                                !message.read ? "text-[#D4AF37]" : "text-white"
                              }`}>
                                {message.subject}
                              </p>
                              <p className="text-xs sm:text-sm text-[#B3B3B3] truncate">{message.message}</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                                <p className="text-xs text-[#B3B3B3]">
                                  📅 {formatDate(message.created_at)}
                                </p>
                                {message.read && (
                                  <p className="text-xs text-[#D4AF37]">
                                    ✅ Lida
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 justify-end sm:justify-start flex-shrink-0">
                          <Button 
                            size="sm" 
                            variant={!message.read ? "default" : "outline"}
                            onClick={() => handleViewMessage(message)}
                            className={`h-8 sm:h-9 ${!message.read ? "bg-[#D4AF37] hover:bg-[#B8941F] text-black" : "border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"}`}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Ver</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteItem(message.id, "message")}
                            className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-red-500 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
        onSave={handleSaveModality}
        editData={editingItem}
      />

      <InstructorModal
        isOpen={instructorModalOpen}
        onClose={() => {
          setInstructorModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSaveInstructor}
        editData={editingItem}
      />

      <BranchModal
        isOpen={branchModalOpen}
        onClose={() => {
          setBranchModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSaveBranch}
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
