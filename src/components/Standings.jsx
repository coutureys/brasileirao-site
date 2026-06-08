import { useState } from 'react'
import { useStandings } from '../hooks/useFootball'
import { SkeletonTableRows, ApiStatusBar } from './Skeleton'
import Tooltip from './Tooltip'

// ── Zone configs por liga ──────────────────────────────────────────────────
const ZONE_CONFIGS = {
  'bra.1': [
    { range: [1, 4], color: 'blue-500', bg: 'bg-blue-500/5', border: 'bg-blue-500', label: 'Libertadores', icon: '🏆' },
    { range: [5, 6], color: 'sky-400', bg: 'bg-sky-400/5', border: 'bg-sky-400', label: 'Pré-Libertadores', icon: '🎯' },
    { range: [7, 12], color: 'amber-400', bg: 'bg-amber-400/5', border: 'bg-amber-400', label: 'Sul-Americana', icon: '⭐' },
    { range: [17, 20], color: 'red-500', bg: 'bg-red-500/10', border: 'bg-red-500', label: 'Rebaixamento', icon: '⬇' },
  ],
  'eng.1': [
    { range: [1, 4], color: 'blue-500', bg: 'bg-blue-500/5', border: 'bg-blue-500', label: 'Champions League', icon: '🏆' },
    { range: [5, 6], color: 'purple-500', bg: 'bg-purple-500/5', border: 'bg-purple-500', label: 'Europa League', icon: '⭐' },
    { range: [18, 20], color: 'red-500', bg: 'bg-red-500/10', border: 'bg-red-500', label: 'Rebaixamento', icon: '⬇' },
  ],
  'esp.1': [
    { range: [1, 4], color: 'blue-500', bg: 'bg-blue-500/5', border: 'bg-blue-500', label: 'Champions League', icon: '🏆' },
    { range: [5, 6], color: 'purple-500', bg: 'bg-purple-500/5', border: 'bg-purple-500', label: 'Europa League', icon: '⭐' },
    { range: [18, 20], color: 'red-500', bg: 'bg-red-500/10', border: 'bg-red-500', label: 'Rebaixamento', icon: '⬇' },
  ],
}

function getZones(league) {
  return ZONE_CONFIGS[league] ?? []
}

function getZone(pos, league) {
  const zones = getZones(league)
  return zones.find((z) => pos >= z.range[0] && pos <= z.range[1]) ?? null
}

// zone border positions (the row just AFTER a cut changes)
const ZONE_CUTS = new Set([4, 6, 12, 16])

function ordinal(n) {
  return `${n}º`
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Standings({ league = 'bra.1', leagueInfo, preview = false }) {
  const [hovered,    setHovered]    = useState(null)
  const [activeGroup,setActiveGroup]= useState(0)
  const { standings, groups, noTable, knockout, rounds, loading, error, source, refetch } = useStandings(league)

  // Modo preview: mostra só top 5
  const displayRows = preview
    ? (groups ? groups[0]?.standings ?? [] : standings ?? []).slice(0, 5)
    : null

  // Para ligas com grupos, usa o grupo selecionado
  const displayStandings = groups ? (groups[activeGroup]?.standings ?? []) : (standings ?? [])

  return (
    <section id="tabela" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-tag" style={leagueInfo ? { color: leagueInfo.color } : {}}>
              {leagueInfo?.flag} {leagueInfo?.name ?? 'Série A'} 2026
            </p>
            <h2 className="section-title mt-1">Classificação</h2>
            <ApiStatusBar source={source} error={error} league={leagueInfo?.short ?? 'Série A'} refetch={refetch} />
          </div>
          {!groups && !noTable && <Legend league={league} />}
        </div>

        {/* Copa eliminatória — mostra jogos por rodada */}
        {noTable && knockout && (
          <div className="space-y-6">
            {loading ? (
              <div className="card p-10 text-center animate-pulse text-white/30">Carregando jogos...</div>
            ) : rounds.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-4xl mb-3">🏆</p>
                <p className="font-bold text-white/60">Nenhum jogo disponível no momento</p>
              </div>
            ) : rounds.map((round, ri) => (
              <div key={ri}>
                <h3 className="text-sm font-black text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-6 h-0.5 rounded-full" style={{ background: leagueInfo?.color ?? '#00E676' }} />
                  {round.name}
                </h3>
                <div className="space-y-2">
                  {round.games.map((m, i) => (
                    <KnockoutMatch key={i} match={m} leagueInfo={leagueInfo} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {noTable && !knockout && (
          <div className="card p-10 text-center">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-bold text-white/60">{leagueInfo?.name} é eliminatória</p>
            <p className="text-white/30 text-sm mt-1">Não possui tabela de classificação</p>
          </div>
        )}

        {/* Seletor de grupos */}
        {groups && !noTable && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
            {groups.map((g, i) => (
              <button key={i} onClick={() => setActiveGroup(i)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 border transition-all
                        ${activeGroup === i
                          ? 'text-white border-white/20 bg-white/10'
                          : 'text-white/40 border-brand-border bg-brand-accent hover:text-white'}`}
                      style={activeGroup === i && leagueInfo ? { borderColor: leagueInfo.color + '50', color: leagueInfo.color } : {}}>
                {g.name}
              </button>
            ))}
          </div>
        )}

        {!noTable && (
        <>
        <p className="sm:hidden text-[10px] text-white/25 text-right mb-2 pr-1 italic">
          deslize para ver mais →
        </p>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 520 }}>
              <thead>
                <tr className="bg-white/5 text-white/40 text-[11px] uppercase tracking-wider">
                  {/* Coluna posição: sticky no mobile */}
                  <th className="px-2 sm:px-4 py-3 text-left w-12 sm:w-14
                                 sticky left-0 bg-brand-card z-10">#</th>
                  {/* Coluna time: sticky no mobile */}
                  <th className="px-2 sm:px-3 py-3 text-left
                                 sticky left-12 sm:left-14 bg-brand-card z-10
                                 after:absolute after:inset-y-0 after:right-0
                                 after:w-px after:bg-white/10">Time</th>
                  <th className="px-3 py-3 text-center w-10" title="Jogos">J</th>
                  <th className="px-3 py-3 text-center w-10" title="Vitórias">V</th>
                  <th className="px-3 py-3 text-center w-10" title="Empates">E</th>
                  <th className="px-3 py-3 text-center w-10" title="Derrotas">D</th>
                  <th className="px-3 py-3 text-center w-10 hidden md:table-cell" title="Gols Pró">GP</th>
                  <th className="px-3 py-3 text-center w-10 hidden md:table-cell" title="Gols Contra">GC</th>
                  <th className="px-3 py-3 text-center w-10" title="Saldo de Gols">SG</th>
                  <th className="px-3 py-3 text-center w-14 hidden lg:table-cell" title="Últimos 5">Forma</th>
                  <th className="px-3 py-3 text-center w-12 font-bold text-white/70" title="Pontos">PTS</th>
                </tr>
              </thead>
              <tbody>
                {loading && <SkeletonTableRows count={preview ? 5 : 10} />}
                {!loading && (displayRows ?? displayStandings ?? []).map((row) => {
                  const zone     = getZone(row.pos, league)
                  const sg       = row.sg ?? (row.gp - row.gc)
                  const isHov    = hovered === row.team
                  const cutLine  = ZONE_CUTS.has(row.pos)
                  const apr      = row.j ? Math.round((row.pts / (row.j * 3)) * 100) : 0
                  const stickyBg = zone
                    ? `bg-brand-card` // sticky cells precisam de bg sólido
                    : 'bg-brand-card'

                  return (
                    <tr
                      key={row.team}
                      onMouseEnter={() => setHovered(row.team)}
                      onMouseLeave={() => setHovered(null)}
                      className={`
                        transition-colors duration-150
                        ${zone ? zone.bg : ''}
                        ${isHov ? 'brightness-125' : ''}
                        ${cutLine ? 'border-b-2 border-white/10' : 'border-b border-white/5'}
                      `}
                    >
                      {/* Posição — sticky com tooltip */}
                      <td className={`px-2 sm:px-4 py-3 sticky left-0 z-10 ${stickyBg}`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1 h-6 rounded-full flex-shrink-0 ${zone ? zone.border : 'bg-white/10'}`} />
                          <Tooltip
                            position="right"
                            text={
                              <div className="space-y-1.5 text-left">
                                <p className="font-bold text-white text-sm">{row.pos}º {row.team}</p>
                                <div className="space-y-0.5 text-[11px]">
                                  <p><span className="text-brand-green font-bold">{row.pts}</span> pts</p>
                                  <p><span className="text-emerald-400 font-bold">{row.sg > 0 ? '+' : ''}{row.sg}</span> saldo</p>
                                  <p><span className="text-blue-400 font-bold">{row.gp}</span> gols marcados</p>
                                </div>
                                <p className="text-[10px] text-white/40 pt-1 border-t border-white/10 mt-1">
                                  1º Pts | 2º Saldo | 3º Gols | 4º C.Direto
                                </p>
                              </div>
                            }
                          >
                            <span className={`font-bold tabular-nums text-sm cursor-help ${row.pos <= 4 ? 'text-white' : 'text-white/50'}`}>
                              {row.pos}
                            </span>
                          </Tooltip>
                        </div>
                      </td>

                      {/* Time — sticky */}
                      <td className={`px-2 sm:px-3 py-2.5 sticky left-12 sm:left-14 z-10 ${stickyBg}
                                      after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-white/10`}>
                        <div className="flex items-center gap-2">
                          <TeamCrest crest={row.crest} name={row.team} size="sm" />
                          <div>
                            <Tooltip
                              position="bottom"
                              text={`${row.pts} pts • ${row.sg > 0 ? '+' : ''}${row.sg} saldo • ${row.gp} gols`}
                            >
                              <p className="font-semibold leading-tight text-sm truncate max-w-[100px] sm:max-w-none cursor-help">
                                {row.team}
                              </p>
                            </Tooltip>
                            <p className="text-[10px] text-white/40 hidden sm:block">{apr}% apr.</p>
                          </div>
                        </div>
                      </td>

                      {/* J */}
                      <td className="px-2 sm:px-3 py-3 text-center text-white/60 tabular-nums text-sm">{row.j}</td>
                      {/* V */}
                      <td className="px-2 sm:px-3 py-3 text-center font-semibold text-emerald-400 tabular-nums text-sm">{row.v}</td>
                      {/* E */}
                      <td className="px-2 sm:px-3 py-3 text-center text-white/50 tabular-nums text-sm">{row.e}</td>
                      {/* D */}
                      <td className="px-2 sm:px-3 py-3 text-center text-red-400/70 tabular-nums text-sm">{row.d}</td>
                      {/* GP GC (só md+) */}
                      <td className="px-2 sm:px-3 py-3 text-center text-white/40 tabular-nums text-sm hidden md:table-cell">{row.gp}</td>
                      <td className="px-2 sm:px-3 py-3 text-center text-white/40 tabular-nums text-sm hidden md:table-cell">{row.gc}</td>

                      {/* Saldo */}
                      <td className="px-3 py-3 text-center tabular-nums font-semibold">
                        <span className={
                          sg > 0 ? 'text-emerald-400' :
                          sg < 0 ? 'text-red-400' :
                          'text-white/40'
                        }>
                          {sg > 0 ? `+${sg}` : sg}
                        </span>
                      </td>

                      {/* Forma (últimos 5) */}
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {(row.form ?? []).map((r, i) => (
                            <FormDot key={i} result={r} />
                          ))}
                        </div>
                      </td>

                      {/* Pontos */}
                      <td className="px-3 py-3 text-center">
                        <span className={`
                          inline-flex items-center justify-center w-9 h-9 rounded-lg
                          text-base font-extrabold tabular-nums transition-all
                          ${row.pos === 1
                            ? 'bg-brand-green/20 text-brand-green ring-1 ring-brand-green/30'
                            : row.pos <= 4
                            ? 'text-white font-extrabold'
                            : row.pos >= 17
                            ? 'text-red-400'
                            : 'text-white/80'}
                        `}>
                          {row.pts}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Link tabela completa no preview */}
        {preview && (
          <a href="/tabela"
             className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl
                        bg-white/5 border border-brand-border text-sm font-bold text-white/50
                        hover:bg-white/8 hover:text-white transition">
            Ver tabela completa →
          </a>
        )}

        {/* Documentação de critérios de desempate */}
        {!groups && !preview && (
          <div className="mt-8 space-y-4">
            {/* Info box */}
            <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">⚖️</span>
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg">Critérios de Desempate</h3>
                  <p className="text-white/40 text-sm mt-1">Como a classificação é definida quando dois times têm o mesmo número de pontos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <p className="font-bold text-white text-sm">Pontos (PTS)</p>
                    <p className="text-white/50 text-xs mt-0.5">Critério principal: vitória (3) + empate (1)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <p className="font-bold text-white text-sm">Saldo de Gols (SG)</p>
                    <p className="text-white/50 text-xs mt-0.5">Diferença entre gols marcados e sofridos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <p className="font-bold text-white text-sm">Gols Marcados (GM)</p>
                    <p className="text-white/50 text-xs mt-0.5">Total de gols que o time fez no campeonato</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">4️⃣</span>
                  <div>
                    <p className="font-bold text-white text-sm">Confronto Direto</p>
                    <p className="text-white/50 text-xs mt-0.5">Resultado dos jogos entre os times empatados</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] text-white/50">
                  <span className="font-bold text-white">Exemplo:</span> Dois times com 60 pontos → vence quem tem maior saldo. Se empatar em saldo, vence quem tem mais gols marcados. E assim por diante.
                </p>
              </div>
            </div>

            {/* Legend forma */}
            <div className="flex flex-wrap gap-4 justify-end">
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span>Forma:</span>
                <FormDot result="W" /> <span className="text-white/40">Vitória</span>
                <FormDot result="D" /> <span className="text-white/40">Empate</span>
                <FormDot result="L" /> <span className="text-white/40">Derrota</span>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </section>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────
function TeamCrest({ crest, name, abbr, size = 'md', className = '' }) {
  const cls = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs'
  if (crest) return (
    <img src={crest} alt=""
         className={`${cls} flex-shrink-0 object-contain ${className}`}
         onError={(e) => { e.currentTarget.style.display = 'none' }} />
  )
  return (
    <div className={`${cls} rounded-full bg-white/10 flex items-center justify-center font-bold flex-shrink-0 ${className}`}>
      {name?.[0]}
    </div>
  )
}

function KnockoutMatch({ match: m, leagueInfo }) {
  const isLive = m.status === 'LIVE'
  const isFt   = m.status === 'FT'
  const hWin   = isFt && Number(m.home.score) > Number(m.away.score)
  const aWin   = isFt && Number(m.away.score) > Number(m.home.score)

  return (
    <div className={`card px-4 py-3 flex items-center gap-3
      ${isLive ? 'border-red-500/25' : 'hover:border-white/12'}`}>
      {/* Status */}
      <div className="w-12 text-center flex-shrink-0">
        {isLive ? (
          <span className="text-[10px] font-black text-red-400 flex items-center gap-1 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />AO VIVO
          </span>
        ) : isFt ? (
          <span className="text-[10px] font-bold text-white/30 uppercase">Final</span>
        ) : (
          <span className="text-[10px] text-brand-green font-bold">
            {m.date ? new Date(m.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}) : '—'}
          </span>
        )}
      </div>

      {/* Casa */}
      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
        {m.home.crest && <img src={m.home.crest} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={e=>e.currentTarget.style.display='none'} />}
        <p className={`text-sm font-bold truncate text-right ${hWin ? 'text-white' : 'text-white/60'}`}>{m.home.name}</p>
      </div>

      {/* Placar */}
      <div className="flex items-center gap-2 flex-shrink-0 text-center">
        {isFt || isLive ? (
          <>
            <span className={`text-xl font-black tabular-nums ${hWin ? 'text-brand-green' : 'text-white/70'}`}>{m.home.score ?? '–'}</span>
            <span className="text-white/20">–</span>
            <span className={`text-xl font-black tabular-nums ${aWin ? 'text-brand-green' : 'text-white/70'}`}>{m.away.score ?? '–'}</span>
          </>
        ) : (
          <span className="text-white/30 text-sm font-bold">
            {m.date ? new Date(m.date).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}) : 'vs'}
          </span>
        )}
      </div>

      {/* Fora */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <p className={`text-sm font-bold truncate ${aWin ? 'text-white' : 'text-white/60'}`}>{m.away.name}</p>
        {m.away.crest && <img src={m.away.crest} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={e=>e.currentTarget.style.display='none'} />}
      </div>
    </div>
  )
}

function FormDot({ result }) {
  const styles = {
    W: 'bg-emerald-500 text-white',
    D: 'bg-amber-400 text-brand-dark',
    L: 'bg-red-500 text-white',
  }
  const labels = { W: 'V', D: 'E', L: 'D' }
  return (
    <span
      title={result === 'W' ? 'Vitória' : result === 'D' ? 'Empate' : 'Derrota'}
      className={`w-5 h-5 rounded-full text-[9px] font-extrabold flex items-center justify-center ${styles[result]}`}
    >
      {labels[result]}
    </span>
  )
}

function Legend({ league }) {
  const zones = getZones(league)

  if (zones.length === 0) return null

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {zones.map((z) => (
        <div key={z.label} className="flex items-center gap-2 text-xs text-white/60">
          <span className={`w-2.5 h-2.5 rounded-sm ${z.border}`} />
          <span>{z.icon} {z.label}</span>
        </div>
      ))}
    </div>
  )
}
