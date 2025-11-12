import { requireAdmin } from "@/lib/auth/auth-utils"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  console.log("[DASHBOARD] Página sendo carregada...")
  
  try {
    console.log("[DASHBOARD] Verificando autenticação...")
    const admin = await requireAdmin()
    
    if (!admin) {
      console.log("[DASHBOARD] ❌ Admin não autenticado, redirecionando...")
      return null // O redirect já foi feito pelo requireAdmin
    }
    
    console.log("[DASHBOARD] ✅ Admin autenticado:", admin.email)
    return <AdminDashboard />
  } catch (error) {
    console.error("[DASHBOARD] ❌ Erro na autenticação:", error)
    // Se houver erro, o requireAdmin já redirecionou
    throw error
  }
}
