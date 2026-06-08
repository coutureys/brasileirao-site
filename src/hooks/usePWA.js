/**
 * 📱 USE PWA — Hook para controlar PWA features
 */
import { useEffect, useState } from 'react'

export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [swSupported, setSwSupported] = useState(false)

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setSwSupported(true)

      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration)

          // Verificar atualizações a cada hora
          setInterval(() => {
            registration.update()
          }, 3600000)
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error)
        })
    }
  }, [])

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Detectar instalação
  useEffect(() => {
    // Web app já instalada?
    const isStandalone = window.navigator.standalone === true ||
                        window.matchMedia('(display-mode: standalone)').matches

    setIsInstalled(isStandalone)

    // Prompt antes de instalação (iOS não dispara)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    // Detectar instalação bem-sucedida
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Solicitar permissão de notificações
  const requestNotifications = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      }
    }

    return false
  }

  // Instalar app
  const installApp = async () => {
    if (!deferredPrompt) {
      return false
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        return true
      }

      return false
    } catch (error) {
      console.error('[PWA] Installation error:', error)
      return false
    }
  }

  // Limpar cache de runtime
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()

      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('scoutfut-')) {
            return caches.delete(cacheName)
          }
        })
      )

      return true
    }

    return false
  }

  // Request background sync
  const requestSync = async (tag = 'sync-data') => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(tag)
        return true
      } catch (error) {
        console.error('[PWA] Background sync error:', error)
        return false
      }
    }

    return false
  }

  return {
    isOnline,
    isInstalled,
    swSupported,
    canInstall: !!deferredPrompt,
    installApp,
    requestNotifications,
    clearCache,
    requestSync,
  }
}
