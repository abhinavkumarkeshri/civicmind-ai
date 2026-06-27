import { cn } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import type { ComplaintStatus } from '@/lib/types/database'
import {
  Clock,
  Search,
  Wrench,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

const STATUS_ICONS: Record<ComplaintStatus, React.ElementType> = {
  submitted: Clock,
  under_review: Search,
  in_progress: Wrench,
  resolved: CheckCircle2,
  closed: XCircle,
}

interface StatusPillProps {
  status: ComplaintStatus
  className?: string
  size?: 'sm' | 'md'
}

export function StatusPill({ status, className, size = 'md' }: StatusPillProps) {
  const Icon = STATUS_ICONS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        STATUS_COLORS[status],
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      {STATUS_LABELS[status]}
    </span>
  )
}
