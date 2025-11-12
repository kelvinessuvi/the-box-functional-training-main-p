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
      const [messagesResult, plansResult, galleryResult, statsResult] = await Promise.all([
        supabase.from('contact_messages').select('id, read'),
        supabase.from('plans').select('id').eq('active', true),
        supabase.from('gallery_images').select('id'),
        supabase.from('statistics').select('monthly_views').order('monthly_views', { ascending: false }).limit(1)
      ])

      // Verificar erros
      if (messagesResult.error) throw messagesResult.error
      if (plansResult.error) throw plansResult.error
      if (galleryResult.error) throw galleryResult.error
      if (statsResult.error) throw statsResult.error

      // Calcular estatísticas
      const totalMessages = messagesResult.data?.length || 0
      const unreadMessages = messagesResult.data?.filter(m => !m.read).length || 0
      const activePlans = plansResult.data?.length || 0
      const galleryImages = galleryResult.data?.length || 0
      const monthlyViews = statsResult.data?.[0]?.monthly_views || 0

      const newStats: DatabaseStats = {
        totalMessages,
        unreadMessages,
        activePlans,
        galleryImages,
        monthlyViews,
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

    // Assinatura para planos
    const plansSubscription = supabase
      .channel('direct-plans')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'plans'
      }, () => {
        console.log('[DIRECT-DB] Mudança detectada em planos, atualizando...')
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

    // Assinatura para estatísticas
    const statsSubscription = supabase
      .channel('direct-statistics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'statistics'
      }, () => {
        console.log('[DIRECT-DB] Mudança detectada em estatísticas, atualizando...')
        fetchStatsFromDatabase()
      })
      .subscribe()

    // Armazenar referências
    subscriptions.current = [
      messagesSubscription,
      plansSubscription,
      gallerySubscription,
      statsSubscription
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
