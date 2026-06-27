'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, MapPin, Clock, IndianRupee, Wrench, WifiOff, AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { OrchestratorResult } from '@/lib/types/database'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { CATEGORY_LABELS } from '@/lib/constants'

interface Props {
  title: string
  description: string
  result: OrchestratorResult
  imagePreview: string
  address: string
  submitting: boolean
  submitError?: string | null
  onSubmit: () => void
}

export function StepConfirm({ title, description, result, imagePreview, address, submitting, submitError, onSubmit }: Props) {
  const [offline, setOffline] = useState(false)
  const [duplicateOverride, setDuplicateOverride] = useState(false)

  useEffect(() => {
    setOffline(!navigator.onLine)
    const on = () => setOffline(true)
    const off = () => setOffline(false)
    window.addEventListener('offline', on)
    window.addEventListener('online', off)
    return () => { window.removeEventListener('offline', on); window.removeEventListener('online', off) }
  }, [])

  // Parse duplicate error from server action
  // Format: "DUPLICATE:<id>:<message>"
  const isDuplicateError = submitError?.startsWith('DUPLICATE:')
  let duplicateId: string | null = null
  let duplicateMessage: string | null = null
  if (isDuplicateError && submitError) {
    const parts = submitError.split(':')
    duplicateId = parts[1] ?? null
    duplicateMessage = parts.slice(2).join(':')
  }

  // Also block submit if AI already found duplicates and user hasn't confirmed
  const hasAIDuplicates = result.duplicates.length > 0 && !duplicateOverride

  const canSubmit = !submitting && !offline && !isDuplicateError

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Review & Submit</h2>
        <p className="text-sm text-slate-400">Your complaint is ready. Review the details below.</p>
      </div>

      {/* Server-side duplicate block */}
      {isDuplicateError && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300">Duplicate Complaint Blocked</p>
              <p className="text-xs text-red-400/80 mt-1">{duplicateMessage}</p>
            </div>
          </div>
          {duplicateId && (
            <Link
              href={`/citizen/complaints/${duplicateId}`}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View your existing complaint
            </Link>
          )}
        </div>
      )}

      {/* AI duplicate warning with override */}
      {!isDuplicateError && result.duplicates.length > 0 && (
        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-300">Similar report nearby</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                &ldquo;{result.duplicates[0].title}&rdquo; — {result.duplicates[0].distance}m away
              </p>
            </div>
          </div>
          {!duplicateOverride ? (
            <div className="flex gap-2 pt-1">
              <Link
                href={`/citizen/complaints/${result.duplicates[0].id}`}
                className="flex-1 text-center py-2 text-xs rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors"
              >
                View existing
              </Link>
              <button
                onClick={() => setDuplicateOverride(true)}
                className="flex-1 text-center py-2 text-xs rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors"
              >
                It&apos;s different, continue
              </button>
            </div>
          ) : (
            <p className="text-xs text-emerald-400">✓ Confirmed as a different issue</p>
          )}
        </div>
      )}

      {/* Image + Category */}
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagePreview}
          alt="Issue"
          className="w-24 h-24 rounded-xl object-cover border border-[#1f2d45] flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <CategoryBadge category={result.category} />
            <SeverityBadge severity={result.severity} />
          </div>
          <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2">{title}</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl border border-[#1f2d45] bg-[#111827]">
        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="text-sm text-slate-300 truncate">{address || 'Location confirmed'}</p>
      </div>

      {/* Repair estimate */}
      <div className="rounded-xl border border-[#1f2d45] bg-[#0d1526] p-4">
        <p className="text-xs font-medium text-slate-400 mb-3">AI Repair Estimate</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-slate-100">{result.estimatedHours}h</p>
            <p className="text-xs text-slate-500">Est. time</p>
          </div>
          <div className="text-center">
            <IndianRupee className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-slate-100">₹{result.estimatedCost.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500">Est. cost</p>
          </div>
          <div className="text-center">
            <Wrench className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-slate-100 truncate">{result.department.split(' ')[0]}</p>
            <p className="text-xs text-slate-500">Department</p>
          </div>
        </div>
      </div>

      {/* Repair steps */}
      {result.repairSteps.length > 0 && (
        <div className="rounded-xl border border-[#1f2d45] bg-[#0d1526] p-4">
          <p className="text-xs font-medium text-slate-400 mb-2">Repair Steps</p>
          <ol className="space-y-1.5">
            {result.repairSteps.slice(0, 4).map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {offline && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-sm">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>You are offline. Your report will be queued and submitted automatically when you reconnect.</span>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!canSubmit || hasAIDuplicates}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>Submitting...</>
        ) : offline ? (
          <><WifiOff className="w-4 h-4" /> Waiting for connection...</>
        ) : isDuplicateError ? (
          <>Submission Blocked — Duplicate</>
        ) : (
          <><CheckCircle2 className="w-4 h-4" /> Submit Complaint</>
        )}
      </button>
    </div>
  )
}
