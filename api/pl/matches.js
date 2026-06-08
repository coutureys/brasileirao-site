import { sql, dbAvailable, setupTables } from '../../lib/db.js'

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'

const ALLOWED_LEAGUES = [
  'bra.1','bra.2','bra.copa','conmebol.libertadores',
  'uefa.champions','eng.1','esp.1'
]

const STATUS = {
  STATUS_IN_PROGRESS: 'AO_VIVO',
  STATUS_HALFTIME:    'AO_VIVO',
  STATUS_FULL_TIME:   'ENCERRADO',
  STATUS_FINAL:       'ENCERRADO',
  STATUS_SCHEDULED:   'AGENDADO',
  STATUS_TIMED:       'AGENDADO',
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=10')

  try {
    const league = ALLOWED_LEAGUES.includes(req.query?.league) ? req.query.league : 'bra.1'
    const ESPN   = `${ESPN_BASE}/${league}/scoreboard`
    const r      = await fetch(ESPN)
    const data   = await r.json()

    const live = [], results = [], upcoming = []

    for (const ev of data?.events ?? []) {
      const comp   = ev.competitions?.[0] ?? {}
      const sName  = ev.status?.type?.name ?? ''
      const home   = comp.competitors?.find((c) => c.homeAway === 'home') ?? {}
      const away   = comp.competitors?.find((c) => c.homeAway === 'away') ?? {}

      const match = {
        espnId:      ev.id,
        status:      sName,
        minute:      ev.status?.displayClock ?? null,
        period:      ev.status?.period       ?? null,
        isHalfTime:  sName === 'STATUS_HALFTIME',
        serverTs:    Date.now(), // timestamp do servidor para sincronizar
        utcDate:     ev.date ?? null,
        matchday:    comp.notes?.[0]?.headline ?? null,
        venue:       comp.venue?.fullName ?? null,
        homeTeam: { espnId: home.team?.id, name: home.team?.displayName ?? '', abbr: home.team?.abbreviation ?? '', tla: home.team?.abbreviation ?? '', crest: home.team?.logos?.[0]?.href ?? null, score: home.score != null ? parseInt(home.score) : null },
        awayTeam: { espnId: away.team?.id, name: away.team?.displayName ?? '', abbr: away.team?.abbreviation ?? '', tla: away.team?.abbreviation ?? '', crest: away.team?.logos?.[0]?.href ?? null, score: away.score != null ? parseInt(away.score) : null },
        score: { fullTime: { home: home.score != null ? parseInt(home.score) : null, away: away.score != null ? parseInt(away.score) : null } },
      }

      const isLive     = ['STATUS_IN_PROGRESS','STATUS_HALFTIME'].includes(sName)
      const isFinished = sName.startsWith('STATUS_FINAL') || sName === 'STATUS_FULL_TIME'

      if (isLive)          live.push({ ...match, status: 'IN_PLAY' })
      else if (isFinished) results.push({ ...match, status: 'FINISHED' })
      else                 upcoming.push({ ...match, status: 'SCHEDULED' })
    }

    // Salva no banco em background
    if (dbAvailable()) {
      saveMatches([...live, ...results, ...upcoming]).catch((e) =>
        console.error('[matches] DB save error:', e.message)
      )
    }

    res.json({ live, results, upcoming })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function saveMatches(matches) {
  await setupTables()
  const season = new Date().getFullYear()

  for (const m of matches) {
    const st = STATUS[m.status] ?? 'AGENDADO'
    await sql`
      INSERT INTO matches
        (espn_id, competition, season, status, minute, round, stadium, utc_date,
         home_id, home_name, home_abbr, home_crest, home_score,
         away_id, away_name, away_abbr, away_crest, away_score, synced_at, updated_at)
      VALUES
        (${m.espnId}, 'brasileirao-serie-a', ${season}, ${st}, ${m.minute ?? null},
         ${m.matchday ? `Rodada ${m.matchday}` : null}, ${m.venue ?? null},
         ${m.utcDate ? new Date(m.utcDate) : null},
         ${m.homeTeam.espnId ?? null}, ${m.homeTeam.name}, ${m.homeTeam.abbr ?? null},
         ${m.homeTeam.crest ?? null}, ${m.homeTeam.score ?? null},
         ${m.awayTeam.espnId ?? null}, ${m.awayTeam.name}, ${m.awayTeam.abbr ?? null},
         ${m.awayTeam.crest ?? null}, ${m.awayTeam.score ?? null},
         NOW(), NOW())
      ON CONFLICT (espn_id) DO UPDATE SET
        status = EXCLUDED.status, minute = EXCLUDED.minute,
        home_score = EXCLUDED.home_score, away_score = EXCLUDED.away_score,
        synced_at = NOW(), updated_at = NOW()
    `
  }
  console.log(`[matches] ${matches.length} partidas salvas`)
}
