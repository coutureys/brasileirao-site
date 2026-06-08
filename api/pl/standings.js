import { sql, dbAvailable, setupTables } from '../../lib/db.js'

const ESPN_BASE = 'https://site.api.espn.com/apis/v2/sports/soccer'
const ALLOWED   = ['bra.1','bra.2','bra.copa','conmebol.libertadores','conmebol.sudamericana','uefa.champions','eng.1','esp.1']

// Ligas com fases de grupos (standings por grupo)
const GROUP_LEAGUES = ['conmebol.libertadores','conmebol.sudamericana','uefa.champions']

// Ligas eliminatórias sem tabela tradicional
const NO_TABLE = ['bra.copa']

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')

  try {
    const league = ALLOWED.includes(req.query?.league) ? req.query.league : 'bra.1'

    // Copa do Brasil — busca jogos eliminatórios do scoreboard
    if (NO_TABLE.includes(league)) {
      try {
        const scoreUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`
        const sr       = await fetch(scoreUrl)
        const sd       = await sr.json()
        const events   = sd?.events ?? []

        const matches = events.map(ev => {
          const comp = ev.competitions?.[0] ?? {}
          const home = comp.competitors?.find(c => c.homeAway === 'home') ?? {}
          const away = comp.competitors?.find(c => c.homeAway === 'away') ?? {}
          const sName = ev.status?.type?.name ?? ''
          const finished = sName.startsWith('STATUS_FINAL') || sName === 'STATUS_FULL_TIME'
          const live     = ['STATUS_IN_PROGRESS','STATUS_HALFTIME'].includes(sName)
          return {
            id:       ev.id,
            name:     ev.name,
            round:    comp.notes?.[0]?.headline ?? ev.season?.slug ?? 'Fase atual',
            date:     ev.date,
            status:   finished ? 'FT' : live ? 'LIVE' : 'UPCOMING',
            home: { name: home.team?.displayName ?? '', crest: home.team?.logos?.[0]?.href, score: home.score },
            away: { name: away.team?.displayName ?? '', crest: away.team?.logos?.[0]?.href, score: away.score },
          }
        })

        // Agrupa por rodada
        const rounds = {}
        matches.forEach(m => {
          const r = m.round
          if (!rounds[r]) rounds[r] = []
          rounds[r].push(m)
        })

        return res.json({
          standings: [],
          noTable:   true,
          knockout:  true,
          rounds:    Object.entries(rounds).map(([name, games]) => ({ name, games })),
          message:   `${matches.length} jogos encontrados`,
        })
      } catch {
        return res.json({ standings: [], noTable: true, knockout: true, rounds: [] })
      }
    }

    const ESPN = `${ESPN_BASE}/${league}/standings`
    const r    = await fetch(ESPN)
    const data = await r.json()
    const season = data?.season?.year ?? new Date().getFullYear()

    const st = (stats, name) => stats?.find(s => s.name === name)?.value ?? 0

    const parseEntries = (entries) => entries.map(e => ({
      espnId: e.team?.id ?? '',
      team:   e.team?.displayName ?? '',
      name:   e.team?.displayName ?? '',
      abbr:   e.team?.abbreviation ?? '',
      crest:  e.team?.logos?.[0]?.href ?? null,
      pos:    st(e.stats, 'rank'),
      pts:    st(e.stats, 'points'),
      j:      st(e.stats, 'gamesPlayed'),
      v:      st(e.stats, 'wins'),
      e:      st(e.stats, 'ties'),
      d:      st(e.stats, 'losses'),
      gp:     st(e.stats, 'pointsFor'),
      gc:     st(e.stats, 'pointsAgainst'),
      sg:     st(e.stats, 'pointDifferential'),
      season,
    }))

    const children = data?.children ?? []

    const sortStandings = (arr) =>
      [...arr].sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp)
        .map((t, i) => ({ ...t, pos: i + 1, form: [] }))

    if (GROUP_LEAGUES.includes(league) && children.length > 1) {
      // Retorna todos os grupos ordenados por pontos
      const groups = children.map(child => ({
        name:      child.name ?? child.abbreviation ?? 'Grupo',
        standings: sortStandings(parseEntries(child.standings?.entries ?? [])),
      }))

      return res.json({ standings: groups[0]?.standings ?? [], groups, hasGroups: true })
    }

    // Liga normal (tabela única) — ordena por pontos
    const entries   = children[0]?.standings?.entries ?? []
    const standings = sortStandings(parseEntries(entries))

    res.json({ standings, hasGroups: false })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
