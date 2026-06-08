/**
 * 🏆 PHASES — Dados de fases/grupos/eliminatórias
 * Retorna estrutura completa: grupos → R16 → Quartas → Semis → Final
 */
import { sql } from '../../lib/db.js'

const ESPN_BASE = 'https://site.api.espn.com/apis/v2/sports/soccer'

// Competições com múltiplas fases
const PHASE_LEAGUES = ['uefa.champions', 'conmebol.libertadores', 'conmebol.sudamericana']

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60')

  try {
    const league = req.query?.league ?? 'uefa.champions'

    if (!PHASE_LEAGUES.includes(league)) {
      return res.status(400).json({ error: 'Liga sem fases de eliminação' })
    }

    const ESPN = `${ESPN_BASE}/${league}/standings`
    const r = await fetch(ESPN)
    const data = await r.json()

    // ── Extrai estrutura de fases da ESPN ──────────────────────────────
    const children = data?.children ?? []
    const parseTeam = (team) => ({
      name: team?.displayName ?? '—',
      abbr: team?.abbreviation ?? '—',
      crest: team?.logos?.[0]?.href ?? null,
      id: team?.id ?? '',
    })

    const phases = {
      groups: [],
      round16: [],
      quarterfinals: [],
      semifinals: [],
      final: null,
    }

    // ── Fase de Grupos ─────────────────────────────────────────────────
    const groupChildren = children.filter(c => c.name?.includes('Group') || c.abbreviation?.match(/^[A-H]$/))

    if (groupChildren.length > 0) {
      phases.groups = groupChildren.map(group => {
        const entries = group.standings?.entries ?? []
        const standings = entries
          .map((e, i) => ({
            pos: i + 1,
            team: parseTeam(e.team),
            pts: e.stats?.find(s => s.name === 'points')?.value ?? 0,
            gp: e.stats?.find(s => s.name === 'pointsFor')?.value ?? 0,
            gc: e.stats?.find(s => s.name === 'pointsAgainst')?.value ?? 0,
            sg: e.stats?.find(s => s.name === 'pointDifferential')?.value ?? 0,
          }))
          .sort((a, b) => b.pts - a.pts || b.sg - a.sg)
          .map((t, i) => ({ ...t, pos: i + 1 }))

        // Top 2 se classificam (ou top 8 em algumas competições)
        const qualified = standings.slice(0, 2)
        const eliminated = standings.slice(2)

        return {
          name: group.name ?? group.abbreviation ?? 'Grupo',
          standings,
          qualified,
          eliminated,
        }
      })
    }

    // ── Fase Eliminatória (busca de matches) ────────────────────────────
    try {
      const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`
      const sb = await fetch(scoreboardUrl)
      const scoreData = await sb.json()
      const events = scoreData?.events ?? []

      // Mapeia rodadas para fases
      const phaseMap = {
        'Round of 16': 'round16',
        'Quarterfinals': 'quarterfinals',
        'Semifinals': 'semifinals',
        'Final': 'final',
      }

      events.forEach(ev => {
        const comp = ev.competitions?.[0] ?? {}
        const home = comp.competitors?.find(c => c.homeAway === 'home')
        const away = comp.competitors?.find(c => c.homeAway === 'away')

        const match = {
          id: ev.id,
          date: ev.date,
          status: ev.status?.type?.name ?? 'SCHEDULED',
          home: {
            name: home?.team?.displayName ?? '',
            abbr: home?.team?.abbreviation ?? '',
            crest: home?.team?.logos?.[0]?.href ?? null,
            score: home?.score ?? null,
          },
          away: {
            name: away?.team?.displayName ?? '',
            abbr: away?.team?.abbreviation ?? '',
            crest: away?.team?.logos?.[0]?.href ?? null,
            score: away?.score ?? null,
          },
        }

        const note = comp.notes?.[0]?.headline ?? ''
        let phaseKey = null

        if (note.includes('Round of 16')) phaseKey = 'round16'
        else if (note.includes('Quarterfinal')) phaseKey = 'quarterfinals'
        else if (note.includes('Semifinal')) phaseKey = 'semifinals'
        else if (note.includes('Final')) phaseKey = 'final'

        if (phaseKey) {
          if (phaseKey === 'final') {
            phases.final = match
          } else {
            phases[phaseKey].push(match)
          }
        }
      })
    } catch (e) {
      console.log('Erro ao buscar matches de eliminatória:', e.message)
    }

    res.json({
      league,
      season: data?.season?.year ?? new Date().getFullYear(),
      phases,
      message: `${phases.groups.length} grupos encontrados`,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
