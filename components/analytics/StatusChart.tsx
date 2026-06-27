'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STATUS_LABELS } from '@/lib/constants'
import type { ComplaintStatus } from '@/lib/types/database'

interface Props {
  data: { name: string; count: number }[]
}

const STATUS_PIE_COLORS: Record<string, string> = {
  submitted: '#64748b',
  under_review: '#3b82f6',
  in_progress: '#f59e0b',
  resolved: '#22c55e',
  closed: '#475569',
}

export function StatusChart({ data }: Props) {
  const formatted = data.map((d) => ({
    name: STATUS_LABELS[d.name as ComplaintStatus] ?? d.name,
    value: d.count,
    color: STATUS_PIE_COLORS[d.name] ?? '#64748b',
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {formatted.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#111827',
            border: '1px solid #1f2d45',
            borderRadius: '8px',
            color: '#e2e8f0',
            fontSize: 12,
          }}
          formatter={(value) => [Number(value), 'Complaints']}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
