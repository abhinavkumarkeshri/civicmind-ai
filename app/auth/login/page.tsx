'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, MapPin, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Fetch role and redirect accordingly
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'officer') {
      router.push('/officer/dashboard')
    } else {
      router.push('/citizen/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0d14]">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0d1526] border-r border-[#1f2d45]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-100">CivicMind AI</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-slate-100 leading-tight mb-4 text-balance">
            Fix your city,<br />
            <span className="text-blue-400">one report at a time.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            AI-powered civic issue reporting. Upload a photo — our AI identifies the
            problem, assigns severity, and routes it to the right department instantly.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { value: '94%', label: 'AI Accuracy' },
              { value: '3.2h', label: 'Avg Response' },
              { value: '12K+', label: 'Issues Resolved' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-sm">
          Empowering civic participation across India
        </p>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-slate-100">CivicMind AI</span>
        </div>

        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Welcome back</h2>
          <p className="text-slate-400 mb-8 text-sm">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#111827] border border-[#1f2d45] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#111827] border border-[#1f2d45] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Create account
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-8 p-4 rounded-lg border border-[#1f2d45] bg-[#111827]">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">
              Demo accounts
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-500">Citizen</span>
                <span>citizen@civicmind.in</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Officer</span>
                <span>officer@civicmind.in</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password</span>
                <span>CivicDemo2024!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
