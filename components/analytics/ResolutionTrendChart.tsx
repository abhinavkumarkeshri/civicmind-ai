'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { date: string; submitted: number; resolved: number }[]
}

export function ResolutionTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="submittedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
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
          cursor={{ stroke: '#1f2d45' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
        />
        <Area
          type="monotone"
          dataKey="submitted"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#submittedGrad)"
          name="Submitted"
          dot={false}
          activeDot={{ r: 4, fill: '#3b82f6' }}
        />
        <Area
          type="monotone"
          dataKey="resolved"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#resolvedGrad)"
          name="Resolved"
          dot={false}
          activeDot={{ r: 4, fill: '#22c55e' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
