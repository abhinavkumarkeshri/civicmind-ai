'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { SummaryInput } from '@/services/ai/summaryService'
import type { AISummaryResult } from '@/lib/types/database'

interface Props {
  input: SummaryInput
}

export function AISummaryCard({ input }: Props) {
  const [summary, setSummary] = useState<AISummaryResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/ai/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input, context: 'officer_dashboard' }),
        })
        if (!res.ok) throw new Error('Failed to generate summary')
        const data = await res.json()
        setSummary(data)
      } catch (err) {
        setError('AI summary unavailable')
        setSummary({
          headline: `${input.criticalCount} critical issues need attention`,
          criticalCount: input.criticalCount,
          estimatedBudget: input.totalEstimatedBudget,
          mostAffectedAreas: input.mostAffectedWards.map((w) => w.ward),
          priorityActions: [
            'Review all critical complaints immediately',
            'Assign field officers to top affected areas',
            'Update status on in-progress repairs',
          ],
          reasoning: 'Based on current complaint data.',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            {loading ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {loading ? 'CivicMind AI is analysing...' : summary?.headline ?? 'AI Daily Briefing'}
            </p>
            {!loading && <p className="text-xs text-slate-400 mt-0.5">Powered by CivicMind AI</p>}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && summary && !loading && (
        <div className="border-t border-blue-500/20 px-5 pb-5 pt-4 space-y-4">
          {/* Priority actions */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Today&apos;s Priority Actions</p>
            <ol className="space-y-2">
              {summary.priorityActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
          </div>

          {/* Most affected areas */}
          {summary.mostAffectedAreas.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Most Affected Areas</p>
              <div className="flex flex-wrap gap-2">
                {summary.mostAffectedAreas.map((area, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          {summary.reasoning && (
            <p className="text-xs text-slate-500 leading-relaxed border-t border-[#1f2d45] pt-3">
              {summary.reasoning}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
