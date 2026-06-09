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

// Escudo do time: usa o logo da ESPN ou monta a URL pelo id (mesmo padrão da tabela)
const crestUrl = (team) =>
  team?.logos?.[0]?.href ??
  (team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${team.id}.png` : null)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=10')

  try {
    const league = ALLOWED_LEAGUES.includes(req.query?.league) ? req.query.league : 'bra.1'

    // A ESPN só devolve a rodada atual no scoreboard padrão. Durante pausas
    // (ex: Copa do Mundo) isso fica só com jogos encerrados. Por isso buscamos
    // também uma janela futura (próximos 60 dias) pra trazer os agendados.
    const pad   = (n) => String(n).padStart(2, '0')
    const fmt   = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    const now   = new Date()
    const ahead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    const range = `${fmt(now)}-${fmt(ahead)}`

    const [rNow, rNext] = await Promise.all([
      fetch(`${ESPN_BASE}/${league}/scoreboard`),
      fetch(`${ESPN_BASE}/${league}/scoreboard?dates=${range}`),
    ])
    const [dNow, dNext] = await Promise.all([rNow.json(), rNext.json()])

    // Junta os eventos das duas janelas sem duplicar (por id da ESPN)
    const byId = new Map()
    for (const ev of [...(dNow?.events ?? []), ...(dNext?.events ?? [])]) {
      if (ev?.id && !byId.has(ev.id)) byId.set(ev.id, ev)
    }

    const live = [], results = [], upcoming = []

    for (const ev of byId.values()) {
      const comp   = ev.competitions?.[0] ?? {}
      const sName  = ev.status?.type?.name ?? ''
      const home   = comp.competitors?.find((c) => c.homeAway === 'home') ?? {}
      const away   = comp.competitors?.find((c) => c.homeAway === 'away') ?? {}

      // Horário "a definir": a ESPN usa meia-noite no horário dos EUA como
      // placeholder quando o horário do jogo ainda não foi marcado. Isso cai
      // na madrugada do Brasil (antes das 8h), o que nunca é horário real de
      // jogo do Brasileirão — então tratamos como não definido.
      const kd      = ev.date ? new Date(ev.date) : null
      const brtHour = kd ? (kd.getUTCHours() - 3 + 24) % 24 : null   // Brasília = UTC-3
      const timeTbd = brtHour != null && brtHour < 8

      const match = {
        espnId:      ev.id,
        status:      sName,
        minute:      ev.status?.displayClock ?? null,
        period:      ev.status?.period       ?? null,
        isHalfTime:  sName === 'STATUS_HALFTIME',
        timeTbd,
        serverTs:    Date.now(), // timestamp do servidor para sincronizar
        utcDate:     ev.date ?? null,
        matchday:    comp.notes?.[0]?.headline ?? null,
        venue:       comp.venue?.fullName ?? null,
        homeTeam: { espnId: home.team?.id, name: home.team?.displayName ?? '', abbr: home.team?.abbreviation ?? '', tla: home.team?.abbreviation ?? '', crest: crestUrl(home.team), score: home.score != null ? parseInt(home.score) : null },
        awayTeam: { espnId: away.team?.id, name: away.team?.displayName ?? '', abbr: away.team?.abbreviation ?? '', tla: away.team?.abbreviation ?? '', crest: crestUrl(away.team), score: away.score != null ? parseInt(away.score) : null },
        score: { fullTime: { home: home.score != null ? parseInt(home.score) : null, away: away.score != null ? parseInt(away.score) : null } },
      }

      const isLive     = ['STATUS_IN_PROGRESS','STATUS_HALFTIME'].includes(sName)
      const isFinished = sName.startsWith('STATUS_FINAL') || sName === 'STATUS_FULL_TIME'

      if (isLive)          live.push({ ...match, status: 'IN_PLAY' })
      else if (isFinished) results.push({ ...match, status: 'FINISHED' })
      else                 upcoming.push({ ...match, status: 'SCHEDULED' })
    }

    // Ordena: resultados do mais recente; próximos do mais próximo. Limita.
    const byDateDesc = (a, b) => new Date(b.utcDate || 0) - new Date(a.utcDate || 0)
    const byDateAsc  = (a, b) => new Date(a.utcDate || 0) - new Date(b.utcDate || 0)
    results.sort(byDateDesc)
    upcoming.sort(byDateAsc)
    const resultsOut  = results.slice(0, 20)
    const upcomingOut = upcoming.slice(0, 20)

    // Salva no banco em background
    if (dbAvailable()) {
      saveMatches([...live, ...resultsOut, ...upcomingOut]).catch((e) =>
        console.error('[matches] DB save error:', e.message)
      )
    }

    res.json({ live, results: resultsOut, upcoming: upcomingOut })
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
