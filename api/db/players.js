import { sql, setupTables } from '../../lib/db.js'

// Cache de artilheiros por liga (5 min TTL)
const leagueCache = {}
const CACHE_TTL = 5 * 60 * 1000

// Busca artilheiros via ESPN scoreboard para ligas externas
async function fetchLeagueScorers(league, sortBy = 'goals', limit = 30) {
  const cacheKey = `${league}-${sortBy}`
  if (leagueCache[cacheKey] && Date.now() - leagueCache[cacheKey].ts < CACHE_TTL) {
    return leagueCache[cacheKey].data
  }

  const ESPN = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`
  const r    = await fetch(ESPN)
  const data = await r.json()
  const events = data?.events ?? []

  // Agrega gols, assistências e cartões por jogador
  const playerMap = {}

  for (const ev of events) {
    const comp    = ev.competitions?.[0] ?? {}
    const details = comp.details ?? []
    const teams   = {}
    for (const c of comp.competitors ?? []) {
      teams[c.team?.id] = c.team?.displayName ?? ''
    }

    for (const d of details) {
      const players = d.athletesInvolved ?? []
      const teamName = teams[d.team?.id] ?? ''

      if (d.scoringPlay && !d.ownGoal) {
        const p = players[0]
        if (!p) continue
        const key = p.id ?? p.displayName
        if (!playerMap[key]) playerMap[key] = { name: p.displayName ?? p.shortName, team_name: teamName, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, appearances: 0, position: 'Unknown' }
        playerMap[key].goals += d.scoreValue ?? 1
        if (players[1]) {
          const aKey = players[1].id ?? players[1].displayName
          if (!playerMap[aKey]) playerMap[aKey] = { name: players[1].displayName, team_name: teamName, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, appearances: 0, position: 'Unknown' }
          playerMap[aKey].assists++
        }
      }
      if (d.yellowCard) {
        const p = players[0]; if (!p) continue
        const key = p.id ?? p.displayName
        if (!playerMap[key]) playerMap[key] = { name: p.displayName ?? '', team_name: teamName, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, appearances: 0, position: 'Unknown' }
        playerMap[key].yellow_cards++
      }
      if (d.redCard) {
        const p = players[0]; if (!p) continue
        const key = p.id ?? p.displayName
        if (!playerMap[key]) playerMap[key] = { name: p.displayName ?? '', team_name: teamName, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, appearances: 0, position: 'Unknown' }
        playerMap[key].red_cards++
      }
    }
  }

  let players = Object.values(playerMap)
    .filter(p => p.name && p.name.length > 1)

  // Ordena pelo critério
  const sortField = sortBy === 'assists' ? 'assists' : sortBy === 'yellow_cards' ? 'yellow_cards' : 'goals'
  players = players
    .filter(p => p[sortField] > 0)
    .sort((a, b) => b[sortField] - a[sortField])
    .slice(0, limit)
    .map((p, i) => ({ ...p, id: `${league}-${i}`, season: new Date().getFullYear() }))

  leagueCache[cacheKey] = { data: players, ts: Date.now() }
  return players
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'POST') return upsertPlayer(req, res)
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  try {
    await setupTables()

    const {
      team,
      position,
      league   = 'bra.1',
      sortBy   = 'goals',
      limit    = 30,
      page     = 1,
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)
    const lim    = Number(limit)

    // Mapeia league ID → competition name no banco
    const LEAGUE_MAP = {
      'bra.1':                 'brasileirao-serie-a',
      'bra.2':                 'brasileirao-serie-b',
      'bra.copa':              'copa-do-brasil',
      'conmebol.libertadores': 'copa-libertadores',
      'uefa.champions':        'champions-league',
      'eng.1':                 'premier-league',
      'esp.1':                 'la-liga',
    }
    const competition = LEAGUE_MAP[league] ?? 'brasileirao-serie-a'

    // Usa o ano com mais jogadores no banco (não necessariamente o ano atual)
    const [seasonRow] = await sql`
      SELECT season, COUNT(*) as cnt
      FROM players
      WHERE competition = ${competition}
      GROUP BY season
      ORDER BY cnt DESC
      LIMIT 1
    `
    const s = seasonRow?.season ?? new Date().getFullYear()

    // Se não tem dados no banco, tenta ESPN como fallback
    const [{ count: checkCount }] = await sql`SELECT COUNT(*) FROM players WHERE competition=${competition}`
    if (Number(checkCount) === 0) {
      const espnData = await fetchLeagueScorers(league, sortBy, lim)
      return res.json({ data: espnData, meta: { total: espnData.length, page: 1, limit: lim, totalPages: 1 }, source: 'espn-fallback' })
    }

    // Subquery: deduplica por nome PRIMEIRO, filtra quem tem stat > 0, depois ordena e pagina
    let rows
    if (sortBy === 'assists') {
      rows = await sql`
        SELECT * FROM (
          SELECT DISTINCT ON (name) * FROM players
          WHERE season=${s} AND competition=${competition} AND assists > 0
          ORDER BY name, assists DESC, id DESC
        ) t
        ORDER BY assists DESC, goals DESC
        LIMIT ${lim} OFFSET ${offset}
      `
    } else if (sortBy === 'appearances') {
      rows = await sql`
        SELECT * FROM (
          SELECT DISTINCT ON (name) * FROM players
          WHERE season=${s} AND competition=${competition} AND appearances > 0
          ORDER BY name, appearances DESC, id DESC
        ) t
        ORDER BY appearances DESC, goals DESC
        LIMIT ${lim} OFFSET ${offset}
      `
    } else if (sortBy === 'yellow_cards') {
      rows = await sql`
        SELECT * FROM (
          SELECT DISTINCT ON (name) * FROM players
          WHERE season=${s} AND competition=${competition} AND yellow_cards > 0
          ORDER BY name, yellow_cards DESC, id DESC
        ) t
        ORDER BY yellow_cards DESC, appearances DESC
        LIMIT ${lim} OFFSET ${offset}
      `
    } else {
      rows = await sql`
        SELECT * FROM (
          SELECT DISTINCT ON (name) * FROM players
          WHERE season=${s} AND competition=${competition} AND goals > 0
          ORDER BY name, goals DESC, id DESC
        ) t
        ORDER BY goals DESC, assists DESC
        LIMIT ${lim} OFFSET ${offset}
      `
    }

    const [{ count }] = await sql`
      SELECT COUNT(*) FROM players
      WHERE season=${s} AND competition=${competition}
    `

    res.json({
      data: rows,
      meta: {
        total: Number(count),
        page: Number(page),
        limit: lim,
        totalPages: Math.ceil(Number(count) / lim),
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function upsertPlayer(req, res) {
  try {
    await setupTables()

    const {
      name, team_name, team_id, team_crest, position,
      appearances = 0, goals = 0, assists = 0,
      yellow_cards = 0, red_cards = 0, minutes_played = 0,
      espn_id, season,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Campo name é obrigatório' })
    }

    const s = season ?? new Date().getFullYear()

    let rows
    if (espn_id) {
      rows = await sql`
        INSERT INTO players
          (espn_id, competition, season, name, team_name, team_id, team_crest,
           position, appearances, goals, assists, yellow_cards, red_cards,
           minutes_played, synced_at, updated_at)
        VALUES
          (${espn_id}, 'brasileirao-serie-a', ${s}, ${name.trim()},
           ${team_name ?? null}, ${team_id ?? null}, ${team_crest ?? null},
           ${position ?? 'Unknown'}, ${Number(appearances)}, ${Number(goals)},
           ${Number(assists)}, ${Number(yellow_cards)}, ${Number(red_cards)},
           ${Number(minutes_played)}, NOW(), NOW())
        ON CONFLICT (espn_id, season, competition) DO UPDATE SET
          goals         = EXCLUDED.goals,
          assists       = EXCLUDED.assists,
          appearances   = EXCLUDED.appearances,
          yellow_cards  = EXCLUDED.yellow_cards,
          red_cards     = EXCLUDED.red_cards,
          minutes_played= EXCLUDED.minutes_played,
          team_name     = EXCLUDED.team_name,
          synced_at     = NOW(), updated_at = NOW()
        RETURNING *
      `
    } else {
      rows = await sql`
        INSERT INTO players
          (competition, season, name, team_name, team_id, team_crest,
           position, appearances, goals, assists, yellow_cards, red_cards,
           minutes_played, synced_at, updated_at)
        VALUES
          ('brasileirao-serie-a', ${s}, ${name.trim()},
           ${team_name ?? null}, ${team_id ?? null}, ${team_crest ?? null},
           ${position ?? 'Unknown'}, ${Number(appearances)}, ${Number(goals)},
           ${Number(assists)}, ${Number(yellow_cards)}, ${Number(red_cards)},
           ${Number(minutes_played)}, NOW(), NOW())
        RETURNING *
      `
    }

    res.status(201).json({ data: rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
