import { useState } from 'react'
import { useStandings } from '../hooks/useFootball'
import Tooltip from './Tooltip'

/**
 * 🏆 COPA ELIMINATION — Árvore de eliminação
 * Mostra todas as rodadas: Primeira → Final
 */
export default function CopaElimination({ league = 'bra.copa', leagueInfo }) {
  const { noTable, knockout, rounds, loading, error, refetch } = useStandings(league)

  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-12 text-center animate-pulse text-white/30">
            Carregando eliminatórias...
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-10 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-bold text-white/60">Erro ao carregar eliminatórias</p>
            <p className="text-sm text-white/40 mt-2">{error}</p>
            <button onClick={refetch}
                    className="mt-4 px-4 py-2 rounded-xl bg-brand-green text-white font-bold text-sm">
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Se não tem dados de knockout, mostra aviso
  if (!noTable || !knockout || !rounds || rounds.length === 0) {
    return (
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-10 text-center">
            <p className="text-4xl mb-3">⏳</p>
            <p className="font-bold text-white/60">Eliminatórias ainda não agendadas</p>
            <p className="text-sm text-white/40 mt-2">Confira novamente em breve</p>
            <button onClick={refetch}
                    className="mt-4 px-4 py-2 rounded-xl bg-brand-green text-white font-bold text-sm">
              Atualizar
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Mapa de nomes de rodadas
  const phaseNames = {
    'Primeira Fase': '🔴 1ª Fase',
    'Segunda Fase': '🟠 2ª Fase',
    'Terceira Fase': '🟡 3ª Fase',
    'Oitavas': '🟢 Oitavas',
    'Quartas': '🔵 Quartas',
    'Semifinal': '🟣 Semifinal',
    'Final': '👑 Final',
  }

  return (
    <section id="copa-eliminacao" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="section-tag" style={leagueInfo ? { color: leagueInfo.color } : {}}>
            {leagueInfo?.flag} {leagueInfo?.name ?? 'Copa'} 2025-26
          </p>
          <h2 className="section-title mt-1">Árvore de Eliminação</h2>
        </div>

        {/* Rodadas */}
        <div className="space-y-8">
          {rounds.map((round, roundIdx) => {
            const phaseName = phaseNames[round.name] || round.name
            const isDone = round.games.every(g => g.status === 'FINISHED')
            const isLive = round.games.some(g => g.status === 'IN_PLAY')

            return (
              <div key={roundIdx} className="card overflow-hidden">
                {/* Header da rodada */}
                <div className={`px-6 py-4 border-b border-white/10 flex items-center justify-between ${
                  isLive ? 'bg-red-500/10' : isDone ? 'bg-white/5' : 'bg-brand-accent'
                }`}>
                  <h3 className="font-black text-lg text-white">{phaseName}</h3>
                  <div className="flex items-center gap-2">
                    {isLive && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-red-500/30 text-red-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        AO VIVO
                      </span>
                    )}
                    {isDone && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-brand-green/20 text-brand-green font-bold">
                        ✓ Concluída
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/60 font-bold">
                      {round.games.length} jogos
                    </span>
                  </div>
                </div>

                {/* Jogos */}
                <div className="divide-y divide-white/5">
                  {round.games.map((match, i) => (
                    <ElimMatch key={i} match={match} leagueInfo={leagueInfo} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-500/8 border border-blue-500/20 rounded-2xl p-4 text-sm text-white/60">
          <p className="font-bold text-white mb-2">ℹ️ Como funciona:</p>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>Competição 100% eliminatória desde o começo</li>
            <li>O time que vence avança para próxima rodada</li>
            <li>Derrotas = fim da competição</li>
            <li>Rodadas com 1 jogo = semifinal/final</li>
          </ul>
        </div>

      </div>
    </section>
  )
}

// ── Jogo de Eliminação ─────────────────────────────────────────────────
function ElimMatch({ match, leagueInfo }) {
  const homeWin = match.home.score > match.away.score
  const awayWin = match.away.score > match.home.score
  const isDone = match.status === 'FINISHED'
  const isLive = match.status === 'IN_PLAY'

  return (
    <div className="px-6 py-4 hover:bg-white/5 transition">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Casa */}
        <div className="flex-1 min-w-[140px] text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            {match.home.crest ? (
              <img src={match.home.crest} alt="" className="w-6 h-6 object-contain" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                {match.home.abbr?.[0] ?? '?'}
              </div>
            )}
            <p className={`font-bold text-sm ${homeWin && isDone ? 'text-brand-green' : 'text-white/70'}`}>
              {match.home.name}
            </p>
          </div>
          {isDone && (
            <p className={`text-[10px] ${homeWin ? 'text-brand-green' : 'text-red-400/70'}`}>
              {homeWin ? '✅ Avançou' : '❌ Eliminado'}
            </p>
          )}
        </div>

        {/* Placar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDone || isLive ? (
            <>
              <span className={`text-xl font-black tabular-nums ${homeWin ? 'text-brand-green' : 'text-white/70'}`}>
                {match.home.score}
              </span>
              <span className="text-white/20">–</span>
              <span className={`text-xl font-black tabular-nums ${awayWin ? 'text-brand-green' : 'text-white/70'}`}>
                {match.away.score}
              </span>
            </>
          ) : (
            <Tooltip text={`${match.date}`} position="top">
              <span className="text-white/40 text-sm font-bold cursor-help">vs</span>
            </Tooltip>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 min-w-[140px] text-left">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-bold text-sm ${awayWin && isDone ? 'text-brand-green' : 'text-white/70'}`}>
              {match.away.name}
            </p>
            {match.away.crest ? (
              <img src={match.away.crest} alt="" className="w-6 h-6 object-contain" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                {match.away.abbr?.[0] ?? '?'}
              </div>
            )}
          </div>
          {isDone && (
            <p className={`text-[10px] ${awayWin ? 'text-brand-green' : 'text-red-400/70'}`}>
              {awayWin ? '✅ Avançou' : '❌ Eliminado'}
            </p>
          )}
        </div>

        {/* Status badge */}
        {isLive && (
          <span className="flex-shrink-0 text-xs px-2 py-1 rounded-lg bg-red-500/30 text-red-400 font-bold">
            AO VIVO
          </span>
        )}
      </div>
    </div>
  )
}
