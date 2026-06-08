import { useState, useCallback, useEffect } from 'react'
import { useLiveScores } from '../hooks/useLiveScores'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { SkeletonCard } from './Skeleton'
import LiveTimer from './LiveTimer'
import MatchTimeline from './MatchTimeline'
import Comments from './Comments'
import MatchDetails from './MatchDetails'

// Importa funções de som/vibração do hook
// iOS Tri-tone (alegria) — D#5 → G5 → C6
function playGoalSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const bell = (freq, startTime, vol = 0.35) => {
      [[freq, 1.0], [freq * 2, 0.4], [freq * 3, 0.15]].forEach(([f, v]) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sine'; osc.frequency.value = f
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(vol * v, startTime + 0.005)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.55)
        osc.start(startTime); osc.stop(startTime + 0.6)
      })
    }
    bell(622,  now + 0.00, 0.35)  // D#5
    bell(784,  now + 0.18, 0.35)  // G5
    bell(1047, now + 0.36, 0.40)  // C6
  } catch(e) {}
}

const DEMO_GOALS = [
  { team: 'Palmeiras', score: '2-1' },
  { team: 'Flamengo',  score: '1-0' },
  { team: 'Botafogo',  score: '3-2' },
  { team: 'São Paulo', score: '1-1' },
]

const FILTERS = [
  { key: 'ALL',        label: 'Todos'       },
  { key: 'IN_PLAY',    label: 'Ao Vivo'     },
  { key: 'FINISHED',   label: 'Finalizados' },
  { key: 'SCHEDULED',  label: 'Em Breve'    },
]

function simulateGoal(matches, soundEnabled) {
  // Pega um time aleatório dos matches ou dos demos
  const teams = matches.filter(m => m.status !== 'SCHEDULED')
  const pick  = teams.length > 0
    ? { team: teams[Math.floor(Math.random() * teams.length)].home.name, score: `${Math.floor(Math.random()*3)+1}-${Math.floor(Math.random()*2)}` }
    : DEMO_GOALS[Math.floor(Math.random() * DEMO_GOALS.length)]

  // Som + vibração
  if (soundEnabled) playGoalSound()
  try { if (navigator.vibrate) navigator.vibrate([100,50,100,50,200]) } catch(e) {}

  // Dispara evento customizado que o componente escuta
  window.dispatchEvent(new CustomEvent('scoutfut:sim-goal', { detail: pick }))
}

export default function LiveScores({ league = 'bra.1', leagueInfo, compact = false }) {
  const [filter,       setFilter]       = useState('ALL')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [simGoals,     setSimGoals]     = useState([])
  const [timeline,     setTimeline]     = useState(null)
  const [commentsMatch,setCommentsMatch]= useState(null)
  const [selectedMatch,setSelectedMatch]= useState(null)

  const {
    matches, loading, updating, error,
    lastUpdated, changes, newGoals, refetch,
  } = useLiveScores({ soundEnabled, vibrateEnabled: true, league })

  const push = usePushNotifications()

  // Fecha modal quando muda de liga
  useEffect(() => {
    setSelectedMatch(null)
    setTimeline(null)
    setCommentsMatch(null)
  }, [league])

  // Quando detectar gol real, envia push para todos
  useState(() => {
    if (newGoals.length > 0) {
      newGoals.forEach(g => push.notifyGoal(g.team, g.score))
    }
  })

  // Escuta evento de simulação
  useState(() => {
    const handler = (e) => {
      setSimGoals([e.detail])
      setTimeout(() => setSimGoals([]), 4000)
    }
    window.addEventListener('scoutfut:sim-goal', handler)
    return () => window.removeEventListener('scoutfut:sim-goal', handler)
  })

  const allGoals = [...newGoals, ...simGoals]

  const allMatches = matches ?? []
  const liveCount  = allMatches.filter(m => m.status === 'IN_PLAY').length
  const filtered   = compact
    ? allMatches.slice(0, 4)   // Modo compacto: só 4 jogos na home
    : filter === 'ALL'
      ? allMatches
      : allMatches.filter(m => m.status === filter)

  return (
    <section id="ao-vivo" className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Filtros de status */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-brand-accent border border-brand-border mb-6">
          {FILTERS.map(f => {
            const count = f.key === 'ALL'
              ? allMatches.length
              : allMatches.filter(m => m.status === f.key).length
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === f.key
                          ? 'bg-brand-green text-brand-dark shadow'
                          : 'text-white/60 hover:text-white'}`}>
                {f.label}
                {f.key === 'LIVE' && count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    filter === f.key ? 'bg-brand-dark/20' : 'bg-red-500/20 text-red-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Toast de gol */}
        {allGoals.length > 0 && (
          <GoalToast goals={allGoals} />
        )}

        {/* Link "Ver todos" no modo compacto */}
        {compact && allMatches.length > 4 && (
          <a href="/jogos"
             className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl
                        bg-white/5 border border-brand-border text-sm font-bold text-white/50
                        hover:bg-white/8 hover:text-white transition">
            Ver todos os {allMatches.length} jogos →
          </a>
        )}

        {/* Cards */}
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-white/40">
            <p className="text-3xl mb-2">📡</p>
            <p>Erro ao carregar. <button onClick={refetch} className="text-brand-green underline">Tentar novamente</button></p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <div className="card p-10 text-center text-white/40">
                Nenhum jogo neste filtro no momento.
              </div>
            ) : filtered.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                scoreChanged={changes[match._id ?? match.id]}
                onTimeline={() => setTimeline(match)}
                onComments={() => setCommentsMatch(match)}
                onDetails={() => setSelectedMatch(match)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Match Details modal */}
      {selectedMatch && <MatchDetails match={selectedMatch} onClose={() => setSelectedMatch(null)} />}

      {/* Timeline modal */}
      {timeline && <MatchTimeline match={timeline} onClose={() => setTimeline(null)} />}

      {/* Comments modal */}
      {commentsMatch && (
        <Comments
          matchId={commentsMatch.id ?? commentsMatch._id}
          matchTitle={`${commentsMatch.home?.name} vs ${commentsMatch.away?.name}`}
          onClose={() => setCommentsMatch(null)}
        />
      )}
    </section>
  )
}

/* ── Indicador de atualização ────────────────────────────────────────────── */
function UpdateIndicator({ updating, lastUpdated, refetch }) {
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="flex items-center gap-1.5">
      {updating ? (
        <span className="flex items-center gap-1.5 text-xs text-brand-green">
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Atualizando...
        </span>
      ) : timeStr ? (
        <button onClick={refetch}
                className="flex items-center gap-1 text-xs text-white/25 hover:text-white/50 transition">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {timeStr}
        </button>
      ) : null}
    </div>
  )
}

/* ── Toast de gol ─────────────────────────────────────────────────────────── */
function GoalToast({ goals }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {goals.map((g, i) => (
        <div key={i}
             className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
                        bg-brand-green text-brand-dark font-black text-sm
                        shadow-xl shadow-brand-green/30 animate-slide-up">
          <span className="text-lg">⚽</span>
          <span>GOL! {g.team}</span>
          <span className="font-bold opacity-70">{g.score}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Match Card ──────────────────────────────────────────────────────────── */
function MatchCard({ match, scoreChanged, onTimeline, onComments, onDetails }) {
  const { home, away, status, minute, period, isHalfTime, serverTs, kickoff, date, utcDate, stadium } = match
  const isLive     = status === 'IN_PLAY'
  const isFt       = status === 'FINISHED'
  const isUpcoming = status === 'SCHEDULED'
  const homeWin    = home.score > away.score
  const awayWin    = away.score > home.score

  // Formata data completa (dd/mm/aaaa) a partir do ISO bruto, com proteção
  const matchDate = utcDate ? new Date(utcDate) : null
  const dateLabel = matchDate && !isNaN(matchDate.getTime())
    ? matchDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })
    : null

  return (
    <div onClick={onDetails}
         className={`card overflow-hidden transition-all duration-200 cursor-pointer
      ${isLive      ? 'border-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.06)]' : ''}
      ${isHalfTime  ? 'border-amber-400/20' : ''}
      hover:border-white/12 hover:bg-white/3`}>

      {isLive && !isHalfTime && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
      )}
      {isHalfTime && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      )}

      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-6">

          {/* Cronômetro / Status */}
          <div className="w-16 sm:w-20 flex-shrink-0 text-center">
            {isUpcoming ? (
              <StatusBadge status={status} kickoff={kickoff} date={date} />
            ) : (
              <LiveTimer
                minute={minute}
                serverTs={serverTs}
                isHalfTime={isHalfTime}
                status={status}
                size="sm"
              />
            )}
          </div>

          {/* Home */}
          <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3 min-w-0">
            <Crest src={home.crest} name={home.name} />
            <div className="text-right min-w-0 hidden sm:block">
              <p className="font-bold text-base truncate leading-tight">{home.name}</p>
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 flex items-center gap-1 sm:gap-3">
            {isUpcoming ? (
              <div className="text-center w-16 sm:w-auto">
                <p className="text-xl sm:text-2xl font-extrabold text-white/30">vs</p>
                <p className="text-xs text-brand-green font-bold mt-0.5">{kickoff}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-shrink-0">
                <ScoreBox
                  score={home.score}
                  winning={homeWin}
                  live={isLive}
                  flash={scoreChanged?.home}
                />
                <span className="text-white/30 text-xl font-light">—</span>
                <ScoreBox
                  score={away.score}
                  winning={awayWin}
                  live={isLive}
                  flash={scoreChanged?.away}
                />
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-1.5 sm:gap-3 min-w-0">
            <div className="min-w-0 hidden sm:block">
              <p className="font-bold text-base truncate leading-tight">{away.name}</p>
            </div>
            <Crest src={away.crest} name={away.name} />
          </div>

        </div>

        {/* Data + Stadium */}
        <div className="space-y-1 mt-2">
          {dateLabel && (
            <p className="text-[10px] sm:text-xs text-white/40">
              📅 {dateLabel}
            </p>
          )}
          {stadium && stadium !== '—' ? (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/30">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              </svg>
              {stadium}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */
function StatusBadge({ kickoff, date }) {
  return (
    <div className="space-y-1 text-center">
      <p className="text-[10px] font-semibold text-brand-green uppercase">{date}</p>
      <p className="text-xs font-bold text-white/60">{kickoff}</p>
    </div>
  )
}

function ScoreBox({ score, winning, live, flash }) {
  return (
    <div className={`
      w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center
      text-2xl sm:text-4xl font-extrabold tabular-nums transition-all duration-300
      ${flash ? 'scale-125 bg-brand-green/20 text-brand-green shadow-lg shadow-brand-green/30 animate-pulse' : ''}
      ${!flash && winning
        ? live
          ? 'bg-brand-green/15 text-brand-green shadow-md shadow-brand-green/10'
          : 'text-brand-green'
        : !flash ? 'text-white/80' : ''}
    `}>
      {score ?? '–'}
    </div>
  )
}

function GoalSummary({ goals, side }) {
  if (!goals || goals.length === 0) return null
  return (
    <div className={`flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 ${side === 'right' ? 'justify-end' : ''}`}>
      {goals.map((g, i) => (
        <span key={i} className="text-[11px] text-white/50 whitespace-nowrap">
          ⚽ {g.player} <span className="text-white/30">{g.minute}'</span>
        </span>
      ))}
    </div>
  )
}

function Crest({ src, name }) {
  if (!src) return null
  return (
    <img src={src} alt="" className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 object-contain"
         onError={e => { e.currentTarget.style.display = 'none' }} />
  )
}

/* ── Botão Push Notification ─────────────────────────────────────────────── */
function PushButton({ push }) {
  const { subscribed, loading, error, subscribe, unsubscribe, permission } = push

  if (permission === 'denied') return (
    <span className="text-[10px] text-white/20 hidden sm:block">🔕 Notif. bloqueada</span>
  )

  return (
    <div className="relative">
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        title={subscribed ? 'Desativar notificações de gol' : 'Ativar notificações de gol'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                    border transition-all active:scale-95 disabled:opacity-50
                    ${subscribed
                      ? 'bg-brand-green/15 border-brand-green/30 text-brand-green'
                      : 'bg-white/5 border-brand-border text-white/50 hover:border-brand-green/30 hover:text-brand-green'}`}>
        {loading ? (
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : (
          <span>{subscribed ? '🔔' : '🔕'}</span>
        )}
        <span className="hidden sm:inline">{subscribed ? 'Notif. ativa' : 'Notificar gols'}</span>
      </button>
      {error && (
        <div className="absolute top-full mt-1 right-0 bg-red-500/20 border border-red-500/30
                        text-red-400 text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  )
}
