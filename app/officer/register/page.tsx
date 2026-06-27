'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, ArrowRight, MapPin, Mail, Lock, User, ArrowLeft } from 'lucide-react'

interface Ward {
  id: string
  name: string
  city: string
}

export default function OfficerRegisterPage() {
  const router = useRouter()
  const [wards, setWards] = useState<Ward[]>([])
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    wardId: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadWards()
  }, [])

  async function loadWards() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('wards').select('*').order('city', { ascending: true })

      if (!error && data) {
        setWards(data)
      }
    } catch (err) {
      console.error('[v0] Wards loading error:', err)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/officer-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          wardId: formData.wardId || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || result.message || 'Signup failed')
        setLoading(false)
        return
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/officer/pending-approval')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111827] to-[#1a2235] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
            <ArrowRight className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Signup Successful</h2>
          <p className="text-slate-400 mb-2">Your officer application has been submitted for admin review.</p>
          <p className="text-slate-500 text-sm">You will receive email notification once approved.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111827] to-[#1a2235] flex items-center justify-center p-4 py-8">
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
            <h1 className="text-3xl font-bold text-white mb-2">Officer Registration</h1>
            <p className="text-slate-400">Register to manage municipal complaints in your ward</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={loading}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                id="email"
                type="email"
                placeholder="officer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Ward Selection */}
          <div>
            <label htmlFor="wardId" className="block text-sm font-medium text-slate-300 mb-2">
              Assigned Ward (Optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
              <select
                id="wardId"
                value={formData.wardId}
                onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-900/50 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors disabled:opacity-50"
              >
                <option value="">Select a ward...</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}, {ward.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Officer Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/officer/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
