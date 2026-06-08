/**
 * 🔧 SERVICE WORKER — Cache estratégias e offline support
 */

const CACHE_NAME = 'scoutfut-v1'
const RUNTIME_CACHE = 'scoutfut-runtime-v1'
const ASSET_CACHE = 'scoutfut-assets-v1'

// Assets para cache na instalação
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
]

/**
 * INSTALL — Cache inicial
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

/**
 * ACTIVATE — Limpeza de caches antigos
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && !cacheName.startsWith('scoutfut-')) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

/**
 * FETCH — Cache + Network strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requests não-GET
  if (request.method !== 'GET') {
    return
  }

  // Ignorar extensões do navegador
  if (url.origin !== location.origin) {
    return
  }

  // Estratégia 1: Network first para API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Estratégia 2: Cache first para assets
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Estratégia 3: Stale while revalidate para docs/pages
  event.respondWith(staleWhileRevalidate(request))
})

/**
 * Network First Strategy
 * Tenta a rede primeiro, usa cache como fallback
 */
function networkFirst(request) {
  return caches.open(RUNTIME_CACHE).then((cache) => {
    return fetch(request)
      .then((response) => {
        // Cache bem-sucedido
        if (response && response.status === 200) {
          cache.put(request, response.clone())
        }
        return response
      })
      .catch(() => {
        // Offline ou erro de rede
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Fallback para offline page
          return new Response('Sem conexão. Tente novamente.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          })
        })
      })
  })
}

/**
 * Cache First Strategy
 * Usa cache primeiro, rede como fallback
 */
function cacheFirst(request) {
  return caches.open(ASSET_CACHE).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response
          }

          // Clone e cache
          cache.put(request, response.clone())
          return response
        })
        .catch(() => {
          // Retornar placeholder se offline
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#f0f0f0" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="sans-serif">Imagem indisponível</text></svg>',
              {
                headers: { 'Content-Type': 'image/svg+xml' },
              }
            )
          }
          return new Response('Recurso não disponível', { status: 503 })
        })
    })
  })
}

/**
 * Stale While Revalidate
 * Retorna cache imediatamente, atualiza em background
 */
function staleWhileRevalidate(request) {
  return caches.open(RUNTIME_CACHE).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response && response.status === 200) {
          cache.put(request, response.clone())
        }
        return response
      }).catch(() => cachedResponse)

      return cachedResponse || fetchPromise
    })
  })
}

/**
 * Message Handler — Comunicação com app
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})

/**
 * Background Sync — Sincronizar dados offline quando voltar online
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites())
  }

  if (event.tag === 'sync-alerts') {
    event.waitUntil(syncAlerts())
  }
})

async function syncFavorites() {
  try {
    const response = await fetch('/api/favorites/sync', { method: 'POST' })
    return response.json()
  } catch (error) {
    console.error('[SW] Sync favorites failed:', error)
    throw error
  }
}

async function syncAlerts() {
  try {
    const response = await fetch('/api/alerts/sync', { method: 'POST' })
    return response.json()
  } catch (error) {
    console.error('[SW] Sync alerts failed:', error)
    throw error
  }
}

/**
 * Push Notifications
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}

  const options = {
    body: data.body || 'Nova notificação',
    icon: '/logo-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'ScoutFut', options)
  )
})

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Procura aba já aberta
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }

      // Abre nova aba
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

console.log('[SW] Service Worker loaded')
