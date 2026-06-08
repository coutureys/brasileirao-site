import { useState, useEffect } from 'react'

const COLORS = ['#00E676', '#3B82F6', '#F59E0B']
const COLOR_CLS = ['text-brand-green', 'text-blue-400', 'text-amber-400']
const BG_CLS    = ['bg-brand-green',   'bg-blue-500',   'bg-amber-400']

const METRICS = [
  { key: 'goals',        label: 'Gols',         icon: '⚽', max: 15  },
  { key: 'assists',      label: 'Assistências',  icon: '🎯', max: 12  },
  { key: 'appearances',  label: 'Jogos',         icon: '📋', max: 38  },
  { key: 'gpg',          label: 'Gols/Jogo',     icon: '⚡', max: 1   },
  { key: 'yellow_cards', label: 'Amarelos',      icon: '🟨', max: 10  },
  { key: 'red_cards',    label: 'Vermelhos',     icon: '🟥', max: 3   },
]

// Eixos do radar
const RADAR_AXES = [
  { key: 'goals',       label: 'Gols',       max: 15 },
  { key: 'assists',     label: 'Assist.',     max: 12 },
  { key: 'appearances', label: 'Jogos',       max: 38 },
  { key: 'gpg',         label: 'G/Jogo',      max: 1  },
  { key: 'discipline',  label: 'Disciplina',  max: 100 },
  { key: 'impact',      label: 'Impacto',     max: 100 },
]

function enrich(p) {
  const j = Math.max(1, p.appearances ?? 1)
  return {
    ...p,
    gpg:        (p.goals ?? 0) / j,
    discipline: Math.max(0, 100 - (p.yellow_cards ?? 0) * 10 - (p.red_cards ?? 0) * 25),
    impact:     Math.min(100, ((p.goals ?? 0) * 3 + (p.assists ?? 0) * 2) / j * 20),
  }
}

/* ── Radar SVG ─────────────────────────────────────────────────────────── */
function RadarChart({ players }) {
  const size   = 220
  const cx     = size / 2
  const cy     = size / 2
  const radius = 85
  const axes   = RADAR_AXES
  const n      = axes.length

  const angle  = (i) => (Math.PI * 2 * i) / n - Math.PI / 2
  const point  = (r, i) => [
    cx + r * Math.cos(angle(i)),
    cy + r * Math.sin(angle(i)),
  ]

  const levels = [0.25, 0.5, 0.75, 1]

  const playerPoints = (p) =>
    axes.map((ax, i) => {
      const raw = p[ax.key] ?? 0
      const pct = Math.min(1, raw / ax.max)
      return point(radius * pct, i)
    })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px] mx-auto">
      {/* Grid circles */}
      {levels.map(l => (
        <polygon key={l}
          points={axes.map((_, i) => point(radius * l, i).join(',')).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}

      {/* Axes lines */}
      {axes.map((_, i) => {
        const [x, y] = point(radius, i)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y}
                     stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      })}

      {/* Axis labels */}
      {axes.map((ax, i) => {
        const [x, y] = point(radius + 14, i)
        return (
          <text key={i} x={x} y={y}
                textAnchor="middle" dominantBaseline="middle"
                fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="600">
            {ax.label}
          </text>
        )
      })}

      {/* Player polygons */}
      {players.map((p, pi) => {
        const pts = playerPoints(enrich(p))
        return (
          <g key={p.id}>
            <polygon
              points={pts.map(pt => pt.join(',')).join(' ')}
              fill={COLORS[pi] + '22'}
              stroke={COLORS[pi]}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3" fill={COLORS[pi]} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/* ── Stat bar row ──────────────────────────────────────────────────────── */
function StatRow({ metric, players }) {
  const vals    = players.map(p => {
    const ep = enrich(p)
    return ep[metric.key] ?? 0
  })
  const maxVal  = Math.max(...vals, 0.01)
  const winner  = vals.indexOf(Math.max(...vals))

  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40 font-semibold uppercase tracking-wide">
          {metric.icon} {metric.label}
        </span>
        {/* Diferença % entre os dois primeiros */}
        {players.length >= 2 && vals[0] > 0 && vals[1] > 0 && (
          <span className="text-[10px] text-white/25">
            {Math.abs(((vals[0] - vals[1]) / Math.max(vals[0], vals[1])) * 100).toFixed(0)}% dif.
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {players.map((p, pi) => {
          const val = vals[pi]
          const pct = (val / maxVal) * 100
          const isWinner = pi === winner && val > 0
          const display  = metric.key === 'gpg' ? val.toFixed(2) : Math.round(val)

          return (
            <div key={p.id} className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-black tabular-nums ${isWinner ? COLOR_CLS[pi] : 'text-white/40'}`}>
                  {display}
                  {isWinner && <span className="ml-1 text-[9px]">▲</span>}
                </span>
                <span className={`text-[9px] font-bold ${COLOR_CLS[pi]} opacity-50`}>
                  P{pi + 1}
                </span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isWinner ? BG_CLS[pi] : 'bg-white/20'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Player selector ───────────────────────────────────────────────────── */
function PlayerSlot({ player, color, colorCls, onRemove, index }) {
  const initials = player?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  if (!player) return (
    <div className={`flex-1 rounded-2xl border-2 border-dashed border-white/10
                     flex flex-col items-center justify-center gap-2 py-6 text-white/20 text-sm`}>
      <span className="text-2xl">➕</span>
      <span className="text-xs font-semibold">Jogador {index + 1}</span>
    </div>
  )

  return (
    <div className="flex-1 rounded-2xl p-4 text-center relative"
         style={{ background: color + '10', border: `1px solid ${color}30` }}>
      <button onClick={onRemove}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10
                         flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition text-xs">
        ✕
      </button>
      <div className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center
                      text-lg font-black border-2"
           style={{ background: color + '20', borderColor: color + '60', color }}>
        {initials}
      </div>
      <p className={`font-black text-sm leading-tight ${colorCls}`}>{player.name}</p>
      <p className="text-[11px] text-white/40 mt-0.5 truncate">{player.team_name}</p>
      <p className="text-[10px] text-white/25 mt-1">{player.position !== 'Unknown' ? player.position : ''}</p>
    </div>
  )
}

/* ── Main Compare Modal ────────────────────────────────────────────────── */
export function CompareModal({ players, onClose }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  const active = players.filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-2xl bg-brand-card border border-brand-border
                      rounded-t-3xl sm:rounded-3xl shadow-2xl
                      max-h-[95vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-card border-b border-brand-border px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-black text-lg">⚖️ Comparar Jogadores</h2>
            <p className="text-xs text-white/40 mt-0.5">{active.length} jogador{active.length !== 1 ? 'es' : ''} selecionado{active.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center
                             hover:bg-white/15 transition text-white/60">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-6">

          {/* Slots dos jogadores */}
          <div className="flex gap-3">
            {players.map((p, i) => (
              <PlayerSlot key={i} player={p} index={i}
                          color={COLORS[i]} colorCls={COLOR_CLS[i]}
                          onRemove={() => {}} />
            ))}
          </div>

          {active.length < 2 ? (
            <div className="text-center py-10 text-white/30">
              <p className="text-4xl mb-3">👥</p>
              <p className="font-semibold">Selecione pelo menos 2 jogadores para comparar</p>
              <p className="text-sm mt-1">Clique em ⚖️ na lista de jogadores</p>
            </div>
          ) : (
            <>
              {/* Radar chart */}
              <div className="card p-4">
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-3 text-center">Gráfico Radar</p>
                {/* Legenda */}
                <div className="flex justify-center gap-4 mb-2">
                  {active.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-[11px] text-white/60 font-semibold">{p.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
                <RadarChart players={active} />
              </div>

              {/* Barras comparativas */}
              <div className="card p-4">
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-1">Stats Comparadas</p>
                {/* Header com nomes */}
                <div className="flex gap-3 mb-3 mt-2">
                  {active.map((p, i) => (
                    <div key={i} className="flex-1 flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                      <span className={`text-xs font-black truncate ${COLOR_CLS[i]}`}>{p.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
                {METRICS.map(m => (
                  <StatRow key={m.key} metric={m} players={active} />
                ))}
              </div>

              {/* Vencedor geral */}
              <WinnerSummary players={active} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Vencedor geral ─────────────────────────────────────────────────────── */
function WinnerSummary({ players }) {
  const scores = players.map((p, pi) => {
    const ep = enrich(p)
    let wins = 0
    METRICS.forEach(m => {
      const vals = players.map(pp => enrich(pp)[m.key] ?? 0)
      const max  = Math.max(...vals)
      if (max > 0 && (ep[m.key] ?? 0) === max) wins++
    })
    return { player: p, wins, pi }
  })

  const best = scores.sort((a, b) => b.wins - a.wins)[0]

  return (
    <div className="card p-4 text-center"
         style={{ background: COLORS[best.pi] + '08', borderColor: COLORS[best.pi] + '30' }}>
      <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-2">🏆 Melhor desempenho geral</p>
      <p className={`text-xl font-black ${COLOR_CLS[best.pi]}`}>{best.player.name}</p>
      <p className="text-white/40 text-xs mt-1">{best.player.team_name}</p>
      <p className="text-sm mt-2">
        Melhor em <span className={`font-black ${COLOR_CLS[best.pi]}`}>{best.wins}</span> de {METRICS.length} métricas
      </p>
    </div>
  )
}

/* ── Floating tray (barra inferior quando jogadores selecionados) ───────── */
export function CompareTray({ players, onCompare, onRemove, onClear }) {
  const active = players.filter(Boolean)
  if (active.length === 0) return null

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40
                    bg-brand-card border border-brand-border rounded-2xl shadow-2xl
                    px-4 py-3 flex items-center gap-3 animate-slide-up
                    backdrop-blur-sm min-w-[300px] max-w-[500px]">

      <div className="flex items-center gap-2 flex-1">
        {active.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                 style={{ background: COLORS[players.indexOf(p)] + '20', color: COLORS[players.indexOf(p)], border: `1px solid ${COLORS[players.indexOf(p)]}40` }}>
              {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <span className="text-xs font-bold text-white/70 hidden sm:block truncate max-w-[80px]">
              {p.name.split(' ')[0]}
            </span>
            {i < active.length - 1 && <span className="text-white/20 text-xs">vs</span>}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {active.length >= 2 && (
          <button onClick={onCompare}
                  className="px-3 py-1.5 rounded-xl bg-brand-green text-brand-dark
                             text-xs font-black hover:bg-emerald-400 transition active:scale-95">
            Comparar ⚖️
          </button>
        )}
        {active.length < 3 && (
          <span className="text-[10px] text-white/30 hidden sm:block">
            +{3 - active.length} jogador{3 - active.length !== 1 ? 'es' : ''}
          </span>
        )}
        <button onClick={onClear}
                className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center
                           text-white/40 hover:text-white hover:bg-white/15 transition text-xs">
          ✕
        </button>
      </div>
    </div>
  )
}
