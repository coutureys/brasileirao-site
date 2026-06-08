/**
 * 📴 OFFLINE INDICATOR — Mostrar status offline
 */
import { useEffect, useState } from 'react'
import { useOffline } from '../hooks/useOffline'

export default function OfflineIndicator() {
  const { isOnline, pendingSync, syncPendingData, clearPending } = useOffline()
  const [showBanner, setShowBanner] = useState(!isOnline)

  useEffect(() => {
    setShowBanner(!isOnline)
  }, [isOnline])

  if (isOnline && pendingSync.length === 0) {
    return null
  }

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40
        p-4 rounded-xl border transition-all animate-slide-up
        ${isOnline
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-yellow-500/10 border-yellow-500/30'}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-lg flex-shrink-0">
          {isOnline ? '✅' : '📴'}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${
            isOnline ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {isOnline ? 'Conectado' : 'Sem Conexão'}
          </p>

          <p className={`text-xs ${
            isOnline ? 'text-green-400/60' : 'text-yellow-400/60'
          } mt-0.5`}>
            {isOnline
              ? pendingSync.length > 0
                ? `${pendingSync.length} items aguardando sincronização`
                : 'Todos os dados sincronizados'
              : 'Usando dados offline • Alterações serão sincronizadas'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOnline && pendingSync.length > 0 && (
            <button
              onClick={syncPendingData}
              className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition font-bold"
            >
              🔄 Sincronizar
            </button>
          )}

          {pendingSync.length > 0 && (
            <button
              onClick={clearPending}
              className="px-3 py-1.5 text-xs bg-white/10 text-white/60 rounded hover:bg-white/20 transition font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Pending Items Detail */}
      {pendingSync.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10 max-h-32 overflow-y-auto space-y-1">
          <p className="text-xs text-white/40 font-bold">Pendente:</p>
          {pendingSync.slice(0, 3).map(item => (
            <div key={item.id} className="text-xs text-white/50 flex items-center gap-2">
              <span>•</span>
              <span className="capitalize">{item.action}</span>
              {isOnline && (
                <span className="text-green-400 ml-auto">⏳ Sincronizando...</span>
              )}
            </div>
          ))}
          {pendingSync.length > 3 && (
            <p className="text-xs text-white/40 mt-1">
              +{pendingSync.length - 3} mais...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
