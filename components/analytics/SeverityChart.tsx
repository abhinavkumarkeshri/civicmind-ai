'use client'

import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SEVERITY_LABELS } from '@/lib/constants'
import type { ComplaintSeverity } from '@/lib/types/database'

interface Props {
  data: { name: string; count: number }[]
}

const SEVERITY_CHART_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

export function SeverityChart({ data }: Props) {
  const sorted = ['critical', 'high', 'medium', 'low']
  const formatted = sorted
    .map((sev) => {
      const found = data.find((d) => d.name === sev)
      return {
        name: SEVERITY_LABELS[sev as ComplaintSeverity] ?? sev,
        count: found?.count ?? 0,
        fill: SEVERITY_CHART_COLORS[sev] ?? '#64748b',
      }
    })
    .filter((d) => d.count > 0)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius={20}
        outerRadius={90}
        data={formatted}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          dataKey="count"
          background={{ fill: '#1f2d45' }}
          cornerRadius={4}
          label={{ position: 'insideStart', fill: '#94a3b8', fontSize: 10 }}
        />
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
          wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: '8px' }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}
