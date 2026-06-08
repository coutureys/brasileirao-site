import { useState, useEffect } from 'react'

const KIND_STYLE = {
  goal:         { bg: 'bg-brand-green/15',  border: 'border-brand-green/30',  text: 'text-brand-green',  glow: 'shadow-brand-green/20'  },
  penalty:      { bg: 'bg-brand-green/15',  border: 'border-brand-green/30',  text: 'text-brand-green',  glow: 'shadow-brand-green/20'  },
  own_goal:     { bg: 'bg-red-500/15',      border: 'border-red-500/30',      text: 'text-red-400',      glow: 'shadow-red-500/20'      },
  yellow_card:  { bg: 'bg-amber-400/10',    border: 'border-amber-400/25',    text: 'text-amber-400',    glow: 'shadow-amber-400/15'    },
  yellow_red:   { bg: 'bg-orange-500/15',   border: 'border-orange-500/30',   text: 'text-orange-400',   glow: 'shadow-orange-500/20'   },
  red_card:     { bg: 'bg-red-500/15',      border: 'border-red-500/30',      text: 'text-red-400',      glow: 'shadow-red-500/20'      },
  substitution: { bg: 'bg-blue-500/10',     border: 'border-blue-500/20',     text: 'text-blue-400',     glow: 'shadow-blue-500/10'     },
  other:        { bg: 'bg-white/5',         border: 'border-white/10',        text: 'text-white/40',     glow: ''                       },
}

/* ── Modal de timeline ─────────────────────────────────────────────────── */
export default function MatchTimeline({ match, onClose, embedded = false }) {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [detail,  setDetail]  = useState(null)

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') { detail ? setDetail(null) : onClose?.() } }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose, detail])

  useEffect(() => {
    if (!match?.id) return
    setLoading(true)
    fetch(`/api/pl/match-events?id=${match.id}`)
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [match?.id])

  const isHome = side => side === 'home'

  const timelineBody = loading ? (
    <TimelineSkeletons />
  ) : events.length === 0 ? (
    <div className="text-center py-16 text-white/30">
      <p className="text-4xl mb-3">📋</p>
      <p className="font-semibold">Nenhum evento registrado</p>
      <p className="text-sm mt-1 text-white/20">Os eventos aparecem durante o jogo</p>
    </div>
  ) : (
    <div className="relative">
      {/* Linha central */}
      <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-white/8 rounded-full" />

      <div className="space-y-4">
        {events.map((ev, i) => (
          <TimelineEvent key={ev.id} event={ev} index={i} onClick={() => setDetail(ev)} />
        ))}
      </div>

      {/* Final */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full
                        bg-white/5 border border-white/10 text-white/30 text-xs font-bold">
          🏁 Final
        </div>
      </div>
    </div>
  )

  // Modo embutido (dentro do MatchDetails): só a timeline, sem modal próprio
  if (embedded) {
    return (
      <div className="relative flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-4 py-6">{timelineBody}</div>
        {detail && <EventDetail event={detail} onClose={() => setDetail(null)} />}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={() => detail ? setDetail(null) : onClose?.()}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-lg bg-brand-card border border-brand-border
                      rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col"
           onClick={e => e.stopPropagation()}>

        {/* Header sticky */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Timeline</p>
            <h3 className="font-black text-base mt-0.5">
              {match?.home?.name?.split(' ')[0]}
              <span className="text-white/30 mx-2">vs</span>
              {match?.away?.name?.split(' ')[0]}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Placar */}
            {match?.home?.score != null && (
              <div className="flex items-center gap-2 text-xl font-black">
                <span className="text-brand-green">{match.home.score}</span>
                <span className="text-white/20">–</span>
                <span className="text-blue-400">{match.away.score}</span>
              </div>
            )}
            <button onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                               hover:bg-white/15 transition text-white/50 text-sm">✕</button>
          </div>
        </div>

        {/* Timeline scrollável */}
        <div className="flex-1 overflow-y-auto px-4 py-6">{timelineBody}</div>
      </div>

      {/* Detail popup */}
      {detail && <EventDetail event={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

/* ── Evento individual ─────────────────────────────────────────────────── */
function TimelineEvent({ event: ev, index, onClick }) {
  const style  = KIND_STYLE[ev.kind] ?? KIND_STYLE.other
  const isLeft = ev.side === 'home'

  return (
    <div className={`flex items-center gap-3 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
         style={{ animationDelay: `${index * 60}ms` }}>

      {/* Card do evento */}
      <button
        onClick={onClick}
        className={`flex-1 max-w-[calc(50%-28px)] p-3 rounded-2xl border
                    ${style.bg} ${style.border}
                    hover:brightness-110 active:scale-95
                    transition-all duration-200 text-left
                    shadow-lg ${style.glow}
                    ${ev.kind === 'goal' || ev.kind === 'penalty' ? 'ring-1 ring-brand-green/20' : ''}`}>

        <div className={`flex items-center gap-2 ${isLeft ? '' : 'flex-row-reverse'}`}>
          <span className="text-xl flex-shrink-0">{ev.icon}</span>
          <div className={`min-w-0 ${isLeft ? '' : 'text-right'}`}>
            <p className={`text-[10px] font-black uppercase tracking-wide ${style.text}`}>
              {ev.label}
            </p>
            {ev.player && (
              <p className="text-xs font-bold text-white/80 truncate mt-0.5">{ev.player}</p>
            )}
            {ev.kind === 'substitution' && ev.playerOut && (
              <p className="text-[10px] text-white/40 truncate">← {ev.playerOut}</p>
            )}
            {/* Placar novo após gol */}
            {ev.score && (
              <p className={`text-sm font-black mt-1 ${style.text}`}>{ev.score}</p>
            )}
          </div>
        </div>
      </button>

      {/* Bolinha central com minuto */}
      <div className="flex-shrink-0 z-10">
        <div className={`w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center
                         bg-brand-card ${style.border}
                         ${ev.kind === 'goal' || ev.kind === 'penalty' ? 'shadow-lg shadow-brand-green/30' : ''}`}>
          <span className="text-[9px] font-black text-white/60 leading-none">{ev.minute}</span>
        </div>
      </div>

      {/* Lado vazio */}
      <div className="flex-1 max-w-[calc(50%-28px)]" />
    </div>
  )
}

/* ── Detail popup ────────────────────────────────────────────────────────── */
function EventDetail({ event: ev, onClose }) {
  const style = KIND_STYLE[ev.kind] ?? KIND_STYLE.other

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 z-10"
         onClick={onClose}>
      <div className={`w-full max-w-xs p-6 rounded-3xl border ${style.bg} ${style.border}
                       shadow-2xl text-center animate-slide-up`}
           onClick={e => e.stopPropagation()}>

        <div className="text-5xl mb-3">{ev.icon}</div>

        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${style.text}`}>
          {ev.label}
        </p>

        {ev.player && (
          <p className="text-xl font-black text-white mt-2">{ev.player}</p>
        )}

        {ev.kind === 'substitution' && ev.playerOut && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-white/40">Entrou</p>
            <p className="text-sm font-bold text-brand-green">{ev.player}</p>
            <p className="text-xs text-white/40 mt-1">Saiu</p>
            <p className="text-sm font-bold text-red-400">{ev.playerOut}</p>
          </div>
        )}

        {ev.score && (
          <div className="mt-4 py-3 px-6 rounded-2xl bg-brand-green/10 border border-brand-green/20">
            <p className="text-xs text-white/40 mb-1">Placar</p>
            <p className={`text-3xl font-black ${style.text}`}>{ev.score}</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2">
          <p className="text-xs text-white/40">{ev.team}</p>
          <span className="text-white/20">·</span>
          <p className={`text-xs font-black ${style.text}`}>{ev.minute}</p>
        </div>

        <button onClick={onClose}
                className="mt-5 w-full py-2 rounded-xl bg-white/8 text-white/50
                           text-xs font-bold hover:bg-white/12 transition">
          Fechar
        </button>
      </div>
    </div>
  )
}

/* ── Skeletons ─────────────────────────────────────────────────────────── */
function TimelineSkeletons() {
  return (
    <div className="relative">
      <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-white/8" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex items-center gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'} animate-pulse`}>
            <div className="flex-1 max-w-[calc(50%-28px)] h-14 bg-white/5 rounded-2xl" />
            <div className="w-10 h-10 rounded-full bg-white/8 flex-shrink-0" />
            <div className="flex-1 max-w-[calc(50%-28px)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
