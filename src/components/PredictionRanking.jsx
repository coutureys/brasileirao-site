/**
 * 🎯 PREDICTION RANKING — Rankings de palpites com scoring
 */
import { useState } from 'react'

export default function PredictionRanking() {
  const [timeframe, setTimeframe] = useState('season') // week, month, season
  const [league, setLeague] = useState('all')

  // Mock data
  const rankings = [
    {
      rank: 1,
      user: 'scout_master',
      avatar: '👤',
      accuracy: 78.5,
      predictions: 156,
      correct: 123,
      points: 2450,
      streak: 12,
      badge: '🏆 Lenda',
    },
    {
      rank: 2,
      user: 'football_analyst',
      avatar: '📊',
      accuracy: 76.2,
      predictions: 142,
      correct: 108,
      points: 2180,
      streak: 8,
      badge: '⭐ Ouro',
    },
    {
      rank: 3,
      user: 'tactical_genius',
      avatar: '⚙️',
      accuracy: 74.8,
      predictions: 138,
      correct: 103,
      points: 2040,
      streak: 5,
      badge: '💎 Prata',
    },
    {
      rank: 4,
      user: 'futebol_lover',
      avatar: '⚽',
      accuracy: 71.3,
      predictions: 151,
      correct: 107,
      points: 1890,
      streak: 3,
    },
    {
      rank: 5,
      user: 'match_predictor',
      avatar: '🎲',
      accuracy: 69.5,
      predictions: 145,
      correct: 101,
      points: 1750,
      streak: 2,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">🏆 Rankings</h2>
          <p className="text-xs text-white/40">Melhores palpiteiros da plataforma</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'week', label: '📅 Semana' },
          { id: 'month', label: '📆 Mês' },
          { id: 'season', label: '🏆 Temporada' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setTimeframe(f.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all
              ${timeframe === f.id
                ? 'bg-brand-green text-brand-dark'
                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rankings Table */}
      <div className="space-y-2">
        {rankings.map((entry) => (
          <div
            key={entry.rank}
            className={`card p-4 flex items-center gap-4 hover:bg-white/5 transition
              ${entry.rank <= 3 ? 'border-l-4' : ''}
              ${entry.rank === 1 ? 'border-yellow-500' : entry.rank === 2 ? 'border-gray-400' : entry.rank === 3 ? 'border-orange-400' : ''}`}
          >
            {/* Rank */}
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              {entry.rank === 1 && <span className="text-2xl">🥇</span>}
              {entry.rank === 2 && <span className="text-2xl">🥈</span>}
              {entry.rank === 3 && <span className="text-2xl">🥉</span>}
              {entry.rank > 3 && <span className="text-lg font-black text-white">{entry.rank}</span>}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{entry.avatar}</span>
                <p className="text-sm font-bold text-white">{entry.user}</p>
                {entry.badge && <span className="text-xs ml-auto">{entry.badge}</span>}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs text-white/50">
                <span>📈 {entry.accuracy}% acerto</span>
                <span>•</span>
                <span>🎯 {entry.correct}/{entry.predictions}</span>
                <span>•</span>
                <span>🔥 {entry.streak}x seguidas</span>
              </div>
            </div>

            {/* Points */}
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-brand-green">{entry.points}</p>
              <p className="text-xs text-white/40">Pontos</p>
            </div>
          </div>
        ))}
      </div>

      {/* Your Position */}
      <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4">
        <p className="text-xs text-brand-green/60 mb-2">SUA POSIÇÃO</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-white">#127</p>
            <p className="text-xs text-white/50">523 pontos • 62% acerto</p>
          </div>
          <button className="px-4 py-2 bg-brand-green text-brand-dark font-bold rounded-lg hover:bg-green-400 transition">
            🚀 Ver Meu Perfil
          </button>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white/3 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">❓ Como funciona</h3>
        <ul className="text-xs text-white/60 space-y-2">
          <li>✓ Faça palpites em placar, resultado, primeira bola, etc</li>
          <li>✓ Ganhe pontos baseado em acerto (0-100 pontos por palpite)</li>
          <li>✓ Bônus por acertos consecutivos (streak multiplier 1.5x-3x)</li>
          <li>✓ Ranking atualizado em tempo real</li>
          <li>✓ Prêmios semanais, mensais e anuais</li>
        </ul>
      </div>
    </div>
  )
}
