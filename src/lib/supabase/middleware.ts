import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export function isSessionExpired(loginTimeMs: number): boolean {
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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const loginTimeCookie = request.cookies.get('numi_session_login_time')?.value
  const loginTime = loginTimeCookie ? parseInt(loginTimeCookie, 10) : null

  // If user is authenticated in Supabase, check if session timestamp is missing or expired
  const isExpired = user ? (!loginTime || isSessionExpired(loginTime)) : false

  if (isExpired && user) {
    // Delete auth cookies from response to prevent stale persistence
    request.cookies.getAll().forEach((c) => {
      if (
        c.name.startsWith('sb-') ||
        c.name.includes('auth-token') ||
        c.name === 'numi_session_login_time'
      ) {
        supabaseResponse.cookies.delete(c.name)
      }
    })
    return { supabaseResponse, user: null, isExpired: true }
  }

  return { supabaseResponse, user, isExpired: false }
}
