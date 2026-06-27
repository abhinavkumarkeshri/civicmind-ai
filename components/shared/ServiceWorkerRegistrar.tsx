'use client'

import { useEffect } from 'react'
import { registerBackgroundSync } from '@/lib/pwa/syncQueue'

/**
 * Registers the service worker and sets up background sync on mount.
 * Include this once in the citizen layout.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {
          // SW registration is non-critical — silently ignore
        })
    }

    registerBackgroundSync()

    // Listen for DRAIN_QUEUE messages from the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'DRAIN_QUEUE') {
          import('@/lib/pwa/syncQueue').then(({ drainQueue }) => drainQueue())
        }
      })
    }
  }, [])

  return null
}
