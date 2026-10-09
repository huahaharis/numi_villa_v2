'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'
import { Toaster, toast } from 'sonner'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isExpired = searchParams.get('reason') === 'expired'

  useEffect(() => {
    if (isExpired) {
      // Clean up any lingering local session state
      signOut()
    }
  }, [isExpired, signOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      toast.error('Invalid email or password')
      setIsLoading(false)
      return
    }

    toast.success('Welcome back!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#1a1714' }}
    >
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-widest uppercase">NUMI</h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-1">VILLA MGMT SYSTEM</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#232019] rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-white text-xl font-semibold text-center mb-2">Admin Portal</h2>
          <p className="text-white/40 text-sm text-center mb-6">Access authorized management tools</p>

          {/* Session Expired Banner */}
          {isExpired && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Session Expired</p>
                <p className="text-white/60 text-[11px] mt-0.5 leading-relaxed">
                  Your daily login token has expired. Please sign in again to continue managing Numi Villa.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider font-medium mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@numivilla.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider font-medium mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Session Expiry Indicator */}
            <div className="flex items-center gap-2 text-white/40 text-xs py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Session active for today · Auto-expires next day</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Authorize Access
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Forgot password */}
          <p className="text-center mt-6">
            <a
              href="mailto:support@numivilla.my.id?subject=Password%20Reset%20Request"
              className="text-white/30 text-xs hover:text-white/60 transition-colors underline underline-offset-4"
            >
              forgot access credentials?
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs text-center mt-8">
          © 2026 NUMI VILLA MANAGEMENT · SECURE ENVIRONMENT
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: '#1a1714' }}
        >
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
