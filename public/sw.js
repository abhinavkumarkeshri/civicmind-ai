/**
 * CivicMind AI — Lightweight Service Worker
 *
 * Strategy:
 * - Shell / static assets: Cache-first (stale-while-revalidate)
 * - API calls:             Network-first, no cache
 * - Background Sync:       Drain offline complaint queue on reconnect
 */

const CACHE_NAME = 'civicmind-v2'
const SYNC_TAG = 'civicmind-complaint-sync'

// Only truly public, non-personalized routes belong here. Dashboards and
// any other per-user page must NEVER be pre-cached or cached at all — a
// cached dashboard HTML response can end up served to a different person
// who logs in afterward.
const SHELL_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
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

  // Network-first, NEVER cached: API, auth, and every authenticated
  // per-user area (citizen/officer/admin). These can render different
  // content per person, so caching their HTML at all risks showing one
  // person's data to someone else.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/citizen/') ||
    url.pathname.startsWith('/officer/') ||
    url.pathname.startsWith('/admin/')
  ) {
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
