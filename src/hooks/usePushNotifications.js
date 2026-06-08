import { useState, useEffect } from 'react'

const VAPID_PUBLIC = 'BN6FOy5b58PjqfTVDz40yr_hNL054gOzkxwsLFi3yiNB4qXMgqTNl8GXYxLq94jnqcf_ZjC981k2EU2bfO9eQiA'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const [supported,   setSupported]   = useState(false)
  const [permission,  setPermission]  = useState('default')
  const [subscribed,  setSubscribed]  = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setSupported(ok)
    if (!ok) return

    setPermission(Notification.permission)

    // Verifica se já está inscrito
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setSubscribed(!!sub)
      })
    }).catch(() => {})
  }, [])

  async function subscribe() {
    setLoading(true)
    setError(null)
    try {
      // Registra service worker
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Pede permissão
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setError('Permissão negada. Ative nas configurações do browser.')
        setLoading(false)
        return
      }

      // Inscreve no Push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      })

      // Salva no servidor
      await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: sub.toJSON() }),
      })

      setSubscribed(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Envia push de gol para todos os subscribers
  async function notifyGoal(teamName, score) {
    try {
      await fetch('/api/push/notify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `⚽ GOL! ${teamName}`,
          body:  `Placar: ${score} — Série A 2026`,
          url:   'https://scoutfut.vercel.app/#ao-vivo',
          tag:   'scoutfut-goal',
        }),
      })
    } catch (e) {}
  }

  return { supported, permission, subscribed, loading, error, subscribe, unsubscribe, notifyGoal }
}
