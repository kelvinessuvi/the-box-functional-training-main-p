import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  role: 'super_admin' | 'admin'
}

interface AuthState {
  user: User | null
  isAdmin: boolean
  isSuperAdmin: boolean
  isLoading: boolean
  checkAuth: () => void
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      // Verificar cookie local primeiro
      const cookies = document.cookie.split(";")
      const adminToken = cookies.find(cookie => 
        cookie.trim().startsWith("admin-token=")
      )
      
      if (adminToken) {
        // Verificar se o token é válido fazendo uma chamada para a API
        const response = await fetch("/api/debug-auth")
        const data = await response.json()
        
        if (data.status === "autenticado" && data.payload) {
          const userData = {
            id: data.payload.sub,
            email: data.payload.email,
            role: data.payload.role
          }
          
          setUser(userData)
          setIsAdmin(true)
          setIsSuperAdmin(data.payload.role === 'super_admin')
          
          console.log("[USE-AUTH] ✅ Usuário autenticado:", userData)
        } else {
          setUser(null)
          setIsAdmin(false)
          setIsSuperAdmin(false)
          console.log("[USE-AUTH] ❌ Token inválido ou expirado")
        }
      } else {
        setUser(null)
        setIsAdmin(false)
        setIsSuperAdmin(false)
        console.log("[USE-AUTH] ❌ Nenhum token encontrado")
      }
    } catch (error) {
      console.error("[USE-AUTH] Erro ao verificar autenticação:", error)
      setUser(null)
      setIsAdmin(false)
      setIsSuperAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
    
    // Verificar a cada 5 segundos
    const interval = setInterval(checkAuth, 5000)
    
    // Verificar quando a página ganha foco
    const handleFocus = () => {
      setTimeout(checkAuth, 100)
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [checkAuth])

  return { user, isAdmin, isSuperAdmin, isLoading, checkAuth }
}
