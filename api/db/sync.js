import { sql, setupTables } from '../../lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' })

  const secret = process.env.SYNC_SECRET
  if (secret && req.headers['x-sync-secret'] !== secret)
    return res.status(401).json({ error: 'Não autorizado' })

  try {
    await setupTables()
    const [matches, teams, players] = await Promise.allSettled([
      syncMatches(), syncTeams(), syncPlayers()
    ])

    res.json({
      syncedAt: new Date().toISOString(),
      matches:  matches.status  === 'fulfilled' ? matches.value  : { error: matches.reason?.message },
      teams:    teams.status    === 'fulfilled' ? teams.value    : { error: teams.reason?.message },
      players:  players.status  === 'fulfilled' ? players.value  : { error: players.reason?.message },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function syncMatches() {
  const data = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard').then(r => r.json())
  const season = new Date().getFullYear()
  const STATUS = { STATUS_IN_PROGRESS:'AO_VIVO', STATUS_HALFTIME:'AO_VIVO', STATUS_FULL_TIME:'ENCERRADO', STATUS_FINAL:'ENCERRADO', STATUS_SCHEDULED:'AGENDADO', STATUS_TIMED:'AGENDADO' }
  let saved = 0

  for (const ev of data?.events ?? []) {
    const comp  = ev.competitions?.[0] ?? {}
    const sName = ev.status?.type?.name ?? 'STATUS_SCHEDULED'
    const home  = comp.competitors?.find(c => c.homeAway === 'home') ?? {}
    const away  = comp.competitors?.find(c => c.homeAway === 'away') ?? {}

    await sql`
      INSERT INTO matches (espn_id, competition, season, status, minute, round, stadium, utc_date,
        home_id, home_name, home_abbr, home_crest, home_score,
        away_id, away_name, away_abbr, away_crest, away_score, synced_at, updated_at)
      VALUES (${ev.id}, 'brasileirao-serie-a', ${season}, ${STATUS[sName] ?? 'AGENDADO'},
        ${ev.status?.displayClock ?? null}, ${comp.notes?.[0]?.headline ?? null},
        ${comp.venue?.fullName ?? null}, ${ev.date ? new Date(ev.date) : null},
        ${home.team?.id ?? null}, ${home.team?.displayName ?? ''}, ${home.team?.abbreviation ?? null},
        ${home.team?.logos?.[0]?.href ?? null}, ${home.score != null ? parseInt(home.score) : null},
        ${away.team?.id ?? null}, ${away.team?.displayName ?? ''}, ${away.team?.abbreviation ?? null},
        ${away.team?.logos?.[0]?.href ?? null}, ${away.score != null ? parseInt(away.score) : null},
        NOW(), NOW())
      ON CONFLICT (espn_id) DO UPDATE SET
        status = EXCLUDED.status, minute = EXCLUDED.minute,
        home_score = EXCLUDED.home_score, away_score = EXCLUDED.away_score, synced_at = NOW(), updated_at = NOW()
    `
    saved++
  }
  return { synced: saved }
}

async function syncTeams() {
  const data    = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/bra.1/standings').then(r => r.json())
  const entries = data?.children?.[0]?.standings?.entries ?? []
  const season  = data?.season?.year ?? new Date().getFullYear()
  const st      = (stats, name) => stats?.find(s => s.name === name)?.value ?? 0

  for (const e of entries) {
    await sql`
      INSERT INTO teams (espn_id, competition, season, name, abbr, crest, position, points, played, wins, draws, losses, goals_for, goals_against, goal_diff, synced_at, updated_at)
      VALUES (${e.team?.id ?? ''}, 'brasileirao-serie-a', ${season}, ${e.team?.displayName ?? ''}, ${e.team?.abbreviation ?? null}, ${e.team?.logos?.[0]?.href ?? null},
        ${st(e.stats,'rank')}, ${st(e.stats,'points')}, ${st(e.stats,'gamesPlayed')}, ${st(e.stats,'wins')}, ${st(e.stats,'ties')}, ${st(e.stats,'losses')},
        ${st(e.stats,'pointsFor')}, ${st(e.stats,'pointsAgainst')}, ${st(e.stats,'pointDifferential')}, NOW(), NOW())
      ON CONFLICT (espn_id, season, competition) DO UPDATE SET
        position = EXCLUDED.position, points = EXCLUDED.points, played = EXCLUDED.played,
        wins = EXCLUDED.wins, draws = EXCLUDED.draws, losses = EXCLUDED.losses,
        goals_for = EXCLUDED.goals_for, goals_against = EXCLUDED.goals_against,
        goal_diff = EXCLUDED.goal_diff, synced_at = NOW(), updated_at = NOW()
    `
  }
  return { synced: entries.length }
}

async function syncPlayers() {
  const season = new Date().getFullYear()

  // Busca TODOS os jogos da temporada com detalhes de gols/cartões
  const url  = `https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?dates=${season}0101-${season}1231&limit=500`
  const data = await fetch(url).then(r => r.json())

  // Acumula stats por atleta (id → stats)
  const byAthlete = new Map()

  const GOAL_TYPES = new Set(['Goal','Goal - Free-kick','Goal - Header','Goal - Volley','Penalty - Scored'])

  for (const ev of data?.events ?? []) {
    const comp   = ev.competitions?.[0] ?? {}
    const status = ev.status?.type?.name ?? ''

    // Só processa jogos finalizados
    if (!['STATUS_FULL_TIME','STATUS_FINAL'].includes(status) && !status.startsWith('STATUS_FINAL')) continue

    // Jogadores que participaram (para appearances)
    const competitors = comp.competitors ?? []
    const teamById    = {}
    for (const c of competitors) {
      if (c.team?.id) teamById[c.team.id] = { name: c.team.displayName, crest: c.team.logos?.[0]?.href ?? null }
    }

    for (const det of comp.details ?? []) {
      const typeText = det.type?.text ?? ''
      const ath      = det.athletesInvolved?.[0]
      if (!ath) continue

      // Inicializa jogador se novo
      if (!byAthlete.has(ath.id)) {
        const teamInfo = teamById[ath.team?.id] ?? {}
        byAthlete.set(ath.id, {
          espnId:    ath.id,
          name:      ath.displayName ?? ath.fullName ?? '',
          teamName:  ath.team ? (teamInfo.name ?? null) : null,
          teamId:    ath.team?.id ?? null,
          teamCrest: ath.team ? (teamInfo.crest ?? null) : null,
          goals: 0, yellowCards: 0, redCards: 0,
        })
      }

      const p = byAthlete.get(ath.id)

      if (GOAL_TYPES.has(typeText) && !det.ownGoal) p.goals++
      else if (typeText === 'Yellow Card') p.yellowCards++
      else if (typeText === 'Red Card')    p.redCards++
    }
  }

  // Upsert no banco
  let saved = 0
  for (const p of byAthlete.values()) {
    if (!p.name) continue
    await sql`
      INSERT INTO players
        (espn_id, competition, season, name, team_name, team_id, team_crest,
         goals, yellow_cards, red_cards, synced_at, updated_at)
      VALUES
        (${p.espnId}, 'brasileirao-serie-a', ${season}, ${p.name},
         ${p.teamName ?? null}, ${p.teamId ?? null}, ${p.teamCrest ?? null},
         ${p.goals}, ${p.yellowCards}, ${p.redCards}, NOW(), NOW())
      ON CONFLICT (espn_id, season, competition) DO UPDATE SET
        goals        = EXCLUDED.goals,
        yellow_cards = EXCLUDED.yellow_cards,
        red_cards    = EXCLUDED.red_cards,
        team_name    = EXCLUDED.team_name,
        team_crest   = EXCLUDED.team_crest,
        synced_at    = NOW(), updated_at = NOW()
    `
    saved++
  }
  return { synced: saved, total: data?.events?.length ?? 0 }
}
