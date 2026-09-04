"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// Tabs removed - using sidebar navigation instead
import { BarChart3, MessageSquare, ImageIcon, Package, LogOut, Plus, Edit, Trash2, Eye, Lock, RefreshCw, Users, MapPin, Handshake, GripVertical, Crown } from "lucide-react"
import Link from "next/link"
import { AdminSidebar } from "./admin-sidebar"
import { GalleryModal } from "./gallery-modal"
import { PlanModal } from "./plan-modal"
import { MessageModal } from "./message-modal"
import { ChangePasswordModal } from "./change-password-modal"
import { InstructorModal } from "./instructor-modal"
import { BranchModal } from "./branch-modal"
import { PartnerModal } from "./partner-modal"
import { FounderModal } from "./founder-modal"
import SettingsTab from "./settings-tab"
import ProductsTab from "./products-tab"
import ExportButtons from "./export-buttons"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { shouldShowDebug } from "@/config/debug"
import { useDirectDatabase } from "@/hooks/use-direct-database"
import { UserManagement } from "./user-management"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)
  const [instructorModalOpen, setInstructorModalOpen] = useState(false)
  const [branchModalOpen, setBranchModalOpen] = useState(false)
  const [partnerModalOpen, setPartnerModalOpen] = useState(false)
  const [founderModalOpen, setFounderModalOpen] = useState(false)
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
  const [partners, setPartners] = useState<any[]>([])
  const [founders, setFounders] = useState<any[]>([])
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

      // Carregar parceiros
      const partnersResponse = await fetch("/api/partners", { 
        cache: "no-store", 
        credentials: "same-origin",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const partnersData = await partnersResponse.json()
      setPartners(Array.isArray(partnersData) ? partnersData : [])

      // Carregar fundadores
      const foundersResponse = await fetch("/api/founders", { 
        cache: "no-store", 
        credentials: "same-origin",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      const foundersData = await foundersResponse.json()
      setFounders(Array.isArray(foundersData) ? foundersData : [])

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

  // Funções para parceiros
  const handleSavePartner = async (data: any) => {
    try {
      console.log("[DASHBOARD] Salvando parceiro:", data, "Editing:", editingItem ? editingItem.id : "novo")
      
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description || "")
      formData.append("website_url", data.website_url || "")
      formData.append("active", data.active ? "true" : "false")
      if (data.logo) {
        formData.append("logo", data.logo)
      }
      if (data.removeLogo) {
        formData.append("removeLogo", "true")
      } else if (editingItem && !data.logo) {
        formData.append("keepCurrentLogo", "true")
      }
      
      if (editingItem) {
        const response = await fetch(`/api/partners/${editingItem.id}`, {
          method: "PUT",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao atualizar parceiro")
        }

        const updatedPartner = await response.json()
        setPartners((prev) => prev.map((partner: any) => (partner.id === editingItem.id ? updatedPartner : partner)))
        toast.success("Parceiro atualizado com sucesso!")
        refreshStats()
        await refreshData()
      } else {
        const response = await fetch("/api/partners", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao criar parceiro")
        }

        const newPartner = await response.json()
        setPartners((prev) => [...prev, newPartner])
        toast.success("Parceiro criado com sucesso!")
        refreshStats()
        await refreshData()
      }

      setEditingItem(null)
    } catch (error: any) {
      console.error("[DASHBOARD] Erro ao salvar parceiro:", error)
      toast.error(error.message || "Ocorreu um erro ao salvar o parceiro.")
    }
  }

  // Funções para fundadores
  const handleSaveFounder = async (data: any) => {
    try {
      console.log("[DASHBOARD] Salvando fundador:", data, "Editing:", editingItem ? editingItem.id : "novo")
      
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("full_name", data.full_name || "")
      formData.append("role", data.role || "Co-Fundador")
      if (data.photo) {
        formData.append("photo", data.photo)
      }
      if (data.removePhoto) {
        formData.append("removePhoto", "true")
      } else if (editingItem && !data.photo) {
        formData.append("keepCurrentPhoto", "true")
      }
      
      if (editingItem) {
        const response = await fetch(`/api/founders/${editingItem.id}`, {
          method: "PUT",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao atualizar fundador")
        }

        const updatedFounder = await response.json()
        setFounders((prev) => prev.map((founder: any) => (founder.id === editingItem.id ? updatedFounder : founder)))
        toast.success("Fundador atualizado com sucesso!")
        await refreshData()
      } else {
        const response = await fetch("/api/founders", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
          throw new Error(errorData.error || "Erro ao criar fundador")
        }

        const newFounder = await response.json()
        setFounders((prev) => [...prev, newFounder])
        toast.success("Fundador criado com sucesso!")
        await refreshData()
      }

      setEditingItem(null)
    } catch (error: any) {
      console.error("[DASHBOARD] Erro ao salvar fundador:", error)
      toast.error(error.message || "Ocorreu um erro ao salvar o fundador.")
    }
  }

  const handleDeleteFounder = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este fundador?")) return

    try {
      const response = await fetch(`/api/founders/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        throw new Error(errorData.error || "Erro ao excluir fundador")
      }

      setFounders((prev) => prev.filter((founder: any) => founder.id !== id))
      toast.success("Fundador excluído com sucesso!")
      await refreshData()
    } catch (error: any) {
      console.error("[DASHBOARD] Erro ao excluir fundador:", error)
      toast.error(error.message || "Ocorreu um erro ao excluir o fundador.")
    }
  }

  // Função para reordenar instrutores com drag and drop
  const handleReorderInstructors = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = instructors.findIndex((i: any) => i.id === active.id)
      const newIndex = instructors.findIndex((i: any) => i.id === over.id)

      const newOrder = arrayMove(instructors, oldIndex, newIndex)
      setInstructors(newOrder)

      // Salvar a nova ordem no backend
      try {
        const response = await fetch("/api/instructors/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds: newOrder.map((i: any) => i.id) }),
          credentials: "same-origin",
        })

        if (!response.ok) {
          throw new Error("Falha ao salvar a ordem")
        }

        toast.success("Ordem dos instrutores atualizada!")
      } catch (error) {
        console.error("[DASHBOARD] Erro ao reordenar:", error)
        toast.error("Erro ao salvar a nova ordem")
        // Reverter a mudança em caso de erro
        await refreshData()
      }
    }
  }

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Função para excluir itens
  const handleDeleteItem = async (id: string, type: "gallery" | "modality" | "message" | "instructor" | "branch" | "partner") => {
    let itemLabel = type === 'gallery' ? 'imagem' : type === 'modality' ? 'modalidade' : type === 'message' ? 'mensagem' : type === 'instructor' ? 'instrutor' : type === 'branch' ? 'filial' : 'parceiro'
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
        case "partner":
          endpoint = `/api/partners/${id}`
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
        } else if (type === "partner") {
          errorMessage = errorData.error || "Erro ao excluir parceiro"
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
      } else if (type === "partner") {
        setPartners((prev) => prev.filter((partner: any) => partner.id !== id))
        toast.success("Parceiro excluído com sucesso!")
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
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onRefresh={handleManualRefresh}
        isRefreshing={directLoading}
        unreadMessages={directStats.unreadMessages}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
      {/* Header */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-[#1A1A1A]">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 pl-12 lg:pl-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {activeTab === "overview" && "Visão Geral"}
                {activeTab === "gallery" && "Galeria"}
                {activeTab === "modalities" && "Modalidades"}
                {activeTab === "instructors" && "Instrutores"}
                {activeTab === "branches" && "Filiais"}
                {activeTab === "products" && "Produtos"}
                {activeTab === "partners" && "Parceiros"}
                {activeTab === "messages" && "Mensagens"}
                {activeTab === "users" && "Usuários"}
                {activeTab === "settings" && "Configurações"}
              </h1>
            </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-[#D4AF37]">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                <span>Tempo Real</span>
          </div>
        </div>
      </header>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Overview Content */}
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
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
            </div>
          )}

          {/* Gallery Content */}
          {activeTab === "gallery" && (
            <div className="space-y-4 sm:space-y-6">
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
            </div>
          )}

          {/* Modalities Content */}
          {activeTab === "modalities" && (
            <div className="space-y-4 sm:space-y-6">
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
            </div>
          )}

          {/* Instructors Content */}
          {activeTab === "instructors" && (
            <div className="space-y-4 sm:space-y-6">
            {/* Seção de Fundadores */}
            <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-[#D4AF37]" />
                    <CardTitle className="text-white">Fundadores</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
                    onClick={() => {
                      setEditingItem(null)
                      setFounderModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Fundador
                  </Button>
                </div>
                <CardDescription className="text-[#B3B3B3]">
                  Gerencie as fotos e informações dos fundadores que aparecem na seção "Quem Somos"
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-4 text-[#B3B3B3]">Carregando fundadores...</p>
                ) : !Array.isArray(founders) || founders.length === 0 ? (
                  <p className="text-center py-4 text-[#B3B3B3]">Nenhum fundador cadastrado</p>
                ) : (
                  <div className="flex flex-wrap justify-center gap-6">
                    {founders.map((founder: any) => (
                      <div key={founder.id} className="text-center group">
                        <div className="relative mb-3">
                          {/* Foto */}
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37]/50 group-hover:border-[#D4AF37] transition-all">
                            {founder.photo_url ? (
                              <img
                                src={founder.photo_url}
                                alt={founder.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#B8960C] flex items-center justify-center">
                                <span className="text-2xl sm:text-3xl font-bold text-black">
                                  {founder.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Botões de ação */}
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingItem(founder)
                                setFounderModalOpen(true)
                              }}
                              className="h-7 w-7 p-0 bg-[#0A0A0A] border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteFounder(founder.id)}
                              className="h-7 w-7 p-0 bg-[#0A0A0A] border-[#1A1A1A] text-white hover:border-red-500 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <h4 className="text-sm sm:text-base font-bold text-white">{founder.name}</h4>
                        <p className="text-[#D4AF37] text-xs font-medium">{founder.role}</p>
                        {!founder.photo_url && (
                          <p className="text-[10px] text-[#B3B3B3] mt-1">Sem foto</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seção de Instrutores */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Gestão de Instrutores</h2>
                <p className="text-xs text-[#B3B3B3] mt-1">Arraste os cards para reordenar a exibição</p>
              </div>
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

            {isLoading ? (
              <p className="text-center py-8 text-[#B3B3B3]">Carregando instrutores...</p>
            ) : !Array.isArray(instructors) || instructors.length === 0 ? (
              <div className="text-center py-12">
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleReorderInstructors}
              >
                <SortableContext
                  items={instructors.map((i: any) => i.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {instructors.map((instructor: any) => (
                      <SortableInstructorCard
                        key={instructor.id}
                        instructor={instructor}
                        onEdit={(inst) => {
                          setEditingItem(inst)
                          setInstructorModalOpen(true)
                        }}
                        onDelete={(id) => handleDeleteItem(id, "instructor")}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            </div>
          )}

          {/* Branches Content */}
          {activeTab === "branches" && (
            <div className="space-y-4 sm:space-y-6">
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
            </div>
          )}

          {/* Products Content */}
          {activeTab === "products" && (
            <ProductsTab />
          )}

          {/* Partners Content */}
          {activeTab === "partners" && (
            <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Gestão de Parceiros</h2>
              <Button
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold text-sm sm:text-base w-full sm:w-auto"
                onClick={() => {
                  setEditingItem(null)
                  setPartnerModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Parceiro
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {isLoading ? (
                <p className="text-center py-8 col-span-full text-[#B3B3B3]">Carregando parceiros...</p>
              ) : !Array.isArray(partners) || partners.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Handshake className="h-12 w-12 text-[#B3B3B3] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum parceiro cadastrado</h3>
                  <p className="text-[#B3B3B3] mb-4">Comece adicionando seu primeiro parceiro.</p>
                  <Button
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
                    onClick={() => {
                      setEditingItem(null)
                      setPartnerModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Parceiro
                  </Button>
                </div>
              ) : (
                partners.map((partner) => (
                  <Card key={partner.id} className="bg-[#0A0A0A] border-[#1A1A1A]">
                    <CardHeader>
                      {partner.logo_url && (
                        <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden bg-white flex items-center justify-center p-4">
                          <img
                            src={partner.logo_url}
                            alt={partner.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <CardTitle className="text-white">{partner.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {partner.description && (
                        <p className="text-sm text-[#B3B3B3] mb-2 line-clamp-2">{partner.description}</p>
                      )}
                      {partner.website_url && (
                        <a 
                          href={partner.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-[#D4AF37] hover:underline mb-4 block truncate"
                        >
                          {partner.website_url}
                        </a>
                      )}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mt-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs w-fit ${
                            partner.active ? "bg-[#1A1A1A] text-[#D4AF37] border border-[#D4AF37]" : "bg-[#1A1A1A] text-[#B3B3B3] border border-[#1A1A1A]"
                          }`}
                        >
                          {partner.active ? "Ativo" : "Inativo"}
                        </span>
                        <div className="flex space-x-2 justify-end sm:justify-start">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(partner)
                              setPartnerModalOpen(true)
                            }}
                            className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteItem(partner.id, "partner")} className="h-8 sm:h-9 border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            </div>
          )}

          {/* Messages Content */}
          {activeTab === "messages" && (
            <div className="space-y-4 sm:space-y-6">
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
            </div>
          )}

          {/* Settings Content */}
          {activeTab === "settings" && (
            <div className="space-y-6">
            <SettingsTab />
            </div>
          )}

          {/* Users Content */}
          {activeTab === "users" && (
            <div className="space-y-6">
            <UserManagement />
      </div>
          )}
        </div>
      </main>

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

      <PartnerModal
        isOpen={partnerModalOpen}
        onClose={() => {
          setPartnerModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSavePartner}
        editData={editingItem}
      />

      <FounderModal
        isOpen={founderModalOpen}
        onClose={() => {
          setFounderModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSaveFounder}
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

// Componente para card de instrutor arrastável
function SortableInstructorCard({ 
  instructor, 
  onEdit, 
  onDelete 
}: { 
  instructor: any
  onEdit: (instructor: any) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: instructor.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-[#0A0A0A] border-[#1A1A1A] ${isDragging ? "shadow-2xl ring-2 ring-[#D4AF37]" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          {/* Handle para arrastar */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-2 -mt-1 text-[#666] hover:text-[#D4AF37] transition-colors touch-none"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          
          <div className="flex-1 text-center">
            {instructor.photo_url && (
              <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-[#D4AF37] bg-[#1A1A1A]">
                <img
                  src={instructor.photo_url}
                  alt={instructor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              </div>
            )}
            <CardTitle className="text-white text-sm">{instructor.name}</CardTitle>
            <CardDescription className="text-[#D4AF37] text-xs">{instructor.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {instructor.bio && (
          <p className="text-xs text-[#B3B3B3] mb-3 line-clamp-2">{instructor.bio}</p>
        )}
        {instructor.specialties && Array.isArray(instructor.specialties) && instructor.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {instructor.specialties.slice(0, 2).map((specialty: string, idx: number) => (
              <span key={idx} className="bg-[#1A1A1A] text-[#B3B3B3] text-[10px] px-1.5 py-0.5 rounded-full">
                {specialty}
              </span>
            ))}
            {instructor.specialties.length > 2 && (
              <span className="bg-[#1A1A1A] text-[#B3B3B3] text-[10px] px-1.5 py-0.5 rounded-full">
                +{instructor.specialties.length - 2}
              </span>
            )}
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-[#1A1A1A]">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              instructor.active ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
            }`}
          >
            {instructor.active ? "Ativo" : "Inativo"}
          </span>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(instructor)}
              className="h-7 w-7 p-0 text-[#B3B3B3] hover:text-[#D4AF37] hover:bg-[#1A1A1A]"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDelete(instructor.id)} 
              className="h-7 w-7 p-0 text-[#B3B3B3] hover:text-red-400 hover:bg-[#1A1A1A]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
