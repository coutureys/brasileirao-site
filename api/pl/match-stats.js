/**
 * GET /api/pl/match-stats?id={espnId}&league={league}
 * Estatísticas REAIS da partida via ESPN summary endpoint.
 * Retorna stats pareadas (casa x visitante) prontas para renderizar barras.
 */

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'

const ALLOWED_LEAGUES = [
  'bra.1', 'bra.2', 'bra.copa', 'conmebol.libertadores',
  'uefa.champions', 'eng.1', 'esp.1',
]

// Quais stats mostrar, em ordem, com rótulo em PT-BR.
// (os 'name' batem com o que a ESPN retorna em boxscore.teams[].statistics)
const STAT_MAP = [
  { key: 'possessionPct',  label: 'Posse de bola' },
  { key: 'totalShots',     label: 'Finalizações' },
  { key: 'shotsOnTarget',  label: 'Finalizações no gol' },
  { key: 'wonCorners',     label: 'Escanteios' },
  { key: 'saves',          label: 'Defesas do goleiro' },
  { key: 'foulsCommitted', label: 'Faltas' },
  { key: 'offsides',       label: 'Impedimentos' },
  { key: 'yellowCards',    label: 'Cartões amarelos' },
  { key: 'redCards',       label: 'Cartões vermelhos' },
  { key: 'totalPasses',    label: 'Passes' },
  { key: 'passPct',        label: 'Acerto de passe' },
]

// Stats que são porcentagem (ESPN às vezes manda 0-1, às vezes 0-100)
const PCT_KEYS = new Set(['possessionPct', 'passPct'])

function getStat(list, key) {
  const s = (list || []).find((x) => x.name === key)
  if (!s) return null
  const raw = s.value != null ? Number(s.value) : parseFloat(s.displayValue)
  return { raw: isNaN(raw) ? 0 : raw, display: s.displayValue ?? '0' }
}

function fmtPct(v) {
  if (v == null) return '0%'
  const n = v <= 1 ? v * 100 : v // normaliza 0-1 -> 0-100
  return `${Math.round(n)}%`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id obrigatório' })

  const league = ALLOWED_LEAGUES.includes(req.query?.league) ? req.query.league : 'bra.1'

  try {
    const r = await fetch(`${ESPN_BASE}/${league}/summary?event=${encodeURIComponent(id)}`)
    const data = await r.json()

    const teams = data?.boxscore?.teams ?? []
    if (teams.length < 2) {
      return res.json({ found: false, stats: [] })
    }

    // Descobre qual é casa/visitante
    const homeT = teams.find((t) => t.homeAway === 'home') ?? teams[0]
    const awayT = teams.find((t) => t.homeAway === 'away') ?? teams[1]
    const homeStats = homeT.statistics ?? []
    const awayStats = awayT.statistics ?? []

    const stats = STAT_MAP.map(({ key, label }) => {
      const h = getStat(homeStats, key)
      const a = getStat(awayStats, key)
      if (!h && !a) return null
      const isPct = PCT_KEYS.has(key)
      return {
        key,
        label,
        isPct,
        home: { value: h?.raw ?? 0, display: isPct ? fmtPct(h?.raw) : (h?.display ?? '0') },
        away: { value: a?.raw ?? 0, display: isPct ? fmtPct(a?.raw) : (a?.display ?? '0') },
      }
    }).filter(Boolean)

    res.json({
      found: stats.length > 0,
      home: {
        name:  homeT.team?.displayName ?? '',
        crest: homeT.team?.logos?.[0]?.href ?? null,
      },
      away: {
        name:  awayT.team?.displayName ?? '',
        crest: awayT.team?.logos?.[0]?.href ?? null,
      },
      stats,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
