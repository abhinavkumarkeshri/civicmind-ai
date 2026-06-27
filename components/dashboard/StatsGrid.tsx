import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCard {
  label: string
  value: string | number
  subtext?: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  accent?: 'blue' | 'amber' | 'red' | 'emerald'
}

interface StatsGridProps {
  stats: StatCard[]
  columns?: 2 | 3 | 4
}

const ACCENT_STYLES = {
  blue:    { icon: 'bg-blue-500/10 text-blue-400',    border: 'border-blue-500/10' },
  amber:   { icon: 'bg-amber-500/10 text-amber-400',  border: 'border-amber-500/10' },
  red:     { icon: 'bg-red-500/10 text-red-400',      border: 'border-red-500/10' },
  emerald: { icon: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/10' },
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-2 md:grid-cols-3',
        columns === 4 && 'grid-cols-2 lg:grid-cols-4',
      )}
    >
      {stats.map((stat) => {
        const accent = stat.accent ?? 'blue'
        const styles = ACCENT_STYLES[accent]
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className={cn(
              'rounded-xl border bg-[#111827] p-5 flex flex-col gap-3',
              styles.border,
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', styles.icon)}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
              {stat.subtext && (
                <div className="text-xs text-slate-500 mt-0.5">{stat.subtext}</div>
              )}
            </div>
            {stat.trend && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                stat.trend.positive ? 'text-emerald-400' : 'text-red-400',
              )}>
                <span>{stat.trend.positive ? '↑' : '↓'}</span>
                <span>{stat.trend.value} vs last month</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
