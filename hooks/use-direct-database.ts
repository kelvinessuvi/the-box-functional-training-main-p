"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface DatabaseStats {
  totalMessages: number
  unreadMessages: number
  activePlans: number
  galleryImages: number
  monthlyViews: number
}

export function useDirectDatabase() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalMessages: 0,
    unreadMessages: 0,
    activePlans: 0,
    galleryImages: 0,
    monthlyViews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const subscriptions = useRef<any[]>([])

  // Função para buscar dados diretamente do banco
  const fetchStatsFromDatabase = async () => {
    try {
      console.log('[DIRECT-DB] Buscando dados diretamente do banco...')
      setIsLoading(true)

      if (!supabase) {
        console.warn('[DIRECT-DB] Supabase client não configurado')
        return
      }

      // Buscar dados diretamente das tabelas
      const [messagesResult, modalitiesResult, galleryResult] = await Promise.all([
        supabase.from('contact_messages').select('id, read'),
        supabase.from('modalities').select('id').eq('active', true),
        supabase.from('gallery_images').select('id')
      ])

      // Verificar erros
      if (messagesResult.error) throw messagesResult.error
      if (modalitiesResult.error) throw modalitiesResult.error
      if (galleryResult.error) throw galleryResult.error

      // Calcular estatísticas
      const totalMessages = messagesResult.data?.length || 0
      const unreadMessages = messagesResult.data?.filter(m => !m.read).length || 0
      const activeModalities = modalitiesResult.data?.length || 0
      const galleryImages = galleryResult.data?.length || 0

      const newStats: DatabaseStats = {
        totalMessages,
        unreadMessages,
        activePlans: activeModalities, // Mantido para compatibilidade
        galleryImages,
        monthlyViews: 0, // Removido, mas mantido no tipo para compatibilidade
      }

      console.log('[DIRECT-DB] Dados atualizados:', newStats)
      setStats(newStats)
      setLastUpdate(new Date())
      setIsLoading(false)

    } catch (error) {
      console.error('[DIRECT-DB] Erro ao buscar dados:', error)
      setIsLoading(false)
    }
  }

  // Configurar assinaturas em tempo real
  useEffect(() => {
    if (!supabase) {
      console.warn('[DIRECT-DB] Supabase client não configurado')
      return
    }

    console.log('[DIRECT-DB] Configurando assinaturas em tempo real...')

    // Assinatura para mensagens
    const messagesSubscription = supabase
      .channel('direct-messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contact_messages'
      }, () => {
        console.log('[DIRECT-DB] Mudança detectada em mensagens, atualizando...')
        fetchStatsFromDatabase()
      })
      .subscribe()

    // Assinatura para modalidades
    const modalitiesSubscription = supabase
      .channel('direct-modalities')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'modalities'
      }, () => {
        console.log('[DIRECT-DB] Mudança detectada em modalidades, atualizando...')
        fetchStatsFromDatabase()
      })
      .subscribe()

    // Assinatura para galeria
    const gallerySubscription = supabase
      .channel('direct-gallery')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'gallery_images'
      }, () => {
        console.log('[DIRECT-DB] Mudança detectada na galeria, atualizando...')
        fetchStatsFromDatabase()
      })
      .subscribe()

    // Armazenar referências
    subscriptions.current = [
      messagesSubscription,
      modalitiesSubscription,
      gallerySubscription
    ]

    console.log('[DIRECT-DB] Assinaturas configuradas com sucesso')

    // Carregar dados iniciais
    fetchStatsFromDatabase()

    // Cleanup
    return () => {
      console.log('[DIRECT-DB] Limpando assinaturas...')
      subscriptions.current.forEach(subscription => {
        if (subscription) {
          supabase.removeChannel(subscription)
        }
      })
      subscriptions.current = []
    }
  }, [])

  // Função para forçar atualização manual
  const refreshStats = () => {
    console.log('[DIRECT-DB] Atualização manual solicitada')
    fetchStatsFromDatabase()
  }

  return {
    stats,
    isLoading,
    lastUpdate,
    refreshStats
  }
}
