import { useState, useEffect } from 'react'

/* ─── Monta formData a partir dos standings (já tem form + stats) ────────── */
function buildFormData(standing) {
  if (!standing) return null
  const formStr = standing.form ?? []
  const j       = Math.max(1, standing.j ?? 1)
  return {
    formStr,
    stats: {
      wins:         standing.v  ?? formStr.filter(r => r==='W').length,
      draws:        standing.e  ?? formStr.filter(r => r==='D').length,
      losses:       standing.d  ?? formStr.filter(r => r==='L').length,
      goalsFor:     standing.gp ?? 0,
      goalsAgainst: standing.gc ?? 0,
      played:       j,
    },
  }
}

/* ─── Engine de predição ─────────────────────────────────────────────────── */
function formScore(formStr = []) {
  return formStr.reduce((acc, r) => acc + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0)
}

function teamStrength(standing, form) {
  const j    = Math.max(1, standing?.j || 1)
  const ppg  = (standing?.pts || 0) / j
  const gspg = (standing?.gp  || 0) / j
  const gcpg = (standing?.gc  || 0) / j
  const sg   = Math.max(-1, Math.min(1, ((standing?.gp||0) - (standing?.gc||0)) / j / 2))

  // Forma recente dos últimos 5 (peso maior)
  const recentFormScore = form ? formScore(form.formStr) / 15 : 0.5
  const recentGoalsFor  = form ? (form.stats.goalsFor  / Math.max(form.stats.played, 1)) : gspg
  const recentGoalsAg   = form ? (form.stats.goalsAgainst / Math.max(form.stats.played, 1)) : gcpg

  return (
    ppg             * 0.20 +
    gspg            * 0.10 +
    (1-gcpg*0.08)   * 0.10 +
    recentFormScore * 0.30 + // forma recente tem mais peso
    recentGoalsFor  * 0.15 +
    (1-recentGoalsAg*0.1) * 0.10 +
    sg              * 0.05
  )
}

export function predict(homeStanding, awayStanding, homeForm, awayForm) {
  if (!homeStanding || !awayStanding) return null

  const hs  = Math.max(0.1, teamStrength(homeStanding, homeForm))
  const as  = Math.max(0.1, teamStrength(awayStanding, awayForm))
  const adv = 1.12 // vantagem de mando no Brasileirão

  const hw   = hs * adv
  const aw   = as
  const dw   = (hw + aw) * 0.38
  const total = hw + aw + dw

  let pHome = Math.round((hw / total) * 100)
  let pAway = Math.round((aw / total) * 100)
  let pDraw = Math.max(5, 100 - pHome - pAway)
  const sum = pHome + pDraw + pAway
  pHome = Math.round(pHome * 100 / sum)
  pAway = Math.round(pAway * 100 / sum)
  pDraw = 100 - pHome - pAway

  const diff       = Math.abs(hs - as)
  const confidence = diff > 0.35 ? 'alta' : diff > 0.18 ? 'média' : 'baixa'
  const confColor  = { alta: 'text-brand-green', média: 'text-amber-400', baixa: 'text-white/40' }
  const confBg     = { alta: 'bg-brand-green/10 border-brand-green/20', média: 'bg-amber-400/10 border-amber-400/20', baixa: 'bg-white/5 border-white/10' }
  const confIcon   = { alta: '🟢', média: '🟡', baixa: '🔴' }

  // Motivos
  const reasons = []
  if (homeStanding.pos < awayStanding.pos)
    reasons.push(`${homeStanding.team} está melhor na tabela (${homeStanding.pos}º vs ${awayStanding.pos}º)`)
  else if (awayStanding.pos < homeStanding.pos)
    reasons.push(`${awayStanding.team} está melhor na tabela (${awayStanding.pos}º vs ${homeStanding.pos}º)`)

  if (homeForm && awayForm) {
    const hfs = formScore(homeForm.formStr)
    const afs = formScore(awayForm.formStr)
    if (hfs > afs + 3)
      reasons.push(`${homeStanding.team} em melhor forma recente (${hfs}/15 vs ${afs}/15)`)
    else if (afs > hfs + 3)
      reasons.push(`${awayStanding.team} em melhor forma recente (${afs}/15 vs ${hfs}/15)`)

    const hGF = (homeForm.stats.goalsFor / Math.max(homeForm.stats.played,1)).toFixed(1)
    const aGF = (awayForm.stats.goalsFor / Math.max(awayForm.stats.played,1)).toFixed(1)
    if (Number(hGF) > Number(aGF) + 0.4)
      reasons.push(`${homeStanding.team} mais eficiente nos últimos jogos (${hGF} gols/jogo)`)
    else if (Number(aGF) > Number(hGF) + 0.4)
      reasons.push(`${awayStanding.team} mais eficiente nos últimos jogos (${aGF} gols/jogo)`)

    const hGA = (homeForm.stats.goalsAgainst / Math.max(homeForm.stats.played,1)).toFixed(1)
    const aGA = (awayForm.stats.goalsAgainst / Math.max(awayForm.stats.played,1)).toFixed(1)
    if (Number(aGA) > Number(hGA) + 0.4)
      reasons.push(`${awayStanding.team} tem sofrido mais gols recentemente (${aGA}/jogo)`)
  }

  reasons.push(`Mando de campo favorece ${homeStanding.team}`)
  if (pDraw >= 30) reasons.push('Times equilibrados — empate é possibilidade real')

  // Placar estimado
  const hGpg = homeForm
    ? homeForm.stats.goalsFor / Math.max(homeForm.stats.played, 1)
    : (homeStanding.gp || 0) / Math.max(homeStanding.j, 1)
  const aGpg = awayForm
    ? awayForm.stats.goalsFor / Math.max(awayForm.stats.played, 1)
    : (awayStanding.gp || 0) / Math.max(awayStanding.j, 1)

  const scoreHome = Math.max(0, Math.round(hGpg * (pHome > pAway ? 1.1 : 0.9)))
  const scoreAway = Math.max(0, Math.round(aGpg * (pAway > pHome ? 1.1 : 0.9)))

  const maxP    = Math.max(pHome, pDraw, pAway)
  const summary = pHome === maxP
    ? `Favorito: ${homeStanding.team} com ${pHome}% de chance`
    : pAway === maxP
    ? `Favorito: ${awayStanding.team} com ${pAway}% de chance`
    : `Equilíbrio — empate favorito com ${pDraw}%`

  return {
    pHome, pDraw, pAway,
    confidence, confColor: confColor[confidence],
    confBg: confBg[confidence], confIcon: confIcon[confidence],
    reasons: reasons.slice(0, 4),
    summary,
    score: `${scoreHome} - ${scoreAway}`,
    homeForm, awayForm,
  }
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */
export function PredictionModal({ match, standings, onClose }) {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [homeFormData, setHomeFormData] = useState(null)
  const [awayFormData, setAwayFormData] = useState(null)

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => {
    if (!standings?.length) return
    setLoading(true)

    const findStanding = (name) => standings.find(s =>
      s.team?.toLowerCase().includes(name?.toLowerCase().split(' ')[0]) ||
      name?.toLowerCase().includes(s.team?.toLowerCase().split(' ')[0])
    )

    const homeStanding = findStanding(match.home.name)
    const awayStanding = findStanding(match.away.name)

    // Usa form direto dos standings (já tem W/D/L dos últimos 5)
    const hForm = buildFormData(homeStanding)
    const aForm = buildFormData(awayStanding)

    setHomeFormData(hForm)
    setAwayFormData(aForm)
    setResult(predict(homeStanding, awayStanding, hForm, aForm))
    setLoading(false)
  }, [match, standings])

  const homeTeam = match.home.name
  const awayTeam = match.away.name

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-lg bg-brand-card border border-brand-border
                      rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-card border-b border-brand-border px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">🔮 Palpite Inteligente</p>
              <h3 className="font-black text-base mt-0.5">
                {homeTeam.split(' ')[0]} <span className="text-white/30">vs</span> {awayTeam.split(' ')[0]}
              </h3>
            </div>
            <button onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                               hover:bg-white/15 transition text-white/50">✕</button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-white/40">
              <p className="text-4xl mb-3 animate-bounce">🔮</p>
              <p className="font-semibold">Analisando últimas partidas...</p>
              <p className="text-xs mt-1 text-white/25">Buscando dados dos últimos 5 jogos</p>
            </div>
          ) : !result ? (
            <div className="py-12 text-center text-white/40">
              <p className="text-4xl mb-3">📊</p>
              <p>Dados insuficientes para este confronto</p>
            </div>
          ) : (
            <>
              {/* Probabilidades */}
              <div className="card p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-4">Probabilidades</p>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
                  <div className="bg-brand-green rounded-l-full transition-all duration-1000"
                       style={{ width: `${result.pHome}%` }} />
                  <div className="bg-white/20 transition-all duration-1000"
                       style={{ width: `${result.pDraw}%` }} />
                  <div className="bg-blue-500 rounded-r-full transition-all duration-1000"
                       style={{ width: `${result.pAway}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <ProbBox label={homeTeam.split(' ')[0]} value={result.pHome} color="text-brand-green" sub="Casa" />
                  <ProbBox label="Empate"                 value={result.pDraw} color="text-white/50"    sub="Empate" />
                  <ProbBox label={awayTeam.split(' ')[0]} value={result.pAway} color="text-blue-400"    sub="Fora" />
                </div>
              </div>

              {/* Placar */}
              <div className="card p-4 text-center">
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-3">Placar mais provável</p>
                <div className="flex items-center justify-center gap-4">
                  <ScoreBox value={result.score.split(' - ')[0]} color="brand-green" label={homeTeam.split(' ')[0]} />
                  <span className="text-2xl font-black text-white/20">×</span>
                  <ScoreBox value={result.score.split(' - ')[1]} color="blue-400"    label={awayTeam.split(' ')[0]} />
                </div>
              </div>

              {/* Confiança */}
              <div className={`card p-4 border ${result.confBg}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span>{result.confIcon}</span>
                  <span className={`text-xs font-black uppercase tracking-wider ${result.confColor}`}>
                    Confiança {result.confidence}
                  </span>
                </div>
                <p className="text-sm font-bold text-white/90">{result.summary}</p>
              </div>

              {/* Forma dos últimos 5 */}
              <div className="card p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-4">
                  Últimas 5 partidas
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <FormColumn
                    team={homeTeam.split(' ')[0]}
                    formData={homeFormData}
                    color="brand-green"
                  />
                  <FormColumn
                    team={awayTeam.split(' ')[0]}
                    formData={awayFormData}
                    color="blue-400"
                    right
                  />
                </div>
              </div>

              {/* Stats últimos 5 */}
              {(homeFormData || awayFormData) && (
                <div className="card p-4">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-3">
                    Stats — últimos 5 jogos
                  </p>
                  <div className="space-y-3">
                    <StatBar
                      label="Gols marcados"
                      home={homeFormData?.stats.goalsFor ?? 0}
                      away={awayFormData?.stats.goalsFor ?? 0}
                      homeTeam={homeTeam.split(' ')[0]}
                      awayTeam={awayTeam.split(' ')[0]}
                      homeColor="bg-brand-green"
                      awayColor="bg-blue-500"
                    />
                    <StatBar
                      label="Gols sofridos"
                      home={homeFormData?.stats.goalsAgainst ?? 0}
                      away={awayFormData?.stats.goalsAgainst ?? 0}
                      homeTeam={homeTeam.split(' ')[0]}
                      awayTeam={awayTeam.split(' ')[0]}
                      homeColor="bg-red-500"
                      awayColor="bg-red-500"
                      lowerIsBetter
                    />
                    <StatBar
                      label="Vitórias"
                      home={homeFormData?.stats.wins ?? 0}
                      away={awayFormData?.stats.wins ?? 0}
                      homeTeam={homeTeam.split(' ')[0]}
                      awayTeam={awayTeam.split(' ')[0]}
                      homeColor="bg-brand-green"
                      awayColor="bg-blue-500"
                      max={5}
                    />
                  </div>
                </div>
              )}

              {/* Motivos */}
              <div className="card p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-3">💡 Análise</p>
                <ul className="space-y-2">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-brand-green flex-shrink-0 mt-0.5">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[10px] text-white/20 text-center pb-2">
                🤖 Baseado em dados reais: tabela + últimas 5 partidas. Apenas para entretenimento.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function ProbBox({ label, value, color, sub }) {
  return (
    <div>
      <p className={`text-2xl sm:text-3xl font-black tabular-nums ${color}`}>{value}%</p>
      <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>
      <p className="text-[11px] text-white/50 font-semibold mt-0.5">{label}</p>
    </div>
  )
}

function ScoreBox({ value, color, label }) {
  return (
    <div className="text-center">
      <p className="text-xs text-white/30 mb-1.5 truncate max-w-[70px] mx-auto">{label}</p>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black
                       bg-${color}/10 border border-${color}/20 text-${color}`}>
        {value}
      </div>
    </div>
  )
}

function FormColumn({ team, formData, color, right }) {
  const dots = formData?.formStr ?? []
  const dotColor = { W: 'bg-brand-green', D: 'bg-amber-400', L: 'bg-red-500' }
  const dotLabel = { W: 'V', D: 'E', L: 'D' }

  return (
    <div className={right ? 'text-right' : ''}>
      <p className={`text-xs font-black text-${color} mb-2`}>{team}</p>

      {/* Bolinhas W/D/L */}
      <div className={`flex gap-1.5 mb-3 ${right ? 'justify-end' : ''}`}>
        {dots.length > 0 ? dots.map((r, i) => (
          <div key={i}
               className={`w-7 h-7 rounded-full flex items-center justify-center
                           text-[10px] font-black text-white ${dotColor[r] ?? 'bg-white/10'}`}>
            {dotLabel[r]}
          </div>
        )) : (
          <span className="text-xs text-white/25">Sem dados</span>
        )}
      </div>

      {/* Stats resumidas */}
      {formData && (
        <div className={`text-xs text-white/40 space-y-0.5 ${right ? 'text-right' : ''}`}>
          <p><span className="text-brand-green font-bold">{formData.stats.wins}V</span>{' '}
             <span className="text-amber-400 font-bold">{formData.stats.draws}E</span>{' '}
             <span className="text-red-400 font-bold">{formData.stats.losses}D</span>
          </p>
          <p>{formData.stats.goalsFor} gols marcados</p>
          <p>{formData.stats.goalsAgainst} sofridos</p>
        </div>
      )}
    </div>
  )
}

function StatBar({ label, home, away, homeTeam, awayTeam, homeColor, awayColor, max, lowerIsBetter }) {
  const total = max ?? Math.max(home, away, 1)
  const hPct  = Math.min(100, (home / total) * 100)
  const aPct  = Math.min(100, (away / total) * 100)
  const hWins = lowerIsBetter ? home <= away : home >= away

  return (
    <div>
      <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
        <span className={`font-black tabular-nums ${hWins ? 'text-white/70' : 'text-white/30'}`}>{home}</span>
        <span className="uppercase tracking-wider">{label}</span>
        <span className={`font-black tabular-nums ${!hWins ? 'text-white/70' : 'text-white/30'}`}>{away}</span>
      </div>
      <div className="flex gap-0.5 h-2">
        <div className="flex-1 bg-white/5 rounded-l-full overflow-hidden flex justify-end">
          <div className={`h-full rounded-l-full transition-all duration-700 ${homeColor}`}
               style={{ width: `${hPct}%` }} />
        </div>
        <div className="flex-1 bg-white/5 rounded-r-full overflow-hidden">
          <div className={`h-full rounded-r-full transition-all duration-700 ${awayColor}`}
               style={{ width: `${aPct}%` }} />
        </div>
      </div>
    </div>
  )
}
