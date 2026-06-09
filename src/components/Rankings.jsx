import { useState, useEffect } from 'react'

/* ── Constantes ─────────────────────────────────────────────────────────── */
const COMPETITIONS = [
  { key: 'brasileirao-serie-a', label: 'Brasileirão', flag: '🇧🇷', short: 'Série A' },
  { key: 'champions',           label: 'Champions',   flag: '⭐', short: 'UCL',    disabled: true },
  { key: 'libertadores',        label: 'Libertadores', flag: '🏆', short: 'CONM',  disabled: true },
  { key: 'copa-brasil',         label: 'Copa do Brasil', flag: '🥇', short: 'Copa', disabled: true },
]

const CATEGORIES = [
  { key: 'goals',        label: 'Artilheiros',      icon: '⚽', stat: 'goals',        color: '#8B0000', bg: 'from-red-950/40 to-transparent'  },
  { key: 'assists',      label: 'Assistências',      icon: '🎯', stat: 'assists',       color: '#3B82F6', bg: 'from-blue-500/20 to-transparent'   },
  { key: 'key_passes',   label: 'Passes Decisivos',  icon: '🔑', stat: 'assists',       color: '#8B5CF6', bg: 'from-purple-500/20 to-transparent' },
  { key: 'yellow_cards', label: 'Cartões Amarelos',  icon: '🟨', stat: 'yellow_cards',  color: '#F59E0B', bg: 'from-amber-500/20 to-transparent'  },
  { key: 'red_cards',    label: 'Cartões Vermelhos', icon: '🟥', stat: 'red_cards',     color: '#EF4444', bg: 'from-red-500/20 to-transparent'    },
]

const SORT_OPTIONS = [
  { key: 'desc', label: '↓ Maior primeiro' },
  { key: 'asc',  label: '↑ Menor primeiro' },
]

const AVATAR_GRADIENTS = [
  ['#00E676','#00897B'], ['#3B82F6','#1D4ED8'], ['#F59E0B','#B45309'],
  ['#EF4444','#991B1B'], ['#8B5CF6','#6D28D9'], ['#EC4899','#BE185D'],
  ['#06B6D4','#0E7490'], ['#84CC16','#3F6212'],
]

function getGradient(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[idx]
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function Rankings() {
  const [competition, setCompetition] = useState('brasileirao-serie-a')
  const [category,    setCategory]    = useState('goals')
  const [sort,        setSort]        = useState('desc')
  const [players,     setPlayers]     = useState([])
  const [loading,     setLoading]     = useState(true)

  const currentCat = CATEGORIES.find(c => c.key === category) ?? CATEGORIES[0]

  useEffect(() => {
    setLoading(true)
    fetch(`/api/db/players?sortBy=${currentCat.stat}&limit=50`)
      .then(r => r.json())
      .then(d => {
        let data = d.data ?? []
        if (sort === 'asc') data = [...data].reverse()
        setPlayers(data)
      })
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false))
  }, [category, sort, currentCat.stat])

  const top3    = players.slice(0, 3)
  const rest    = players.slice(3)

  return (
    <section id="rankings" className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="section-tag">Estatísticas · Temporada 2026</p>
          <h2 className="section-title mt-1">Rankings</h2>
          <p className="text-white/40 text-sm mt-1">Classificações e estatísticas da temporada</p>
        </div>

        {/* Filtro de competição */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {COMPETITIONS.map(c => (
            <button
              key={c.key}
              disabled={c.disabled}
              onClick={() => !c.disabled && setCompetition(c.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                          flex-shrink-0 transition-all
                          ${c.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                          ${competition === c.key && !c.disabled
                            ? 'bg-white/15 text-white border border-white/20'
                            : 'bg-brand-accent border border-brand-border text-white/50 hover:text-white'}`}>
              <span>{c.flag}</span>
              <span>{c.label}</span>
              {c.disabled && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">Em breve</span>}
            </button>
          ))}
        </div>

        {/* Tabs de categoria */}
        <div className="flex gap-1 p-1 rounded-2xl bg-brand-accent border border-brand-border w-fit mb-8 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm
                          font-bold transition-all flex-shrink-0
                          ${category === c.key
                            ? 'bg-white/15 text-white shadow border border-white/10'
                            : 'text-white/40 hover:text-white'}`}
              style={category === c.key ? { color: c.color } : {}}>
              <span>{c.icon}</span>
              <span className="hidden sm:inline">{c.label}</span>
            </button>
          ))}
        </div>

        {/* TOP 3 Podium */}
        {!loading && top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            {[top3[1], top3[0], top3[2]].map((p, i) => {
              const rank  = i === 1 ? 1 : i === 0 ? 2 : 3
              const val   = p[currentCat.stat] ?? 0
              const [g1, g2] = getGradient(p.name)
              const medals = ['🥇','🥈','🥉']
              const featured = rank === 1
              return (
                <div key={p.id}
                     className={`card p-4 sm:p-5 text-center transition-all
                       ${featured ? 'border-white/15 shadow-lg -translate-y-2 sm:-translate-y-3' : ''}`}
                     style={featured ? { borderColor: currentCat.color + '30', boxShadow: `0 0 30px ${currentCat.color}15` } : {}}>

                  {/* Medalha */}
                  <div className="text-2xl sm:text-3xl mb-3">{medals[rank - 1]}</div>

                  {/* Avatar */}
                  <div className="relative mx-auto mb-3 w-16 h-16 sm:w-20 sm:h-20">
                    <div className="w-full h-full rounded-full flex items-center justify-center
                                    text-xl sm:text-2xl font-black border-2 border-white/10"
                         style={{ background: `linear-gradient(135deg, ${g1}40, ${g2}40)`, color: g1, borderColor: g1 + '40' }}>
                      {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    {/* Badge posição */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black
                                    px-1.5 py-0.5 rounded-full bg-brand-card border border-brand-border text-white/60">
                      #{rank}
                    </div>
                  </div>

                  {/* Info */}
                  <p className="font-black text-sm sm:text-base leading-tight truncate">{p.name}</p>
                  <p className="text-[11px] text-white/40 truncate mt-0.5">{p.team_name ?? '—'}</p>

                  {/* Stat */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-3xl sm:text-4xl font-black tabular-nums"
                       style={{ color: currentCat.color }}>
                      {val}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">
                      {currentCat.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Controles: sort */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/40 font-semibold">
            {loading ? '...' : `${players.length} jogadores`}
          </p>
          <div className="flex gap-1 p-1 rounded-xl bg-brand-accent border border-brand-border">
            {SORT_OPTIONS.map(s => (
              <button key={s.key} onClick={() => setSort(s.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${sort === s.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela completa */}
        <div className="card overflow-hidden">
          {/* Header da tabela */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto_auto_auto]
                          gap-2 px-4 py-2.5 border-b border-brand-border text-[10px] text-white/30
                          uppercase tracking-wider font-bold">
            <span className="w-8 text-center">#</span>
            <span>Jogador</span>
            <span className="w-12 text-center" style={{ color: currentCat.color }}>{currentCat.icon}</span>
            <span className="w-10 text-center hidden sm:block">⚽</span>
            <span className="w-10 text-center hidden sm:block">🎯</span>
            <span className="w-10 text-center hidden sm:block">📋</span>
            <span className="w-10 text-center hidden sm:block">🟨</span>
          </div>

          {loading ? <RankingSkeletons /> : players.length === 0 ? (
            <div className="p-12 text-center text-white/40">
              <p className="text-4xl mb-3">📊</p>
              <p>Nenhum dado disponível</p>
            </div>
          ) : (
            <div className="divide-y divide-brand-border/50">
              {players.map((p, i) => (
                <RankingRow key={p.id} player={p} rank={i + 1} category={currentCat} />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

/* ── Linha da tabela ────────────────────────────────────────────────────── */
function RankingRow({ player: p, rank, category }) {
  const val      = p[category.stat] ?? 0
  const top3     = rank <= 3
  const [g1]     = getGradient(p.name)
  const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2)
  const medals   = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div className={`grid grid-cols-[auto_1fr_auto_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto_auto_auto]
                     gap-2 items-center px-4 py-2.5 hover:bg-white/3 transition
                     ${top3 ? 'bg-white/[0.02]' : ''}`}>

      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        {top3
          ? <span className="text-base">{medals[rank]}</span>
          : <span className="text-sm font-bold text-white/25">{rank}</span>}
      </div>

      {/* Jogador */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
                        text-xs font-black border border-white/10"
             style={{ background: g1 + '20', color: g1, borderColor: g1 + '30' }}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className={`font-bold text-sm truncate ${top3 ? 'text-white' : 'text-white/80'}`}>
            {p.name}
          </p>
          <p className="text-[11px] text-white/35 truncate">{p.team_name ?? '—'}</p>
        </div>
      </div>

      {/* Stat principal */}
      <div className="w-12 text-center">
        <span className={`text-lg font-black tabular-nums ${top3 ? '' : 'text-white/70'}`}
              style={top3 ? { color: category.color } : {}}>
          {val}
        </span>
      </div>

      {/* Stats secundárias — desktop */}
      <span className="w-10 text-center text-sm text-white/40 tabular-nums hidden sm:block">{p.goals ?? 0}</span>
      <span className="w-10 text-center text-sm text-white/40 tabular-nums hidden sm:block">{p.assists ?? 0}</span>
      <span className="w-10 text-center text-sm text-white/40 tabular-nums hidden sm:block">{p.appearances ?? 0}</span>
      <span className="w-10 text-center text-sm text-white/40 tabular-nums hidden sm:block">{p.yellow_cards ?? 0}</span>
    </div>
  )
}

/* ── Skeletons ──────────────────────────────────────────────────────────── */
function RankingSkeletons() {
  return (
    <div className="divide-y divide-brand-border/50">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className="w-8 h-4 bg-white/8 rounded" />
          <div className="w-9 h-9 rounded-full bg-white/8" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-white/10 rounded w-2/5" />
            <div className="h-2.5 bg-white/5 rounded w-1/4" />
          </div>
          <div className="w-8 h-6 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  )
}
