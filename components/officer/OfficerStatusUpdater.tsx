'use client'

import { useState } from 'react'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { updateComplaintStatus, assignOfficer } from '@/app/actions/updateComplaintStatus'
import { STATUS_LABELS } from '@/lib/constants'
import type { ComplaintStatus } from '@/lib/types/database'

const STATUS_FLOW: Partial<Record<ComplaintStatus, ComplaintStatus[]>> = {
  submitted: ['under_review'],
  under_review: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed'],
}

interface Props {
  complaintId: string
  currentStatus: ComplaintStatus
  assignedOfficerId: string | null
  officerId: string
}

export function OfficerStatusUpdater({ complaintId, currentStatus, assignedOfficerId, officerId }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<ComplaintStatus>(currentStatus)

  const nextStatuses = STATUS_FLOW[status] ?? []
  const isAssigned = assignedOfficerId === officerId

  async function handleUpdate(newStatus: ComplaintStatus) {
    setLoading(true)
    try {
      if (!isAssigned) await assignOfficer(complaintId, officerId)
      await updateComplaintStatus(complaintId, newStatus, message)
      setStatus(newStatus)
      setMessage('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-200">Officer Actions</p>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isAssigned ? 'bg-amber-400' : 'bg-slate-600'}`} />
          <span className="text-xs text-slate-400">{isAssigned ? 'Assigned to you' : 'Unassigned'}</span>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1.5">Update note (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Add a note for the citizen and your team..."
          className="w-full rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-200 text-sm px-3 py-2 focus:outline-none focus:border-amber-500 resize-none placeholder:text-slate-600"
        />
      </div>

      {nextStatuses.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          This complaint is {STATUS_LABELS[status].toLowerCase()}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {nextStatuses.map((next) => (
            <button
              key={next}
              onClick={() => handleUpdate(next)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              Move to {STATUS_LABELS[next]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
