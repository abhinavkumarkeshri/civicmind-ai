'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ComplaintCard } from '@/components/complaints/ComplaintCard'
import type { Complaint } from '@/lib/types/database'

type FeedTab = 'trending' | 'recent' | 'resolved' | 'top_upvoted'

const TABS: { id: FeedTab; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'trending', label: 'Trending' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'top_upvoted', label: 'Top Upvoted' },
]

interface Props {
  initialComplaints?: Complaint[]
}

export function CommunityFeed({ initialComplaints }: Props) {
  const [activeTab, setActiveTab] = useState<FeedTab>('recent')
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints ?? [])
  const [loading, setLoading] = useState(!initialComplaints)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('complaints')
        .select('*, wards ( name ), profiles:reporter_id ( full_name )')
        .limit(8)

      if (activeTab === 'trending') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', weekAgo).order('upvote_count', { ascending: false })
      } else if (activeTab === 'resolved') {
        query = query.eq('status', 'resolved').order('resolved_at', { ascending: false })
      } else if (activeTab === 'top_upvoted') {
        query = query.order('upvote_count', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data } = await query
      setComplaints((data ?? []) as Complaint[])
      setLoading(false)
    }
    load()
  }, [activeTab])

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#111827] border border-[#1f2d45] mb-4">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-[#1f2d45] bg-[#111827] animate-pulse" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">No complaints yet.</div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} href={`/citizen/complaints/${c.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
