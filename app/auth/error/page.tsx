import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0d14] px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-100 mb-2">Authentication Error</h1>
        <p className="text-slate-400 mb-8">
          Something went wrong during sign in. Please try again.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
