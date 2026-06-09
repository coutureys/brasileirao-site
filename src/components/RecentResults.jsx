/**
 * 📋 RECENT RESULTS — Últimos resultados de cada liga (simples e visual)
 */
import { useState, useEffect } from 'react'
import { LEAGUES } from '../leagues'

export default function RecentResults() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

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
                key={`${match.id}-${idx}`}
                className="card p-4 hover:bg-white/3 transition cursor-pointer flex items-center gap-4">

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

                {/* Data */}
                <span className="text-xs text-white/30 flex-shrink-0">
                  {match.date}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
