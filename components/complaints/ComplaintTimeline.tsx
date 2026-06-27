import { CheckCircle2, Circle } from 'lucide-react'
import type { ComplaintUpdate } from '@/lib/types/database'
import { STATUS_LABELS } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils/formatters'

interface Props {
  updates: ComplaintUpdate[]
}

export function ComplaintTimeline({ updates }: Props) {
  if (updates.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        No status updates yet.
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {updates.map((update, i) => (
        <div key={update.id} className="flex gap-3">
          {/* Timeline dot + line */}
          <div className="flex flex-col items-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              i === updates.length - 1
                ? 'bg-emerald-500/20 border border-emerald-500/40'
                : 'bg-[#1a2235] border border-[#1f2d45]'
            }`}>
              {i === updates.length - 1 ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <Circle className="w-3 h-3 text-slate-600" />
              )}
            </div>
            {i < updates.length - 1 && (
              <div className="w-px flex-1 bg-[#1f2d45] my-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-5 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                {update.new_status && (
                  <span className="text-sm font-semibold text-slate-200">
                    {STATUS_LABELS[update.new_status]}
                  </span>
                )}
                {update.message && (
                  <p className="text-xs text-slate-400 mt-0.5">{update.message}</p>
                )}
                {update.profiles && (
                  <p className="text-[10px] text-slate-600 mt-1">
                    by {(update.profiles as { full_name?: string }).full_name ?? 'System'}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-slate-600 flex-shrink-0">
                {formatRelativeTime(update.created_at)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
