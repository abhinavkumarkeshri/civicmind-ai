'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    // Initialise from browser state
    setOffline(!navigator.onLine)

    const handleOffline = () => setOffline(true)
    const handleOnline = () => setOffline(false)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-14 left-0 right-0 z-40 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-sm font-medium"
    >
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span>You are offline. Reports will be queued and sent when reconnected.</span>
    </div>
  )
}
