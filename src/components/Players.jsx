import { useState, useEffect, useCallback } from 'react'
import { CompareModal, CompareTray } from './PlayerCompare'

const POSITIONS = ['Forward','Midfielder','Defender','Goalkeeper']
const POS_LABEL = { Unknown:'—', Goalkeeper:'GOL', Defender:'ZAG', Midfielder:'MEI', Forward:'ATA' }
const POS_COLOR = {
  Goalkeeper: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Defender:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Midfielder: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Forward:    'bg-red-500/15 text-red-400 border-red-500/20',
  Unknown:    'bg-white/5 text-white/30 border-white/10',
}

const POS_FULL = { Goalkeeper:'Goleiro', Defender:'Zagueiro', Midfielder:'Meio-campo', Forward:'Atacante', Unknown:'—' }

const TABS = [
  { key:'goals',       label:'Artilheiros',    icon:'⚽', stat:'goals',        color:'text-brand-green' },
  { key:'assists',     label:'Assistências',   icon:'🎯', stat:'assists',       color:'text-blue-400'   },
  { key:'yellow_cards',label:'Cartões',        icon:'🟨', stat:'yellow_cards',  color:'text-amber-400'  },
  { key:'appearances', label:'Mais jogos',     icon:'📋', stat:'appearances',   color:'text-purple-400' },
]

export default function Players({ league = 'bra.1', leagueInfo }) {
  const [tab,        setTab]        = useState('goals')
  const [players,    setPlayers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg,        setMsg]        = useState(null)
  const [selected,   setSelected]   = useState(null)
  const [comparing,  setComparing]  = useState([null, null, null]) // até 3
  const [showCompare,setShowCompare]= useState(false)
  const [form, setForm] = useState({
    name:'', team_name:'', position:'Forward',
    goals:'', assists:'', appearances:'', yellow_cards:'', red_cards:'',
  })

  const currentTab = TABS.find(t => t.key === tab) ?? TABS[0]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/db/players?sortBy=${tab}&limit=30&league=${league}`)
      const d = await r.json()
      setPlayers(d.data ?? [])
    } catch { setPlayers([]) }
    finally  { setLoading(false) }
  }, [tab, league])

  // Reseta quando muda de liga
  useEffect(() => { setTab('goals'); setSelected(null) }, [league])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true); setMsg(null)
    try {
      const r = await fetch('/api/db/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          goals: Number(form.goals)||0, assists: Number(form.assists)||0,
          appearances: Number(form.appearances)||0, yellow_cards: Number(form.yellow_cards)||0,
          red_cards: Number(form.red_cards)||0, season: new Date().getFullYear(),
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMsg({ ok:true, text:`✅ ${form.name} cadastrado!` })
      setForm({ name:'', team_name:'', position:'Forward', goals:'', assists:'', appearances:'', yellow_cards:'', red_cards:'' })
      setShowForm(false); load()
    } catch (err) { setMsg({ ok:false, text:`❌ ${err.message}` }) }
    finally { setSubmitting(false) }
  }

  const maxVal = players[0]?.[currentTab.stat] ?? 1

  function toggleCompare(player) {
    setComparing(prev => {
      // Já está na lista? Remove
      const idx = prev.findIndex(p => p?.id === player.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = null
        return next
      }
      // Acha o primeiro slot vazio
      const emptyIdx = prev.findIndex(p => p === null)
      if (emptyIdx === -1) return prev // já tem 3, não adiciona
      const next = [...prev]
      next[emptyIdx] = player
      return next
    })
  }

  const inCompare = (player) => comparing.some(p => p?.id === player.id)

  return (
    <section id="jogadores" className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="section-tag" style={leagueInfo ? { color: leagueInfo.color } : {}}>
              {leagueInfo?.flag} {leagueInfo?.short ?? 'Série A'} · {new Date().getFullYear()}
            </p>
            <h2 className="section-title mt-1">Jogadores</h2>
          </div>
          <button onClick={() => setShowForm(f => !f)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green
                             text-white font-black text-sm hover:bg-brand-redHover
                             active:scale-95 transition-all shadow-glow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            Cadastrar jogador
          </button>
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-bold
            ${msg.ok ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                     : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {msg.text}
          </div>
        )}

        {showForm && (
          <PlayerForm form={form} onChange={e => setForm(f=>({...f,[e.target.name]:e.target.value}))}
                      onSubmit={handleSubmit} onCancel={() => setShowForm(false)} submitting={submitting} />
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-brand-accent border border-brand-border w-fit mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all
                      ${tab === t.key ? 'bg-brand-green text-white shadow-glow-sm' : 'text-white/50 hover:text-white'}`}>
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        {!loading && players.length >= 3 && (
          <div className="hidden sm:grid grid-cols-3 gap-4 mb-6">
            {[players[1], players[0], players[2]].map((p, i) => p && (
              <PodiumCard key={p.id} player={p} rank={i===1?1:i===0?2:3}
                          tab={currentTab} featured={i===1} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}

        {/* Lista */}
        <div className="card overflow-hidden">
          {loading ? <PlayerSkeletons /> : players.length === 0 ? (
            <EmptyPlayers onSync={load} />
          ) : (
            <div className="divide-y divide-brand-border">
              {players.map((p, i) => (
                <PlayerRow key={p.id} player={p} rank={i+1} tab={currentTab}
                           maxVal={maxVal} onClick={() => setSelected(p)}
                           onCompare={toggleCompare} isComparing={inCompare(p)} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal card do jogador */}
      {selected && <PlayerCardModal player={selected} onClose={() => setSelected(null)} />}

      {/* Tray de comparação */}
      <CompareTray
        players={comparing}
        onCompare={() => setShowCompare(true)}
        onRemove={(i) => setComparing(prev => { const n=[...prev]; n[i]=null; return n })}
        onClear={() => setComparing([null,null,null])}
      />

      {/* Modal comparação */}
      {showCompare && (
        <CompareModal
          players={comparing}
          onClose={() => setShowCompare(false)}
        />
      )}
    </section>
  )
}

/* ── Player Card Modal ───────────────────────────────────────────────────── */
function PlayerCardModal({ player: p, onClose }) {
  const rating   = calcRating(p)
  const value    = calcValue(p)
  const initials = p.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  // Fecha no ESC
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-md bg-brand-card border border-brand-border
                      rounded-t-3xl sm:rounded-3xl overflow-y-auto shadow-2xl animate-slide-up
                      max-h-[92vh] sm:max-h-[90vh]"
           onClick={e => e.stopPropagation()}>

        {/* ── Cabeçalho ── */}
        <div className="relative">
          {/* Banner de fundo */}
          <div className="h-28 bg-gradient-to-br from-brand-green/20 via-brand-accent to-brand-dark overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
            <div className="absolute inset-0 opacity-20"
                 style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #00E676 0%, transparent 60%)' }} />
            {/* Botão fechar */}
            <button onClick={onClose}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10
                               flex items-center justify-center hover:bg-white/20 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            {/* Crest do time */}
            {p.team_crest && (
              <img src={p.team_crest} alt={p.team_name??''}
                   className="absolute top-3 left-4 w-10 h-10 object-contain opacity-60"
                   onError={e=>e.currentTarget.style.display='none'} />
            )}
            {/* Rating badge */}
            <div className="absolute top-3 right-14">
              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shadow-lg
                ${rating >= 8 ? 'bg-brand-green text-white' :
                  rating >= 6 ? 'bg-amber-400 text-white' : 'bg-white/20 text-white'}`}>
                <span className="text-xl leading-none">{rating.toFixed(1)}</span>
                <span className="text-[8px] uppercase tracking-wide opacity-70">Rating</span>
              </div>
            </div>
          </div>

          {/* Avatar — fora do overflow-hidden */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
            <div className="w-24 h-24 rounded-full border-4 border-brand-card bg-gradient-to-br
                            from-brand-green/30 to-brand-accent flex items-center justify-center
                            text-3xl font-black text-brand-green shadow-xl shadow-black/40">
              {initials}
            </div>
          </div>
        </div>

        {/* ── Info principal ── */}
        <div className="px-5 pt-16 pb-2 text-center">
          <h2 className="text-xl font-black text-white leading-tight">{p.name}</h2>
          <p className="text-sm text-white/50 mt-0.5">{p.team_name ?? '—'}</p>
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            {p.position && p.position !== 'Unknown' && (
              <span className={`chip text-[10px] font-black border ${POS_COLOR[p.position]??POS_COLOR.Unknown}`}>
                {POS_FULL[p.position]}
              </span>
            )}
            <span className="chip text-[10px] font-bold border border-brand-border text-white/40">
              🇧🇷 Brasil · Série A
            </span>
          </div>
        </div>

        {/* ── Valor de mercado ── */}
        <div className="mx-5 mt-4 p-3 rounded-2xl bg-brand-green/8 border border-brand-green/15">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                  {p.market_value ? 'Valor de mercado' : 'Estimativa de valor'}
                </p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  p.market_value
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-brand-green/20 text-brand-green'
                }`}>
                  {p.market_value ? '✓ Real' : 'Est.'}
                </span>
              </div>
              <p className="text-lg font-black text-brand-green mt-1">{value}</p>
              <p className="text-[9px] text-white/30 mt-1">
                {p.market_value
                  ? 'Dados: Transfermarkt, Sofascore'
                  : 'Calculado por: gols, assistências e jogos'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Temporada</p>
              <p className="text-sm font-black text-white">{p.season ?? new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="px-5 mt-4 grid grid-cols-3 gap-2">
          <StatBox icon="⚽" label="Gols"      value={p.goals??0}        color="text-brand-green" />
          <StatBox icon="🎯" label="Assist."   value={p.assists??0}      color="text-blue-400"    />
          <StatBox icon="📋" label="Jogos"     value={p.appearances??0}  color="text-purple-400"  />
          <StatBox icon="⚡" label="G/Jogo"    value={gpg(p)}            color="text-amber-400"   />
          <StatBox icon="🟨" label="Amarelos"  value={p.yellow_cards??0} color="text-yellow-400"  />
          <StatBox icon="🟥" label="Vermelhos" value={p.red_cards??0}    color="text-red-400"     />
        </div>

        {/* ── Barra de performance ── */}
        <div className="px-5 mt-4 space-y-2.5">
          <p className="text-[10px] uppercase tracking-wider font-bold text-white/30">Performance</p>
          <PerfBar label="Finalização"  pct={Math.min(100, (p.goals??0) * 8)}        color="bg-brand-green" />
          <PerfBar label="Criatividade" pct={Math.min(100, (p.assists??0) * 10)}      color="bg-blue-400"    />
          <PerfBar label="Regularidade" pct={Math.min(100, (p.appearances??0) * 2.6)} color="bg-purple-400"  />
          <PerfBar label="Disciplina"   pct={Math.max(0, 100 - (p.yellow_cards??0) * 12 - (p.red_cards??0) * 25)} color="bg-amber-400" />
        </div>

        {/* ── Rodapé ── */}
        <div className="px-5 mt-4 pb-6 flex items-center justify-between">
          <p className="text-[10px] text-white/20">Dados: FBref · ESPN</p>
          <button onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-brand-border
                             text-xs font-bold hover:bg-white/10 transition">
            Fechar
          </button>
        </div>

      </div>
    </div>
  )
}

/* ── Sub-components do modal ─────────────────────────────────────────────── */
function StatBox({ icon, label, value, color }) {
  return (
    <div className="bg-white/4 rounded-xl p-3 text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className={`text-xl font-black tabular-nums ${color}`}>{value}</div>
      <div className="text-[9px] text-white/30 uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  )
}

function PerfBar({ label, pct, color }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-white/50">{label}</span>
        <span className="text-[11px] font-bold text-white/60">{Math.round(pct)}</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`}
             style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function calcRating(p) {
  const g = p.goals ?? 0
  const a = p.assists ?? 0
  const j = p.appearances ?? 1
  const y = p.yellow_cards ?? 0
  const r = p.red_cards ?? 0
  const score = ((g * 2 + a * 1.5) / j) * 10 - y * 0.1 - r * 0.3
  return Math.min(10, Math.max(4, Number(score.toFixed(1)) + 5))
}

function calcValue(p) {
  // Se tem valor real no banco, usa ele
  if (p.market_value) {
    return p.market_value
  }

  // Senão, calcula estimativa
  const g = p.goals ?? 0
  const a = p.assists ?? 0
  const j = Math.max(1, p.appearances ?? 1)

  // Taxa de contribuição por jogo
  const rate = (g * 2.5 + a * 1.5) / j
  // Bônus de regularidade (até 38 jogos)
  const regularidade = Math.min(j, 38) / 38

  // Valor em milhões — calibrado para Série A
  // Viveros (11g, 1a, 17j) → ~€10M
  const value = rate * j * 0.08 + regularidade * 1.5 + g * 0.6 + a * 0.4

  if (value >= 1)   return `€ ${value.toFixed(1)}M`
  if (value >= 0.1) return `€ ${(value * 1000).toFixed(0)}K`
  return `€ 50K`
}

function gpg(p) {
  const g = p.goals ?? 0
  const j = p.appearances ?? 1
  return j > 0 ? (g / j).toFixed(2) : '0.00'
}

/* ── Podium card ─────────────────────────────────────────────────────── */
function PodiumCard({ player: p, rank, tab, featured, onClick }) {
  const medals = ['🥇','🥈','🥉']
  const val    = p[tab.stat] ?? 0

  return (
    <div onClick={onClick} className={`card p-5 text-center transition-all cursor-pointer
      hover:border-brand-green/30 hover:-translate-y-1
      ${featured ? 'border-brand-green/25 shadow-glow-sm ring-1 ring-brand-green/10 -translate-y-2' : ''}`}>
      <div className="text-2xl mb-2">{medals[rank-1]}</div>
      {p.team_crest
        ? <img src={p.team_crest} alt={p.team_name??''} className="w-10 h-10 object-contain mx-auto mb-2"
               onError={e=>e.currentTarget.style.display='none'} />
        : <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black mx-auto mb-2">{p.name[0]}</div>
      }
      <p className="font-black text-sm truncate">{p.name}</p>
      <p className="text-[11px] text-white/40 truncate mb-3">{p.team_name ?? '—'}</p>
      <div className={`text-3xl font-black ${tab.color}`}>{val}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{tab.label}</div>
    </div>
  )
}

/* ── Player row ──────────────────────────────────────────────────────── */
function PlayerRow({ player: p, rank, tab, maxVal, onClick, onCompare, isComparing }) {
  const val    = p[tab.stat] ?? 0
  const pct    = maxVal > 0 ? (val / maxVal) * 100 : 0
  const top3   = rank <= 3
  const medals = { 1:'🥇', 2:'🥈', 3:'🥉' }

  return (
    <div onClick={onClick}
         className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 active:bg-white/8
                     transition cursor-pointer ${top3 ? 'bg-white/2' : ''}`}>

      <div className="w-7 text-center flex-shrink-0">
        {top3
          ? <span className="text-base">{medals[rank]}</span>
          : <span className="text-sm font-bold text-white/30">{rank}</span>}
      </div>

      {p.team_crest
        ? <img src={p.team_crest} alt={p.team_name??''} className="w-7 h-7 object-contain flex-shrink-0"
               onError={e=>e.currentTarget.style.display='none'} />
        : <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-black flex-shrink-0">{p.name?.[0]}</div>
      }

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-bold text-sm truncate ${top3 ? 'text-white' : 'text-white/80'}`}>{p.name}</span>
          {p.position && p.position !== 'Unknown' && (
            <span className={`chip text-[9px] font-bold border hidden sm:inline-flex ${POS_COLOR[p.position]??POS_COLOR.Unknown}`}>
              {POS_LABEL[p.position]}
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/35 truncate">{p.team_name ?? '—'}</p>
        <div className="mt-1.5 h-1 w-full max-w-[200px] bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500
            ${rank === 1 ? 'bg-brand-green' : rank <= 3 ? 'bg-brand-green/60' : 'bg-white/20'}`}
               style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex-shrink-0 text-right min-w-[40px]">
        <span className={`text-xl font-black tabular-nums ${top3 ? tab.color : 'text-white/70'}`}>{val}</span>
      </div>

      <div className="hidden lg:flex items-center gap-4 text-xs text-white/30 flex-shrink-0 min-w-[160px] justify-end">
        {tab.key !== 'goals'        && <span>⚽ {p.goals??0}</span>}
        {tab.key !== 'assists'      && <span>🎯 {p.assists??0}</span>}
        {tab.key !== 'appearances'  && <span>📋 {p.appearances??0}</span>}
        {tab.key !== 'yellow_cards' && <span>🟨 {p.yellow_cards??0}</span>}
        {(p.red_cards??0) > 0       && <span>🟥 {p.red_cards}</span>}
      </div>

      {/* Botão comparar */}
      <button
        onClick={e => { e.stopPropagation(); onCompare(p) }}
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs
                    transition-all border
                    ${isComparing
                      ? 'bg-brand-green/20 border-brand-green/40 text-brand-green'
                      : 'bg-white/5 border-white/10 text-white/30 hover:text-white hover:bg-white/10'}`}
        title="Comparar jogador">
        ⚖️
      </button>
    </div>
  )
}

/* ── Form ────────────────────────────────────────────────────────────── */
function PlayerForm({ form, onChange, onSubmit, onCancel, submitting }) {
  return (
    <form onSubmit={onSubmit} className="card p-5 sm:p-6 mb-6 border-brand-green/20">
      <h3 className="font-black text-lg mb-5">👤 Cadastrar Jogador</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Field label="Nome *"        name="name"        value={form.name}        onChange={onChange} placeholder="Ex: Pedro" required className="lg:col-span-2" />
        <Field label="Time"          name="team_name"   value={form.team_name}   onChange={onChange} placeholder="Ex: Flamengo" />
        <div>
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Posição</label>
          <select name="position" value={form.position} onChange={onChange}
                  className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2.5
                             text-sm text-white focus:outline-none focus:border-brand-green/50">
            {POSITIONS.map(pos => <option key={pos} value={pos} className="bg-brand-card">{pos}</option>)}
          </select>
        </div>
        <Field label="⚽ Gols"         name="goals"        value={form.goals}        onChange={onChange} type="number" placeholder="0" min="0" />
        <Field label="🎯 Assistências" name="assists"       value={form.assists}      onChange={onChange} type="number" placeholder="0" min="0" />
        <Field label="📋 Jogos"        name="appearances"  value={form.appearances}  onChange={onChange} type="number" placeholder="0" min="0" />
        <Field label="🟨 Amarelos"     name="yellow_cards" value={form.yellow_cards} onChange={onChange} type="number" placeholder="0" min="0" />
        <Field label="🟥 Vermelhos"    name="red_cards"    value={form.red_cards}    onChange={onChange} type="number" placeholder="0" min="0" />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-brand-green text-white font-black text-sm
                           hover:bg-brand-redHover active:scale-95 transition-all disabled:opacity-50">
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" onClick={onCancel}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-brand-border text-sm
                           font-bold hover:bg-white/10 transition-all">
          Cancelar
        </button>
      </div>
    </form>
  )
}

function Field({ label, name, value, onChange, type='text', placeholder='', required=false, min, className='' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange}
             placeholder={placeholder} required={required} min={min}
             className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2.5
                        text-sm text-white placeholder-white/20
                        focus:outline-none focus:border-brand-green/50 transition" />
    </div>
  )
}

function PlayerSkeletons() {
  return (
    <div className="divide-y divide-brand-border">
      {[...Array(8)].map((_,i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className="w-7 h-4 bg-white/8 rounded" />
          <div className="w-7 h-7 rounded-full bg-white/8" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-white/10 rounded w-2/5" />
            <div className="h-2.5 bg-white/5 rounded w-1/4" />
            <div className="h-1 bg-white/5 rounded w-1/3" />
          </div>
          <div className="w-8 h-6 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  )
}

function EmptyPlayers({ onSync }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  async function sync() {
    setLoading(true)
    try {
      const r = await fetch('/api/db/sync', { method: 'POST' })
      const d = await r.json()
      if ((d.players?.synced ?? 0) > 0) {
        setMsg(`✅ ${d.players.synced} jogadores sincronizados!`)
        setTimeout(onSync, 800)
      } else setMsg('⚠️ Nenhum dado encontrado — cadastre manualmente.')
    } catch { setMsg('❌ Erro ao sincronizar') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-12 text-center">
      <p className="text-4xl mb-3">👥</p>
      <p className="text-white/60 font-bold mb-1">Nenhum jogador no banco ainda</p>
      <p className="text-white/30 text-sm mb-5">Sincronize com a ESPN ou cadastre manualmente</p>
      {msg && <p className="text-sm font-bold mb-4 text-brand-green">{msg}</p>}
      <button onClick={sync} disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-accent border border-brand-border
                         text-sm font-bold hover:bg-white/8 transition disabled:opacity-50">
        {loading ? 'Buscando…' : '🔄 Sincronizar com ESPN'}
      </button>
    </div>
  )
}
