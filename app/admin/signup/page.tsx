'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_ALLOWLIST = [
  'abhinavkumarkeshri27@gmail.com',
  'abhinavkrk888@gmail.com'
]

export default function AdminSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation checks
    if (!email || !password || !confirmPassword) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!ADMIN_ALLOWLIST.includes(email.toLowerCase())) {
      setError('This email is not authorized for admin access. Only registered administrators can create accounts.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      if (existingUser) {
        setError('This email is already registered. Please sign in instead.')
        setLoading(false)
        return
      }

      // Create auth account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role: 'admin' }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Failed to create account')
        setLoading(false)
        return
      }

      // Create admin record
      const { error: adminError } = await supabase
        .from('admins')
        .insert([
          {
            user_id: data.user.id,
            email: email.toLowerCase(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])

      if (adminError) {
        setError('Failed to create admin profile: ' + adminError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('[v0] Admin signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d14] px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-100 mb-2">Admin account created!</h1>
          <p className="text-slate-400 mb-8">
            Your admin account has been successfully created. A confirmation email has been sent to <span className="text-slate-200">{email}</span>.
          </p>
          <div className="space-y-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors text-sm"
            >
              Go to Admin Login
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg border border-[#1f2d45] text-slate-300 hover:bg-[#111827] font-medium transition-colors text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0d14] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/30 mb-4">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Registration</h1>
            <p className="text-slate-400 text-sm">Create an admin account for CivicMind</p>
          </div>
        </div>

        {/* Allowlist Info */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 mb-6">
          <p className="text-xs text-amber-300 font-medium">
            Only authorized emails can create admin accounts. Check your email for access details.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#111827] border border-[#1f2d45] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors text-sm"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#111827] border border-[#1f2d45] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors text-sm"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#111827] border border-[#1f2d45] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors text-sm"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg border border-red-500/30 bg-red-500/5">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating account...' : 'Create admin account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/admin/login" className="text-amber-400 hover:text-amber-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
