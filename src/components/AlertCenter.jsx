/**
 * 🔔 ALERT CENTER — Centro de controle de alertas
 */
import { useState } from 'react'
import { useAlerts } from '../hooks/useAlerts'

export default function AlertCenter() {
  const { alerts, unreadCount, preferences, updatePreferences, markAsRead, clearAll } = useAlerts()
  const [showSettings, setShowSettings] = useState(false)

  const getAlertIcon = (type) => {
    const icons = {
      'goal': '⚽',
      'red-card': '🔴',
      'yellow-card': '🟨',
      'substitution': '🔄',
      'injury': '🏥',
      'lineup': '👥',
    }
    return icons[type] || '📢'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'border-red-500/30 bg-red-500/10',
      'normal': 'border-blue-500/30 bg-blue-500/10',
      'low': 'border-white/10 bg-white/5',
    }
    return colors[priority] || colors.normal
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-black text-white">Alertas</h3>
            <p className="text-xs text-white/40">{unreadCount} não lidos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
            title="Configurações"
          >
            ⚙️
          </button>
          {alerts.length > 0 && (
            <button
              onClick={clearAll}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-xs"
              title="Limpar tudo"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Configurações */}
      {showSettings && (
        <div className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-white mb-3">Tipos de Alertas</h4>

          {[
            { key: 'goals', label: '⚽ Gols', desc: 'Quando um jogador marca' },
            { key: 'redCards', label: '🔴 Cartão Vermelho', desc: 'Expulsões' },
            { key: 'yellowCards', label: '🟨 Cartão Amarelo', desc: 'Advertências' },
            { key: 'substitutions', label: '🔄 Substituições', desc: 'Trocas de jogadores' },
            { key: 'injuries', label: '🏥 Lesões', desc: 'Jogadores machucados' },
            { key: 'lineupChanges', label: '👥 Escalações', desc: 'Alterações de time' },
          ].map(option => (
            <label key={option.key} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition">
              <input
                type="checkbox"
                checked={preferences[option.key]}
                onChange={(e) => updatePreferences({ [option.key]: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{option.label}</p>
                <p className="text-xs text-white/40">{option.desc}</p>
              </div>
            </label>
          ))}

          <div className="pt-3 border-t border-white/10 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.sound}
                onChange={(e) => updatePreferences({ sound: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-white">🔊 Som</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.desktop}
                onChange={(e) => updatePreferences({ desktop: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-white">🖥️ Notificações Desktop</span>
            </label>
          </div>
        </div>
      )}

      {/* Lista de Alertas */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-white/40">
            <p className="text-sm">Nenhum alerta ainda</p>
          </div>
        ) : (
          alerts.map(alert => (
            <button
              key={alert.id}
              onClick={() => markAsRead(alert.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all
                ${alert.read
                  ? 'bg-transparent border-white/5'
                  : `${getPriorityColor(alert.priority)} cursor-pointer`}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{getAlertIcon(alert.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${alert.read ? 'text-white/60' : 'text-white'}`}>
                    {alert.title}
                  </p>
                  <p className="text-xs text-white/40 truncate">{alert.message}</p>
                </div>
                <span className="text-xs text-white/30 flex-shrink-0">
                  {Math.floor((Date.now() - alert.timestamp) / 60000)}m
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
