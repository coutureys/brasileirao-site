import { useState } from 'react'
import { useMatches, useStandings } from '../hooks/useFootball'
import { SkeletonCard, ApiStatusBar } from './Skeleton'
import { PredictionModal } from './Prediction'

export default function NextMatches({ league = 'bra.1', leagueInfo }) {
  const { matches, loading, error, source, refetch } = useMatches(league)
  const { standings } = useStandings(league)
  const upcoming = (matches ?? []).filter((m) => m.status === 'SCHEDULED').slice(0, 6)
  const [predMatch, setPredMatch] = useState(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [simHome, setSimHome] = useState('')
  const [simAway, setSimAway] = useState('')

  const teams = (standings ?? []).map(s => s.team).filter(Boolean)

  function handleSimulate() {
    if (!simHome || !simAway || simHome === simAway) return
    const homeTeam = standings.find(s => s.team === simHome)
    const awayTeam = standings.find(s => s.team === simAway)
    setPredMatch({
      home: { name: simHome, crest: homeTeam?.crest ?? null },
      away: { name: simAway, crest: awayTeam?.crest ?? null },
      stadium: '—', round: 'Simulação',
    })
  }

  return (
    <section id="proximos" className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-tag" style={leagueInfo ? { color: leagueInfo.color } : {}}>
              {leagueInfo?.flag} Em breve · {leagueInfo?.short ?? 'Série A'}
            </p>
            <h2 className="section-title mt-1">Próximos Jogos</h2>
            <ApiStatusBar source={source} error={error} league="Série A" refetch={refetch} />
          </div>
          {/* Botão simulador */}
          <button onClick={() => setShowSimulator(s => !s)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                             bg-brand-accent border border-brand-border text-sm font-bold
                             hover:border-brand-green/30 hover:text-brand-green transition-all">
            🔮 Simular Palpite
          </button>
        </div>

        {/* Simulador de palpite */}
        {showSimulator && teams.length > 0 && (
          <div className="card p-5 mb-6 border-brand-green/15">
            <p className="text-sm font-black text-brand-green mb-4">🔮 Simular confronto</p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select value={simHome} onChange={e => setSimHome(e.target.value)}
                      className="flex-1 w-full bg-white/5 border border-brand-border rounded-xl
                                 px-4 py-2.5 text-sm text-white focus:outline-none
                                 focus:border-brand-green/50 transition">
                <option value="" className="bg-brand-card">Mandante...</option>
                {teams.filter(t => t !== simAway).map(t => (
                  <option key={t} value={t} className="bg-brand-card">{t}</option>
                ))}
              </select>

              <span className="text-white/30 font-black text-sm flex-shrink-0">VS</span>

              <select value={simAway} onChange={e => setSimAway(e.target.value)}
                      className="flex-1 w-full bg-white/5 border border-brand-border rounded-xl
                                 px-4 py-2.5 text-sm text-white focus:outline-none
                                 focus:border-brand-green/50 transition">
                <option value="" className="bg-brand-card">Visitante...</option>
                {teams.filter(t => t !== simHome).map(t => (
                  <option key={t} value={t} className="bg-brand-card">{t}</option>
                ))}
              </select>

              <button onClick={handleSimulate}
                      disabled={!simHome || !simAway || simHome === simAway}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-green
                                 text-white font-black text-sm hover:bg-brand-redHover
                                 active:scale-95 transition-all disabled:opacity-40
                                 disabled:cursor-not-allowed flex-shrink-0">
                Ver Palpite →
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-white/50 font-semibold">Nenhum jogo agendado no momento</p>
            <p className="text-white/30 text-sm mt-1">Use o <span className="text-brand-green font-bold">Simular Palpite</span> acima para testar confrontos!</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="sm:hidden space-y-2">
              {upcoming.map((m) => (
                <MatchRow key={m.id} match={m} onPredict={() => setPredMatch(m)} />
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} onPredict={() => setPredMatch(m)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal palpite */}
      {predMatch && (
        <PredictionModal
          match={predMatch}
          standings={standings ?? []}
          onClose={() => setPredMatch(null)}
        />
      )}
    </section>
  )
}

/* ── Mobile row ──────────────────────────────────────────────────────── */
function MatchRow({ match, onPredict }) {
  return (
    <div className="card px-4 py-3 flex items-center gap-3">
      <div className="text-center flex-shrink-0 w-14">
        <p className="text-[10px] text-white/40 uppercase">{match.date}</p>
        <p className={`font-bold text-brand-green ${match.timeTbd ? 'text-[9px] leading-tight' : 'text-sm'}`}>{match.kickoff}</p>
      </div>

      <div className="w-px h-8 bg-white/10 flex-shrink-0" />

      <div className="flex-shrink-0">
        <TeamIcon crest={match.home.crest} name={match.home.name} />
      </div>

      <span className="text-white/30 text-xs font-bold flex-shrink-0 w-6 text-center">VS</span>

      <div className="flex-shrink-0">
        <TeamIcon crest={match.away.crest} name={match.away.name} />
      </div>

      <div className="flex-1" />

      {/* Botão palpite mobile */}
      <button onClick={onPredict}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-brand-green/10
                         border border-brand-green/20 text-brand-green text-[10px]
                         font-black hover:bg-brand-green/20 transition active:scale-95">
        🔮
      </button>
    </div>
  )
}

/* ── Desktop card ────────────────────────────────────────────────────── */
function MatchCard({ match, onPredict }) {
  return (
    <div className="card p-5 hover:border-brand-green/30 hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="text-white/50 font-semibold uppercase tracking-wider">{match.round}</span>
        <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/70 font-semibold">{match.date}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <TeamSide team={match.home} />
        <div className="text-center px-2 flex-shrink-0">
          <div className={`font-extrabold text-brand-green ${match.timeTbd ? 'text-sm' : 'text-xl'}`}>{match.kickoff}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">vs</div>
        </div>
        <TeamSide team={match.away} />
      </div>

      {match.stadium && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-white/40">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{match.stadium}</span>
        </div>
      )}

      {/* Botão palpite */}
      <button onClick={onPredict}
              className="mt-4 w-full py-2 rounded-xl bg-brand-green/8 border border-brand-green/15
                         text-brand-green text-xs font-black hover:bg-brand-green/15
                         transition active:scale-95 flex items-center justify-center gap-2">
        <span>🔮</span> Ver Palpite Inteligente
      </button>
    </div>
  )
}

function TeamSide({ team }) {
  return (
    <div className="flex-1 text-center">
      <TeamIcon crest={team.crest} name={team.name} size="lg" className="mx-auto mb-1.5" />
      <p className="font-bold text-sm truncate">{team.name}</p>
    </div>
  )
}

function TeamIcon({ crest, name, size = 'sm', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const s = size === 'lg' ? 'w-10 h-10' : 'w-7 h-7'
  const showFallback = !crest || imgFailed

  return (
    <div className={`${s} rounded-full bg-white/10 flex items-center justify-center
                     text-xs font-bold flex-shrink-0 ${className} relative`}>
      {crest && !imgFailed && (
        <img src={crest} alt="" className={`${s} object-contain absolute inset-0`}
             onError={() => setImgFailed(true)} />
      )}
      {showFallback && <span className="relative z-10">{name?.[0]}</span>}
    </div>
  )
}
