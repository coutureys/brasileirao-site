/**
 * 🔔 USE ALERTS — Sistema de alertas em tempo real
 */
import { useState, useCallback, useEffect } from 'react'

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [preferences, setPreferences] = useState({
    goals: true,
    redCards: true,
    yellowCards: false,
    substitutions: false,
    injuries: true,
    lineupChanges: false,
    sound: true,
    desktop: true,
  })

  // Carregar preferências salvas
  useEffect(() => {
    const saved = localStorage.getItem('scoutfut-alert-preferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (e) {
        console.error('[Alerts] Failed to load preferences:', e)
      }
    }

    // Solicitar permissão de notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Salvar preferências
  const updatePreferences = useCallback((newPrefs) => {
    const updated = { ...preferences, ...newPrefs }
    setPreferences(updated)
    localStorage.setItem('scoutfut-alert-preferences', JSON.stringify(updated))
  }, [preferences])

  // Adicionar alerta
  const addAlert = useCallback((alert) => {
    const {
      type, // 'goal', 'red-card', 'yellow-card', 'substitution', 'injury', 'lineup'
      title,
      message,
      team,
      player,
      icon = '⚽',
      priority = 'normal', // low, normal, high
    } = alert

    // Verificar se deve mostrar baseado em preferências
    const shouldShow = {
      'goal': preferences.goals,
      'red-card': preferences.redCards,
      'yellow-card': preferences.yellowCards,
      'substitution': preferences.substitutions,
      'injury': preferences.injuries,
      'lineup': preferences.lineupChanges,
    }[type]

    if (!shouldShow) return

    const newAlert = {
      id: `${type}-${Date.now()}`,
      type,
      title,
      message,
      team,
      player,
      icon,
      priority,
      timestamp: new Date(),
      read: false,
    }

    setAlerts(prev => [newAlert, ...prev].slice(0, 50)) // Manter apenas 50

    // Desktop notification
    if (preferences.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/logo-192.png',
        tag: newAlert.id,
        badge: '/badge-72.png',
      }).onclick = () => {
        window.focus()
      }
    }

    // Som
    if (preferences.sound) {
      playNotificationSound(priority)
    }
  }, [preferences])

  // Tocar som
  const playNotificationSound = (priority) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    const freq = priority === 'high' ? 800 : 600
    oscillator.frequency.value = freq
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  // Marcar como lido
  const markAsRead = useCallback((alertId) => {
    setAlerts(prev =>
      prev.map(a => a.id === alertId ? { ...a, read: true } : a)
    )
  }, [])

  // Limpar todos
  const clearAll = useCallback(() => {
    setAlerts([])
  }, [])

  // Contar não lidos
  const unreadCount = alerts.filter(a => !a.read).length

  return {
    alerts,
    unreadCount,
    preferences,
    updatePreferences,
    addAlert,
    markAsRead,
    clearAll,
  }
}
