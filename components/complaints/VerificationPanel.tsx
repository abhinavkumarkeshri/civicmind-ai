'use client'

import { useState } from 'react'
import { ThumbsUp, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  complaintId: string
  upvoteCount: number
  isOwner: boolean
  initialUpvoted: boolean
  initialConfirmed: boolean
  userId: string | null
}

export function VerificationPanel({
  complaintId,
  upvoteCount,
  isOwner,
  initialUpvoted,
  initialConfirmed,
  userId,
}: Props) {
  const [upvoted, setUpvoted] = useState(initialUpvoted)
  const [confirmed, setConfirmed] = useState(initialConfirmed)
  const [count, setCount] = useState(upvoteCount)
  const [loading, setLoading] = useState(false)

  if (!userId || isOwner) return null

  async function toggle(type: 'upvote' | 'confirm') {
    if (loading || !userId) return
    setLoading(true)
    const supabase = createClient()
    const isActive = type === 'upvote' ? upvoted : confirmed

    if (type === 'upvote') {
      // Use API endpoint for upvotes
      try {
        const res = await fetch(`/api/complaints/${complaintId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        if (res.ok) {
          setUpvoted(true)
          setCount((c) => c + 1)
        }
      } catch (err) {
        console.error('Upvote error:', err)
      }
    } else {
      // Confirm uses Supabase direct
      if (isActive) {
        await supabase
          .from('complaint_verifications')
          .delete()
          .eq('complaint_id', complaintId)
          .eq('user_id', userId)
          .eq('type', 'confirm')
        setConfirmed(false)
      } else {
        await supabase
          .from('complaint_verifications')
          .insert({ complaint_id: complaintId, user_id: userId, type: 'confirm' })
        setConfirmed(true)
      }
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-[#1f2d45] bg-[#111827] p-4">
      <p className="text-xs font-medium text-slate-400 mb-3">Community Verification</p>
      <div className="flex gap-3">
        <button
          onClick={() => toggle('upvote')}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-60 ${
            upvoted
              ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
              : 'border-[#1f2d45] hover:bg-[#1a2235] text-slate-400'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          Upvote{' '}
          <span className={`text-xs font-bold ${upvoted ? 'text-blue-400' : 'text-slate-500'}`}>
            {count}
          </span>
        </button>
        <button
          onClick={() => toggle('confirm')}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-60 ${
            confirmed
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'border-[#1f2d45] hover:bg-[#1a2235] text-slate-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {confirmed ? 'Confirmed' : 'Confirm Issue'}
        </button>
      </div>
    </div>
  )
}
