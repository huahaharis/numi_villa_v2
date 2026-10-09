import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, isExpired } = await updateSession(request)

  const isCalendarFeed = request.nextUrl.pathname.startsWith('/calendar/ical')

  const isAdminRoute =
    !isCalendarFeed &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/calendar') ||
      request.nextUrl.pathname.startsWith('/bookings') ||
      request.nextUrl.pathname.startsWith('/invoices') ||
      request.nextUrl.pathname.startsWith('/inventory') ||
      request.nextUrl.pathname.startsWith('/settings'))

  // Protect admin routes
  if (isAdminRoute) {
    if (!user || isExpired) {
      const redirectUrl = new URL('/login', request.url)
      if (isExpired) {
        redirectUrl.searchParams.set('reason', 'expired')
      }
      const response = NextResponse.redirect(redirectUrl)

      // Purge session cookies on redirect
      response.cookies.delete('numi_session_login_time')
      request.cookies.getAll().forEach((c) => {
        if (c.name.startsWith('sb-') || c.name.includes('auth-token')) {
          response.cookies.delete(c.name)
        }
      })
      return response
    }
  }

  // Redirect logged-in users away from login page only if session is actively valid
  if (request.nextUrl.pathname === '/login' && user && !isExpired) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
