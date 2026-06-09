/**
 * 📋 RECENT RESULTS — Últimos resultados de cada liga (simples e visual)
 */
import { useState, useEffect } from 'react'
import { LEAGUES } from '../leagues'
import MatchDetails from './MatchDetails'

// Converte o formato cru da API para o formato que o MatchDetails espera
function toDetails(m) {
  const d = m.utcDate ? new Date(m.utcDate) : null
  return {
    id:      m.espnId ?? m.id,
    status:  m.status ?? 'FINISHED',
    stadium: m.venue ?? '—',
    date: d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' }) : '',
    kickoff: d ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) : '',
    home: { name: m.homeTeam?.name ?? '—', crest: m.homeTeam?.crest ?? null, score: m.homeTeam?.score ?? null },
    away: { name: m.awayTeam?.name ?? '—', crest: m.awayTeam?.crest ?? null, score: m.awayTeam?.score ?? null },
  }
}

export default function RecentResults() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const leaguesToFetch = ['bra.1']
        const allResults = {}

        for (const league of leaguesToFetch) {
          try {
            const r = await fetch(`/api/pl/matches?league=${league}`)
            const data = await r.json()
            const finished = (data.results || []).slice(0, 3)
            allResults[league] = finished
          } catch (err) {
            allResults[league] = []
          }
        }

        setResults(allResults)
        setLoading(false)
      } catch (err) {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  const leagueIds = ['bra.1']

  if (loading) return null

  // Coleta TODOS os resultados em ordem de data
  const allMatches = []
  leagueIds.forEach(leagueId => {
    const league = LEAGUES.find(l => l.id === leagueId)
    const matches = results[leagueId] || []
    matches.forEach(match => {
      allMatches.push({ ...match, league })
    })
  })

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-6">📋 Últimos Resultados</h2>

      {allMatches.length === 0 ? (
        <div className="text-center py-6 text-white/40 text-sm">
          Sem resultados no momento
        </div>
      ) : (
        <div className="space-y-2">
          {allMatches.map((match, idx) => {
            const homeWin = match.homeTeam?.score > match.awayTeam?.score
            const awayWin = match.awayTeam?.score > match.homeTeam?.score

            return (
              <div
                key={`${match.espnId ?? match.id}-${idx}`}
                onClick={() => setSelected(toDetails(match))}
                className="card p-4 hover:bg-white/[0.04] hover:border-brand-green/20 transition cursor-pointer flex items-center gap-4 group">

                {/* Liga Badge */}
                <div className="flex items-center gap-1.5 flex-shrink-0 bg-white/5 px-2.5 py-1.5 rounded-lg">
                  <span className="text-sm">{match.league?.flag}</span>
                  <span className="text-xs font-bold text-white/60">{match.league?.short}</span>
                </div>

                {/* Time Home */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {match.homeTeam?.crest && (
                    <img
                      src={match.homeTeam?.crest}
                      alt=""
                      className="w-7 h-7 flex-shrink-0 object-contain"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <span className="text-sm font-bold text-white truncate">
                    {match.homeTeam?.name}
                  </span>
                </div>

                {/* Placar Destaque */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`w-9 h-9 flex items-center justify-center text-lg font-black rounded-lg tabular-nums ${
                    homeWin ? 'bg-brand-green/20 text-brand-green' : 'text-white/70'
                  }`}>
                    {match.homeTeam?.score}
                  </span>
                  <span className="text-white/30 text-sm font-bold">—</span>
                  <span className={`w-9 h-9 flex items-center justify-center text-lg font-black rounded-lg tabular-nums ${
                    awayWin ? 'bg-brand-green/20 text-brand-green' : 'text-white/70'
                  }`}>
                    {match.awayTeam?.score}
                  </span>
                </div>

                {/* Time Away */}
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="text-sm font-bold text-white truncate text-right">
                    {match.awayTeam?.name}
                  </span>
                  {match.awayTeam?.crest && (
                    <img
                      src={match.awayTeam?.crest}
                      alt=""
                      className="w-7 h-7 flex-shrink-0 object-contain"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                </div>

                {/* Indicador de clique → estatísticas */}
                <div className="flex items-center gap-1 text-white/20 group-hover:text-brand-green flex-shrink-0 transition-colors">
                  <span className="text-[10px] font-bold hidden sm:inline">Stats</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de detalhes (estatísticas reais + timeline) */}
      {selected && <MatchDetails match={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
