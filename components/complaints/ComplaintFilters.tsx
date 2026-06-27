'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORY_LABELS, SEVERITY_LABELS, STATUS_LABELS } from '@/lib/constants'
import type { ComplaintCategory, ComplaintSeverity, ComplaintStatus } from '@/lib/types/database'

interface Props {
  currentCategory?: string
  currentStatus?: string
  currentSeverity?: string
}

export function ComplaintFilters({ currentCategory, currentStatus, currentSeverity }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete(key)
    else params.set(key, value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <select
        value={currentCategory ?? 'all'}
        onChange={(e) => update('category', e.target.value)}
        className="rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-300 text-xs px-3 py-2 focus:outline-none focus:border-blue-500"
      >
        <option value="all">All categories</option>
        {(Object.keys(CATEGORY_LABELS) as ComplaintCategory[]).map((c) => (
          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
        ))}
      </select>

      <select
        value={currentStatus ?? 'all'}
        onChange={(e) => update('status', e.target.value)}
        className="rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-300 text-xs px-3 py-2 focus:outline-none focus:border-blue-500"
      >
        <option value="all">All statuses</option>
        {(Object.keys(STATUS_LABELS) as ComplaintStatus[]).map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      <select
        value={currentSeverity ?? 'all'}
        onChange={(e) => update('severity', e.target.value)}
        className="rounded-lg border border-[#1f2d45] bg-[#111827] text-slate-300 text-xs px-3 py-2 focus:outline-none focus:border-blue-500"
      >
        <option value="all">All severities</option>
        {(Object.keys(SEVERITY_LABELS) as ComplaintSeverity[]).map((s) => (
          <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
        ))}
      </select>
    </div>
  )
}
