/**
 * 📴 USE OFFLINE — Suporte avançado offline com sync
 */
import { useState, useEffect, useCallback } from 'react'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingSync, setPendingSync] = useState([])
  const [offlineData, setOfflineData] = useState({})
  const [syncInProgress, setSyncInProgress] = useState(false)

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Tentar sincronizar quando voltar online
      syncPendingData()
    }

    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Carregar dados offline salvos
  useEffect(() => {
    const saved = localStorage.getItem('scoutfut-offline-data')
    if (saved) {
      try {
        setOfflineData(JSON.parse(saved))
      } catch (e) {
        console.error('[Offline] Failed to load cached data:', e)
      }
    }

    const pending = localStorage.getItem('scoutfut-pending-sync')
    if (pending) {
      try {
        setPendingSync(JSON.parse(pending))
      } catch (e) {
        console.error('[Offline] Failed to load pending sync:', e)
      }
    }
  }, [])

  // Salvar dados offline
  const cacheData = useCallback((key, data) => {
    const updated = { ...offlineData, [key]: { data, timestamp: Date.now() } }
    setOfflineData(updated)
    localStorage.setItem('scoutfut-offline-data', JSON.stringify(updated))
  }, [offlineData])

  // Adicionar ação para sincronizar depois
  const addPending = useCallback((action, data) => {
    const pending = {
      id: `${action}-${Date.now()}`,
      action,
      data,
      timestamp: Date.now(),
    }

    setPendingSync(prev => [...prev, pending])
    localStorage.setItem(
      'scoutfut-pending-sync',
      JSON.stringify([...pendingSync, pending])
    )

    return pending.id
  }, [pendingSync])

  // Sincronizar dados pendentes
  const syncPendingData = useCallback(async () => {
    if (syncInProgress || !isOnline || pendingSync.length === 0) {
      return
    }

    setSyncInProgress(true)

    try {
      for (const item of pendingSync) {
        try {
          // Enviar para API
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })

          if (response.ok) {
            // Remover do pending
            setPendingSync(prev => prev.filter(p => p.id !== item.id))
            localStorage.setItem(
              'scoutfut-pending-sync',
              JSON.stringify(pendingSync.filter(p => p.id !== item.id))
            )
          }
        } catch (e) {
          console.error(`[Offline] Failed to sync ${item.action}:`, e)
        }
      }
    } finally {
      setSyncInProgress(false)
    }
  }, [isOnline, pendingSync, syncInProgress])

  // Obter dados (online ou offline)
  const getData = useCallback((key) => {
    if (isOnline) {
      // Retornar undefined para buscar da API
      return undefined
    }

    // Retornar dados offline se disponíveis
    const cached = offlineData[key]
    if (cached) {
      return cached.data
    }

    return undefined
  }, [isOnline, offlineData])

  // Limpar dados offline
  const clearOfflineData = useCallback(() => {
    setOfflineData({})
    localStorage.removeItem('scoutfut-offline-data')
  }, [])

  // Limpar sync pendente
  const clearPending = useCallback(() => {
    setPendingSync([])
    localStorage.removeItem('scoutfut-pending-sync')
  }, [])

  return {
    isOnline,
    pendingSync,
    offlineData,
    syncInProgress,
    cacheData,
    addPending,
    syncPendingData,
    getData,
    clearOfflineData,
    clearPending,
  }
}
