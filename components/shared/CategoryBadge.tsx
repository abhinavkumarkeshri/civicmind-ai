import { cn } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { ComplaintCategory } from '@/lib/types/database'

const CATEGORY_STYLES: Record<ComplaintCategory, string> = {
  pothole:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  garbage:     'bg-lime-500/10 text-lime-400 border-lime-500/20',
  streetlight: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  water_leak:  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  drain:       'bg-teal-500/10 text-teal-400 border-teal-500/20',
  fallen_tree: 'bg-green-500/10 text-green-400 border-green-500/20',
  road_damage: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  other:       'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

interface CategoryBadgeProps {
  category: ComplaintCategory
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium border rounded-md px-2 py-0.5',
        CATEGORY_STYLES[category],
        className,
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}
