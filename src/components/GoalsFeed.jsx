/**
 * 🎯 GOALS FEED — Feed de gols em tempo real tipo Twitter
 */
import { useState, useEffect } from 'react'

export default function GoalsFeed() {
  const [goals, setGoals] = useState([])
  const [filter, setFilter] = useState('all') // all, favorites, league

  // Mock de dados
  const mockGoals = [
    {
      id: 1,
      time: '89\'',
      player: 'Vinícius Júnior',
      team: 'Flamengo',
      opponent: 'Botafogo',
      logo: '🔴',
      type: 'gol',
      minute: 89,
      status: 'live',
      timestamp: new Date(Date.now() - 2 * 60000),
    },
    {
      id: 2,
      time: '76\'',
      player: 'Dudu',
      team: 'Palmeiras',
      opponent: 'São Paulo',
      logo: '🟢',
      type: 'gol',
      minute: 76,
      status: 'live',
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: 3,
      time: '65\'',
      player: 'Neymar',
      team: 'Santos',
      opponent: 'Corinthians',
      logo: '⚪',
      type: 'cartão',
      minute: 65,
      status: 'recent',
      timestamp: new Date(Date.now() - 30 * 60000),
    },
    {
      id: 4,
      time: '45+2\'',
      player: 'Hulk',
      team: 'Atletico Mineiro',
      opponent: 'Grêmio',
      logo: '🔵',
      type: 'gol',
      minute: 47,
      status: 'recent',
      timestamp: new Date(Date.now() - 45 * 60000),
    },
  ]

  useEffect(() => {
    setGoals(mockGoals)

    // Simular novos gols
    const interval = setInterval(() => {
      const newGoal = {
        id: Math.random(),
        time: "90'",
        player: 'Novo Gol',
        team: 'Time Aleatório',
        opponent: 'Outro Time',
        type: 'gol',
        status: 'live',
        timestamp: new Date(),
      }
      // Descomentar para teste: setGoals(prev => [newGoal, ...prev])
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const filteredGoals = goals.filter(goal => {
    if (filter === 'favorites') return false // TODO: Implementar favoritos
    if (filter === 'league') return true
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <div className="flex items-center gap-2 pb-4 border-b border-white/10 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0
            ${filter === 'all'
              ? 'bg-brand-green text-brand-dark'
              : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          🎯 Todos
        </button>
        <button
          onClick={() => setFilter('favorites')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0
            ${filter === 'favorites'
              ? 'bg-brand-green text-brand-dark'
              : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          ⭐ Favoritos
        </button>
        <button
          onClick={() => setFilter('league')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0
            ${filter === 'league'
              ? 'bg-brand-green text-brand-dark'
              : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          🏆 Série A
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filteredGoals.map(goal => (
          <div
            key={goal.id}
            className="card p-4 hover:bg-white/5 transition-all cursor-pointer group"
          >
            {/* Badge live */}
            {goal.status === 'live' && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-400">AO VIVO</span>
              </div>
            )}

            {/* Conteúdo */}
            <div className="flex items-start gap-3">
              {/* Avatar/Logo */}
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                {goal.logo}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-sm font-black text-white">{goal.player}</p>
                  <span className="text-xs text-white/40">({goal.team})</span>
                </div>

                <p className="text-xs text-white/60 mb-2">
                  {goal.team} x {goal.opponent}
                </p>

                {/* Type badge */}
                {goal.type === 'gol' && (
                  <div className="inline-block px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs font-bold text-green-400 mb-2">
                    ⚽ Gol — {goal.time}
                  </div>
                )}
                {goal.type === 'cartão' && (
                  <div className="inline-block px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs font-bold text-yellow-400 mb-2">
                    🟨 Amarelo — {goal.time}
                  </div>
                )}
              </div>

              {/* Tempo */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-white/40">
                  {Math.floor((Date.now() - goal.timestamp) / 60000)}m atrás
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded text-white/60 transition">
                ❤️ Gostei
              </button>
              <button className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded text-white/60 transition">
                💬 Comentar
              </button>
              <button className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded text-white/60 transition">
                🔗 Compartilhar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
