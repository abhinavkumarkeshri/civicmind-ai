'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { ComplaintCategory } from '@/lib/types/database'

interface Props {
  data: { name: string; count: number }[]
}

const BAR_COLOR = '#3b82f6'

export function CategoryChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: CATEGORY_LABELS[d.name as ComplaintCategory] ?? d.name,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: '#111827',
            border: '1px solid #1f2d45',
            borderRadius: '8px',
            color: '#e2e8f0',
            fontSize: 12,
          }}
          cursor={{ fill: 'rgba(59,130,246,0.05)' }}
          formatter={(value) => [Number(value), 'Reports']}
        />
        <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
