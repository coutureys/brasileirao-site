import { useState, useEffect } from 'react'

/**
 * 📊 MATCH STATS — Estatísticas REAIS da partida (ESPN summary)
 * Puxa de /api/pl/match-stats e mostra barras de comparação casa x visitante.
 */
export default function MatchStats({ match, embedded = false, onClose }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!match?.id) return
    setLoading(true)
    fetch(`/api/pl/match-stats?id=${match.id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setData(null); setLoading(false) })
  }, [match?.id])

  const body = loading ? (
    <StatsSkeleton />
  ) : !data?.found || !data?.stats?.length ? (
    <div className="text-center py-16 text-white/30">
      <p className="text-4xl mb-3">📊</p>
      <p className="font-semibold">Estatísticas indisponíveis</p>
      <p className="text-sm mt-1 text-white/20">
        A ESPN ainda não liberou os dados desta partida
      </p>
    </div>
  ) : (
    <div className="space-y-5">
      {data.stats.map((s) => (
        <StatRow key={s.key} stat={s} />
      ))}
    </div>
  )

  if (embedded) {
    return (
      <div className="relative flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">{body}</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full sm:max-w-lg bg-brand-card border border-brand-border
                      rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-black text-base">📊 Estatísticas</h3>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                             hover:bg-white/15 transition text-white/50 text-sm">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">{body}</div>
      </div>
    </div>
  )
}

/* ── Uma linha de stat com barra dupla ─────────────────────────────────────── */
function StatRow({ stat }) {
  const h = stat.home.value
  const a = stat.away.value
  const total = h + a
  // Proporção das barras (evita divisão por zero)
  const homePct = total > 0 ? (h / total) * 100 : 50
  const awayPct = total > 0 ? (a / total) * 100 : 50

  const homeWins = h > a
  const awayWins = a > h

  return (
    <div>
      {/* Valores + rótulo */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-sm font-black tabular-nums w-14 ${
          homeWins ? 'text-brand-green' : 'text-white/80'
        }`}>
          {stat.home.display}
        </span>

        <span className="text-[11px] sm:text-xs font-semibold text-white/40 uppercase tracking-wide text-center">
          {stat.label}
        </span>

        <span className={`text-sm font-black tabular-nums w-14 text-right ${
          awayWins ? 'text-white' : 'text-white/80'
        }`}>
          {stat.away.display}
        </span>
      </div>

      {/* Barra dupla — casa (vermelho) x visitante (branco) */}
      <div className="flex items-center gap-1 h-2">
        <div className="flex-1 flex justify-end">
          <div
            className={`h-full rounded-l-full transition-all duration-500 ${
              homeWins ? 'bg-brand-green' : 'bg-brand-green/40'
            }`}
            style={{ width: `${homePct}%` }}
          />
        </div>
        <div className="flex-1 flex justify-start">
          <div
            className={`h-full rounded-r-full transition-all duration-500 ${
              awayWins ? 'bg-white/70' : 'bg-white/25'
            }`}
            style={{ width: `${awayPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton de carregamento ─────────────────────────────────────────────── */
function StatsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-4 bg-white/8 rounded" />
            <div className="w-24 h-3 bg-white/5 rounded" />
            <div className="w-8 h-4 bg-white/8 rounded" />
          </div>
          <div className="h-2 bg-white/5 rounded-full" />
        </div>
      ))}
    </div>
  )
}
