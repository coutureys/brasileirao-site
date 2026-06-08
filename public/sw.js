// ScoutFut Service Worker — Push Notifications
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body:    data.body  ?? 'Atualização do ScoutFut',
    icon:    data.icon  ?? '/icon-192.png',
    badge:   data.badge ?? '/icon-192.png',
    image:   data.image ?? null,
    vibrate: [100, 50, 100, 50, 200],
    tag:     data.tag   ?? 'scoutfut-goal',
    renotify: true,
    data: { url: data.url ?? 'https://scoutfut.vercel.app/#ao-vivo' },
    actions: [
      { action: 'view', title: '⚽ Ver jogo' },
      { action: 'close', title: 'Fechar' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? '⚽ ScoutFut', options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'close') return

  const url = event.notification.data?.url ?? 'https://scoutfut.vercel.app/#ao-vivo'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('scoutfut') && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

self.addEventListener('install',  () => self.skipWaiting())
self.addEventListener('activate', e  => e.waitUntil(clients.claim()))
