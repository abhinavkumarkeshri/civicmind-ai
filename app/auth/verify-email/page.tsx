'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react'
import { OtpInput } from '@/components/auth/OtpInput'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const redirectTo = searchParams.get('redirectTo') || '/auth/login'

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  async function handleVerify() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed')
        setLoading(false)
        return
      }
      setSuccess(true)
      setTimeout(() => router.push(redirectTo), 1500)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setResendMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'signup' }),
      })
      if (res.ok) {
        setResendMessage('A new code has been sent to your email.')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to resend code')
      }
    } catch {
      setError('Failed to resend code')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0d14] px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
          <MailCheck className="w-6 h-6 text-blue-400" />
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-1">Verify your email</h1>
        <p className="text-slate-400 text-sm mb-8">
          We sent a 6-digit code to <span className="text-slate-300">{email || 'your email'}</span>
        </p>

        {success ? (
          <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            Email verified! Redirecting you to sign in...
          </div>
        ) : (
          <>
            <OtpInput onChange={setOtp} disabled={loading} />

            {error && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            {resendMessage && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                {resendMessage}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Verifying...' : 'Verify email'}
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full mt-3 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
            >
              {resending ? 'Resending...' : "Didn't get a code? Resend"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}
