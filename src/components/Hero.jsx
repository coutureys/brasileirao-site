import { useMatches } from '../hooks/useFootball'

export default function Hero() {
  const { matches } = useMatches()
  const liveNow = (matches ?? []).filter(m => m.status === 'IN_PLAY')
  const latestResult = (matches ?? []).filter(m => m.status === 'FINISHED')[0]

  return (
    <section id="inicio" className="relative overflow-hidden">
      {/* Fundo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                        bg-brand-green/5 blur-[80px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-16 sm:pb-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Texto */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-brand-green/8 border border-brand-green/15
                            text-brand-green text-xs font-bold uppercase tracking-widest mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              ScoutFut · Série A 2026
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              Futebol brasileiro{' '}
              <span className="text-gradient">em tempo real.</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-white/50 max-w-md leading-relaxed">
              Scores ao vivo, tabela atualizada e estatísticas do Brasileirão Série A — tudo num só lugar.
            </p>

            <div className="mt-7 flex gap-3">
              <a href="#ao-vivo"
                 className="flex-1 sm:flex-none text-center px-6 py-3.5 rounded-xl
                            bg-brand-green text-white font-black text-sm
                            hover:bg-brand-redHover active:scale-95 transition-all
                            shadow-glow-green">
                Scores ao vivo
              </a>
              <a href="#tabela"
                 className="flex-1 sm:flex-none text-center px-6 py-3.5 rounded-xl
                            bg-brand-accent border border-brand-border font-bold text-sm
                            hover:border-white/20 hover:bg-white/5 active:scale-95 transition-all">
                Ver tabela
              </a>
            </div>

            {/* Stats */}
            <div className="mt-8 flex items-center gap-6 sm:gap-8">
              <StatPill value="20"  label="Times"   />
              <div className="w-px h-8 bg-brand-border" />
              <StatPill value="38"  label="Rodadas" />
              <div className="w-px h-8 bg-brand-border" />
              <StatPill value="380" label="Jogos"   />
            </div>
          </div>

          {/* Card ao vivo ou último resultado */}
          <div className="hidden sm:block animate-fade-in">
            {liveNow[0] ? (
              <LiveCard match={liveNow[0]} />
            ) : latestResult ? (
              <ResultCard match={latestResult} />
            ) : (
              <PlaceholderCard />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function StatPill({ value, label }) {
  return (
    <div>
      <p className="text-2xl sm:text-3xl font-black text-brand-green tabular-nums">{value}</p>
      <p className="text-xs text-white/40 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  )
}

function LiveCard({ match }) {
  return (
    <div className="card p-6 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.08)]">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{match.round}</span>
        <span className="badge-live">AO VIVO · {match.minute}</span>
      </div>
      <MatchDisplay match={match} />
      <div className="mt-4 pt-4 divider" />
      <p className="mt-3 text-xs text-white/30 text-center">{match.stadium}</p>
    </div>
  )
}

function ResultCard({ match }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{match.round}</span>
        <span className="chip text-white/50">Encerrado</span>
      </div>
      <MatchDisplay match={match} />
      <div className="mt-4 pt-4 divider" />
      <p className="mt-3 text-xs text-white/30 text-center">{match.stadium}</p>
    </div>
  )
}

function PlaceholderCard() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Destaque</span>
        <span className="badge-live">AO VIVO</span>
      </div>
      <MatchDisplay match={{
        home: { name: 'Flamengo', crest: null, score: 2 },
        away: { name: 'Palmeiras', crest: null, score: 1 },
      }} />
    </div>
  )
}

function MatchDisplay({ match }) {
  const homeWin = match.home?.score > match.away?.score
  const awayWin = match.away?.score > match.home?.score

  return (
    <div className="flex items-center justify-between gap-4">
      <TeamHero team={match.home} winning={homeWin} align="right" />
      <div className="flex items-center gap-3 flex-shrink-0">
        <ScoreBig value={match.home?.score} win={homeWin} />
        <span className="text-brand-border text-2xl font-light">–</span>
        <ScoreBig value={match.away?.score} win={awayWin} />
      </div>
      <TeamHero team={match.away} winning={awayWin} align="left" />
    </div>
  )
}

function TeamHero({ team, winning, align }) {
  return (
    <div className={align === 'right' ? 'flex-1 flex flex-col items-end gap-2' : 'flex-1 flex flex-col items-start gap-2'}>
      {team?.crest
        ? <img src={team.crest} alt={team.name} className="w-12 h-12 object-contain" />
        : <div className="w-12 h-12 rounded-full bg-white/8 flex items-center justify-center font-black text-lg">{team?.name?.[0]}</div>
      }
      <p className={`text-sm font-bold ${winning ? 'text-white' : 'text-white/60'}`}>{team?.name}</p>
    </div>
  )
}

function ScoreBig({ value, win }) {
  return (
    <span className={`text-5xl font-black tabular-nums ${win ? 'text-brand-green' : 'text-white/70'}`}>
      {value ?? '–'}
    </span>
  )
}
