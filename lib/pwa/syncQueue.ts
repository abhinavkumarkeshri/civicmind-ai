/**
 * Sync Queue — drains the offline outbox when network is restored.
 *
 * Strategy:
 * 1. Primary: Background Sync API (`sync` event in service worker)
 * 2. Fallback: `online` event listener in the browser tab
 *
 * Uses Web Locks API to prevent concurrent drains across tabs.
 * Server receives `idempotencyKey` so duplicate submissions are safe.
 */
import { getPendingComplaints, removeComplaint, incrementRetry } from './offlineQueue'

const SYNC_TAG = 'civicmind-complaint-sync'
const MAX_RETRIES = 5
const LOCK_NAME = 'civicmind-sync-lock'

export function registerBackgroundSync(): void {
  if (typeof window === 'undefined') return

  // Register service worker sync when online
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((reg) => {
      return (reg as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } })
        .sync.register(SYNC_TAG)
    }).catch(() => {
      // SyncManager not available — fall back to online event
    })
  }

  // Fallback: drain on `online` event
  window.addEventListener('online', () => {
    drainQueue()
  })
}

export async function drainQueue(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return

  // Web Locks — prevent concurrent drains across tabs
  if ('locks' in navigator) {
    await navigator.locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
      if (!lock) return // Another tab is already draining
      await processPendingComplaints()
    })
  } else {
    await processPendingComplaints()
  }
}

async function processPendingComplaints(): Promise<void> {
  const pending = await getPendingComplaints()
  if (pending.length === 0) return

  for (const complaint of pending) {
    if (complaint.retries >= MAX_RETRIES) {
      await removeComplaint(complaint.idempotencyKey)
      continue
    }

    try {
      const res = await fetch('/api/complaints/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaint),
      })

      if (res.ok || res.status === 409) {
        // 409 = already submitted (idempotency) — safe to remove
        await removeComplaint(complaint.idempotencyKey)
      } else {
        await incrementRetry(complaint.idempotencyKey)
      }
    } catch {
      await incrementRetry(complaint.idempotencyKey)
    }
  }
}
