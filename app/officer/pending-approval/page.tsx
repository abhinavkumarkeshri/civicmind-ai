'use client'

import Link from 'next/link'
import { Clock, Mail, ArrowLeft } from 'lucide-react'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#111827] to-[#1a2235] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Pending Admin Approval</h1>
          <p className="text-slate-400">Your officer application has been received</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Info Box */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Email Verification Required</p>
                  <p className="text-sm text-slate-400 mt-1">Check your email for a verification link</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Waiting for Admin Review</p>
                  <p className="text-sm text-slate-400 mt-1">
                    An administrator will review your application and approve or reject it
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-300 mb-4">What Happens Next</p>
            <div className="space-y-3">
              <TimelineItem
                step={1}
                title="Verify Email"
                description="Click the link in your verification email"
                active={true}
              />
              <TimelineItem
                step={2}
                title="Admin Review"
                description="Administrator will review your application"
                active={false}
              />
              <TimelineItem
                step={3}
                title="Account Approved"
                description="You will receive approval notification"
                active={false}
              />
              <TimelineItem
                step={4}
                title="Start Managing"
                description="Login and start managing complaints"
                active={false}
              />
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
            <p className="text-sm text-slate-400">
              <strong>Typical approval time:</strong> 24-48 hours during business hours
            </p>
            <p className="text-sm text-slate-400 mt-2">
              <strong>Need help?</strong> Contact the system administrator
            </p>
          </div>

          {/* Actions */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ step, title, description, active }: { step: number; title: string; description: string; active: boolean }) {
  return (
    <div className="flex gap-3">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm flex-shrink-0 border-2 ${active ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-700 bg-slate-800/50 text-slate-400'}`}>
        {step}
      </div>
      <div className="pt-0.5">
        <p className={`font-medium ${active ? 'text-white' : 'text-slate-400'}`}>{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}
