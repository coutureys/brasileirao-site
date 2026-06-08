/**
 * GET /api/pl/match-events?id={espnId}
 * Retorna timeline de eventos de uma partida via ESPN
 */

const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=10')

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id obrigatório' })

  try {
    const r    = await fetch(ESPN)
    const data = await r.json()

    const event = (data.events ?? []).find(ev => ev.id === id)
    if (!event) return res.json({ events: [], found: false })

    const comp    = event.competitions?.[0] ?? {}
    const details = comp.details ?? []
    const teams   = {}

    // Mapeia times por ID
    for (const c of comp.competitors ?? []) {
      teams[c.team?.id] = {
        name:  c.team?.displayName ?? '',
        crest: c.team?.logos?.[0]?.href ?? null,
        side:  c.homeAway === 'home' ? 'home' : 'away',
      }
    }

    // Placar acumulado por time
    let homeScore = 0, awayScore = 0

    const events = details.map((d, i) => {
      const typeText = d.type?.text ?? ''
      const minute   = d.clock?.displayValue ?? '—'
      const teamId   = d.team?.id
      const team     = teams[teamId]
      const players  = d.athletesInvolved ?? []
      const p1       = players[0]
      const p2       = players[1]

      let kind, icon, label

      if (d.scoringPlay) {
        if (team?.side === 'home') homeScore += d.scoreValue ?? 1
        else                       awayScore += d.scoreValue ?? 1

        kind  = d.ownGoal      ? 'own_goal'  :
                d.penaltyKick  ? 'penalty'   : 'goal'
        icon  = d.ownGoal ? '⚽🔄' : d.penaltyKick ? '⚽🎯' : '⚽'
        label = d.ownGoal ? 'Gol contra' : d.penaltyKick ? 'Pênalti' : 'Gol'
      } else if (d.redCard) {
        kind = 'red_card'; icon = '🟥'; label = 'Cartão Vermelho'
      } else if (d.yellowCard) {
        kind = typeText.includes('Second') || typeText.includes('Yellow-Red')
          ? 'yellow_red' : 'yellow_card'
        icon  = kind === 'yellow_red' ? '🟨🟥' : '🟨'
        label = kind === 'yellow_red' ? '2º Amarelo' : 'Cartão Amarelo'
      } else if (typeText.includes('Substitution') || d.type?.id === '58' || d.type?.id === '59') {
        kind = 'substitution'; icon = '🔄'; label = 'Substituição'
      } else {
        kind = 'other'; icon = '📋'; label = typeText
      }

      return {
        id:         `${id}-${i}`,
        kind,
        icon,
        label,
        minute,
        clockValue: d.clock?.value ?? 0,
        side:       team?.side ?? 'home',
        team:       team?.name ?? '',
        teamCrest:  team?.crest ?? null,
        player:     p1?.displayName ?? null,
        playerOut:  kind === 'substitution' ? p2?.displayName ?? null : null,
        score:      d.scoringPlay ? `${homeScore}-${awayScore}` : null,
      }
    }).sort((a, b) => a.clockValue - b.clockValue)

    res.json({ events, found: true, homeScore, awayScore })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
