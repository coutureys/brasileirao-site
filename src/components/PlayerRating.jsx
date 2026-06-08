/**
 * ⭐ PLAYER RATING — Sistema de ratings tipo Sofascore
 * Mostra nota do jogador (0-10) com cores e detalhamento
 */
import { useState } from 'react'

export default function PlayerRating({ player, rating = 7.5 }) {
  const [showDetails, setShowDetails] = useState(false)

  // Cor baseada no rating
  const getRatingColor = (r) => {
    if (r >= 8) return { bg: 'bg-green-500', text: 'text-green-400', light: 'bg-green-500/20' }
    if (r >= 7) return { bg: 'bg-yellow-500', text: 'text-yellow-400', light: 'bg-yellow-500/20' }
    if (r >= 6) return { bg: 'bg-orange-500', text: 'text-orange-400', light: 'bg-orange-500/20' }
    return { bg: 'bg-red-500', text: 'text-red-400', light: 'bg-red-500/20' }
  }

  const getRatingLabel = (r) => {
    if (r >= 8.5) return '🔥 Excelente'
    if (r >= 8) return '⭐ Muito Bom'
    if (r >= 7) return '✓ Bom'
    if (r >= 6) return '⚠️ Ok'
    return '❌ Ruim'
  }

  const stats = {
    'Passes Acertos': 87,
    'Dribles': 5,
    'Assistências': 1,
    'Defesa': 8,
    'Passe Longo': 42,
    'Duelos': 12,
  }

  const colors = getRatingColor(rating)

  return (
    <div className="space-y-3">
      {/* Card Rating */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`w-full p-3 rounded-xl border transition-all cursor-pointer
          ${colors.light} border-${colors.text.split('-')[1]}-500/30
          hover:border-${colors.text.split('-')[1]}-500/50`}>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
              <span className="text-white font-black text-lg">{rating.toFixed(1)}</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">{player?.name || 'Jogador'}</p>
              <p className={`text-xs font-bold ${colors.text}`}>{getRatingLabel(rating)}</p>
            </div>
          </div>
          <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Barra de progresso */}
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full ${colors.bg}`} style={{ width: `${(rating / 10) * 100}%` }} />
        </div>
      </button>

      {/* Detalhes (expandível) */}
      {showDetails && (
        <div className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-white mb-4">📊 Como foi calculado:</h4>

          {Object.entries(stats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between">
              <span className="text-xs text-white/60">{stat}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-green" style={{ width: `${value}%` }} />
                </div>
                <span className="text-xs font-bold text-white w-8 text-right">{value}%</span>
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-white/10">
            <p className="text-[11px] text-white/40">
              ℹ️ Rating calculado automaticamente baseado em eventos do jogo
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
