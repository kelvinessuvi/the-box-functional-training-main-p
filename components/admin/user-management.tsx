"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"

interface User {
  id: string
  email: string
  role: 'super_admin' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export function UserManagement() {
  const { user, isSuperAdmin } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Debug logs
  console.log("[UserManagement] Render - isSuperAdmin:", isSuperAdmin, "isLoading:", isLoading)
  
  // Carregar usuários quando o componente montar
  useEffect(() => {
    console.log("[UserManagement] useEffect triggered - isSuperAdmin:", isSuperAdmin)
    
    const loadUsers = async () => {
      try {
        console.log("[UserManagement] Starting to load users...")
        setIsLoading(true)
        setError(null)
        
        // Simular carregamento de usuários (substitua pela chamada real da API)
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'admin@superbeast.com',
            role: 'super_admin',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            last_login: '2024-01-15T10:30:00Z'
          }
        ]
        
        // Simular delay de carregamento
        console.log("[UserManagement] Simulating loading delay...")
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log("[UserManagement] Setting users:", mockUsers)
        setUsers(mockUsers)
        console.log("[UserManagement] Users loaded successfully")
      } catch (err) {
        setError('Erro ao carregar usuários')
        console.error('[UserManagement] Erro ao carregar usuários:', err)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários",
          variant: "destructive"
        })
      } finally {
        console.log("[UserManagement] Setting isLoading to false")
        setIsLoading(false)
      }
    }

    if (isSuperAdmin) {
      loadUsers()
    } else {
      console.log("[UserManagement] Not super admin, setting loading to false")
      setIsLoading(false)
    }
  }, [isSuperAdmin, toast])
  
  // Verificar permissões
  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
          <CardDescription>
            Apenas super administradores podem gerenciar usuários.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando usuários...</CardTitle>
          <CardDescription>Aguarde enquanto carregamos a lista de usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao carregar usuários</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
          <p className="text-gray-600">Gerencie usuários administradores do sistema</p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            {users.length} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                          {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
