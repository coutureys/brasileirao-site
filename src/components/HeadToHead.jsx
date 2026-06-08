/**
 * ⚔️ HEAD TO HEAD — Comparação time vs time
 */
import { useState } from 'react'

export default function HeadToHead({ team1 = 'Flamengo', team2 = 'Botafogo' }) {
  const [view, setView] = useState('overall') // overall, recent, h2h

  // Mock data
  const data = {
    overall: {
      team1Wins: 32,
      team2Wins: 18,
      draws: 15,
      team1GoalsFor: 95,
      team2GoalsFor: 72,
    },
    recent: {
      team1: [
        { opponent: 'São Paulo', score: '2-1', date: '2026-06-05', result: 'V' },
        { opponent: 'Palmeiras', score: '1-1', date: '2026-06-02', result: 'E' },
        { opponent: 'Corinthians', score: '3-0', date: '2026-05-29', result: 'V' },
      ],
      team2: [
        { opponent: 'Grêmio', score: '1-2', date: '2026-06-04', result: 'D' },
        { opponent: 'Internacional', score: '0-0', date: '2026-06-01', result: 'E' },
        { opponent: 'Atletico Mineiro', score: '2-1', date: '2026-05-28', result: 'V' },
      ],
    },
  }

  const overall = data.overall
  const recent = data.recent
  const totalMatches = overall.team1Wins + overall.team2Wins + overall.draws

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white mb-2">{team1} × {team2}</h2>
        <p className="text-sm text-white/40">Histórico completo</p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'overall', label: '📊 Geral', icon: '📈' },
          { id: 'recent', label: '⏰ Recentes', icon: '🔄' },
          { id: 'h2h', label: '⚔️ Diretos', icon: '🎯' },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all
              ${view === v.id
                ? 'bg-brand-green text-brand-dark'
                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Overall Stats */}
      {view === 'overall' && (
        <div className="space-y-4">
          {/* Win-Loss Record */}
          <div className="bg-white/3 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-6 text-center">Histórico de Confrontos</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Wins */}
              <div className="text-center">
                <p className="text-3xl font-black text-green-400 mb-1">{overall.team1Wins}</p>
                <p className="text-xs text-white/40">Vitórias</p>
              </div>

              {/* Draws */}
              <div className="text-center">
                <p className="text-3xl font-black text-yellow-400 mb-1">{overall.draws}</p>
                <p className="text-xs text-white/40">Empates</p>
              </div>

              {/* Losses */}
              <div className="text-center">
                <p className="text-3xl font-black text-red-400 mb-1">{overall.team2Wins}</p>
                <p className="text-xs text-white/40">Derrotas</p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex h-6 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-green-500"
                style={{ width: `${(overall.team1Wins / totalMatches) * 100}%` }}
              />
              <div
                className="bg-yellow-500"
                style={{ width: `${(overall.draws / totalMatches) * 100}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${(overall.team2Wins / totalMatches) * 100}%` }}
              />
            </div>

            <p className="text-xs text-white/40 mt-3 text-center">
              Total: {totalMatches} jogos
            </p>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-2 gap-4">
            <StatBox
              team={team1}
              label="Gols Marcados"
              value={overall.team1GoalsFor}
              color="green"
            />
            <StatBox
              team={team2}
              label="Gols Marcados"
              value={overall.team2GoalsFor}
              color="red"
            />
          </div>
        </div>
      )}

      {/* Recent Matches */}
      {view === 'recent' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white mb-3">{team1} — Últimos jogos</h3>
            {recent.team1.map((match, i) => (
              <div key={i} className="bg-white/3 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{match.opponent}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded
                    ${match.result === 'V' ? 'bg-green-500/20 text-green-400'
                    : match.result === 'E' ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'}`}>
                    {match.result}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-white">{match.score}</span>
                  <span className="text-xs text-white/40">{match.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white mb-3">{team2} — Últimos jogos</h3>
            {recent.team2.map((match, i) => (
              <div key={i} className="bg-white/3 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{match.opponent}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded
                    ${match.result === 'V' ? 'bg-green-500/20 text-green-400'
                    : match.result === 'E' ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'}`}>
                    {match.result}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-white">{match.score}</span>
                  <span className="text-xs text-white/40">{match.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* H2H */}
      {view === 'h2h' && (
        <div className="bg-white/3 border border-white/10 rounded-xl p-6 text-center">
          <p className="text-white/60 mb-4">Próximo confronto direto:</p>
          <p className="text-2xl font-black text-white mb-2">{team1} × {team2}</p>
          <p className="text-sm text-white/40">Rodada 32 • 15 de junho de 2026</p>
          <button className="mt-4 px-6 py-2 bg-brand-green text-brand-dark font-bold rounded-lg hover:bg-green-400 transition">
            🗓️ Adicionar Calendário
          </button>
        </div>
      )}
    </div>
  )
}

function StatBox({ team, label, value, color }) {
  const colorClass = color === 'green' ? 'text-green-400' : 'text-red-400'
  return (
    <div className="bg-white/3 border border-white/10 rounded-xl p-4 text-center">
      <p className="text-xs text-white/40 mb-2">{label}</p>
      <p className={`text-3xl font-black ${colorClass} mb-1`}>{value}</p>
      <p className="text-xs text-white/50">{team}</p>
    </div>
  )
}
