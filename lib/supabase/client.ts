"use client"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseClient: any = null

export const getSupabaseClient = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️  Supabase client not configured - missing environment variables')
    return null
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    } catch (error) {
      console.error('❌ Error initializing Supabase Client:', error)
      return null
    }
  }

  return supabaseClient
}

// Export default client with Realtime enabled
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null
