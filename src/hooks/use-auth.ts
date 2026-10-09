'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

function isSessionExpired(loginTimeMs: number): boolean {
  const now = new Date()
  const loginDate = new Date(loginTimeMs)
  const elapsedMs = now.getTime() - loginDate.getTime()

  // 1. More than 16 hours is always expired
  if (elapsedMs > 16 * 60 * 60 * 1000) return true

  // 2. Different calendar day AND at least 6 hours elapsed -> expired (e.g. logged in yesterday, opened today)
  const isDifferentDay =
    now.getFullYear() !== loginDate.getFullYear() ||
    now.getMonth() !== loginDate.getMonth() ||
    now.getDate() !== loginDate.getDate()

  if (isDifferentDay && elapsedMs > 6 * 60 * 60 * 1000) return true

  // 3. Absolute 12-hour session timeout
  if (elapsedMs > 12 * 60 * 60 * 1000) return true

  return false
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkExpiry = () => {
      if (typeof document === 'undefined') return false
      const match = document.cookie.match(/numi_session_login_time=([^;]+)/)
      const loginTime = match ? parseInt(match[1], 10) : null

      if (loginTime && isSessionExpired(loginTime)) {
        document.cookie = 'numi_session_login_time=; path=/; max-age=0; SameSite=Lax'
        supabase.auth.signOut()
        setUser(null)
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?reason=expired'
        }
        return true
      }
      return false
    }

    if (checkExpiry()) return

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (checkExpiry()) return
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.session) {
      // Set session creation timestamp with 12-hour maximum lifetime
      const maxAge = 12 * 60 * 60
      document.cookie = `numi_session_login_time=${Date.now()}; path=/; max-age=${maxAge}; SameSite=Lax`
    }
    return { data, error }
  }, [supabase.auth])

  const signOut = useCallback(async () => {
    document.cookie = 'numi_session_login_time=; path=/; max-age=0; SameSite=Lax'
    await supabase.auth.signOut()
  }, [supabase.auth])

  return { user, isLoading, signIn, signOut }
}
