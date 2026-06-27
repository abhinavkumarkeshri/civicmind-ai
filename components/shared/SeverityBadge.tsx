import { cn } from '@/lib/utils'
import { SEVERITY_LABELS, SEVERITY_COLORS } from '@/lib/constants'
import type { ComplaintSeverity } from '@/lib/types/database'

interface SeverityBadgeProps {
  severity: ComplaintSeverity
  className?: string
  size?: 'sm' | 'md'
}

export function SeverityBadge({ severity, className, size = 'md' }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium border rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        SEVERITY_COLORS[severity],
        className,
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          severity === 'critical' && 'bg-red-400',
          severity === 'high' && 'bg-orange-400',
          severity === 'medium' && 'bg-yellow-400',
          severity === 'low' && 'bg-emerald-400',
        )}
      />
      {SEVERITY_LABELS[severity]}
    </span>
  )
}
