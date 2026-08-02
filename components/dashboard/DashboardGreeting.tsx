'use client'

import { useEffect, useState } from 'react'

interface Props {
  firstName: string
}

function getGreeting(hour: number): string {
  if (hour < 5) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

export function DashboardGreeting({ firstName }: Props) {
  // Start with something neutral so server-rendered and first-client-render
  // HTML match (avoids a hydration mismatch warning); the real greeting
  // fills in a moment later from the browser's own clock.
  const [greeting, setGreeting] = useState<string | null>(null)

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()))
  }, [])

  return (
    <h1 className="text-xl font-bold text-slate-100">
      {greeting ?? 'Welcome'}, <span className="text-blue-400">{firstName}</span>
    </h1>
  )
}
