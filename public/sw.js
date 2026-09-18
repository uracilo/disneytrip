/* Service worker mínimo — cache runtime, sin librerías */
const CACHE = 'disneytrip-v2'
const BASE = new URL(self.registration.scope).pathname

self.addEventListener('install', (event) => {
  const shell = [
    BASE,
    `${BASE}index.html`,
    `${BASE}manifest.webmanifest`,
    `${BASE}favicon.svg`,
  ]
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(shell)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (!url.pathname.startsWith(BASE)) return

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      try {
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      } catch {
        if (cached) return cached
        if (request.mode === 'navigate') {
          const shell =
            (await cache.match(BASE)) || (await cache.match(`${BASE}index.html`))
          if (shell) return shell
        }
        throw new Error('offline')
      }
    }),
  )
})
