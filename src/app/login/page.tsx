'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { Toaster, toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

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
        <div className="bg-[#232019] rounded-2xl border border-white/10 p-8">
          <h2 className="text-white text-xl font-semibold text-center mb-2">Admin Portal</h2>
          <p className="text-white/40 text-sm text-center mb-8">Access authorized management tools</p>

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

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-white accent-white"
              />
              <label htmlFor="remember" className="text-white/40 text-sm">
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <a href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors underline underline-offset-4">
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
