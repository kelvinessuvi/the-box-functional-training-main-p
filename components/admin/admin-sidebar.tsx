"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BarChart3, 
  MessageSquare, 
  ImageIcon, 
  Package, 
  ShoppingBag,
  LogOut, 
  Users, 
  MapPin, 
  Handshake, 
  Settings,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  onRefresh: () => void
  isRefreshing: boolean
  unreadMessages: number
}

const menuItems = [
  { id: "overview", label: "Visão Geral", icon: BarChart3 },
  { id: "gallery", label: "Galeria", icon: ImageIcon },
  { id: "modalities", label: "Modalidades", icon: Package },
  { id: "instructors", label: "Instrutores", icon: Users },
  { id: "branches", label: "Filiais", icon: MapPin },
  { id: "products", label: "Produtos", icon: ShoppingBag },
  { id: "partners", label: "Parceiros", icon: Handshake },
  { id: "messages", label: "Mensagens", icon: MessageSquare, badge: true },
  { id: "users", label: "Usuários", icon: Users },
  { id: "settings", label: "Configurações", icon: Settings },
]

export function AdminSidebar({ 
  activeTab, 
  onTabChange, 
  onLogout, 
  onRefresh, 
  isRefreshing,
  unreadMessages 
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-[#1A1A1A] px-4",
        isCollapsed ? "h-16 justify-center" : "h-20 gap-3"
      )}>
        <Image
          src="/images/logo.png"
          alt="THE BOX"
          width={isCollapsed ? 40 : 50}
          height={isCollapsed ? 40 : 50}
          className="rounded-lg"
        />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-[10px] text-[#D4AF37]">Painel Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const showBadge = item.badge && unreadMessages > 0

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id)
                  setIsMobileOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                  isActive 
                    ? "bg-[#D4AF37] text-black font-semibold" 
                    : "text-[#B3B3B3] hover:bg-[#1A1A1A] hover:text-white",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-black")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {showBadge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && showBadge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="border-t border-[#1A1A1A] p-3 space-y-2">
        {/* Ver Site */}
        <Link href="/" target="_blank">
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "w-full border-[#1A1A1A] text-white hover:border-[#D4AF37] hover:text-[#D4AF37] bg-transparent",
              isCollapsed && "px-2"
            )}
          >
            <ExternalLink className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Ver Site</span>}
          </Button>
        </Link>

        {/* Refresh */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            "w-full text-[#B3B3B3] hover:bg-[#1A1A1A] hover:text-white",
            isCollapsed && "px-2"
          )}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {!isCollapsed && <span className="ml-2">Atualizar</span>}
        </Button>

        {/* Logout */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onLogout}
          className={cn(
            "w-full text-red-400 hover:bg-red-500/10 hover:text-red-400",
            isCollapsed && "px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>

      {/* Collapse Toggle - Desktop */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full items-center justify-center text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A] transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg flex items-center justify-center text-white hover:border-[#D4AF37]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col z-50 transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[240px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}

