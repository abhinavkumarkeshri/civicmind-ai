/**
 * CivicMind AI — Lightweight Service Worker
 *
 * Strategy:
 * - Shell / static assets: Cache-first (stale-while-revalidate)
 * - API calls:             Network-first, no cache
 * - Background Sync:       Drain offline complaint queue on reconnect
 */

const CACHE_NAME = 'civicmind-v1'
const SYNC_TAG = 'civicmind-complaint-sync'

const SHELL_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/citizen/dashboard',
  '/officer/dashboard',
]

// ── Install: pre-cache the app shell ─────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(SHELL_ROUTES).catch(() => {
        // Non-fatal — some routes may not be pre-renderable
      })
    )
  )
  self.skipWaiting()
})

// ── Activate: clean up old caches ────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first for API/auth, cache-first for assets ─
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Network-first for API, auth, and Supabase
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((cached) => cached ?? Response.error())
      )
    )
    return
  }

  // Cache-first for static assets (_next/static, images, fonts)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2|woff|ttf)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((res) => {
            if (res.ok) {
              const clone = res.clone()
              caches.open(CACHE_NAME).then((c) => c.put(event.request, clone))
            }
            return res
          })
      )
    )
    return
  }

  // Stale-while-revalidate for pages
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone))
        }
        return res
      })
      return cached ?? networkFetch
    })
  )
})

// ── Background Sync: drain offline complaint queue ────────────
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'DRAIN_QUEUE' })
        )
      })
    )
  }
})
