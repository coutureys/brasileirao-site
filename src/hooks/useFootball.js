import { useState, useEffect, useCallback } from 'react'
import { standings as mockStandings } from '../data/teams'
import { matches as mockMatches } from '../data/scores'

// ── Generic fetch hook ────────────────────────────────────────────────────
function useFetch(url, refreshMs = 0) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  const load = useCallback(async () => {
    try {
      const res  = await fetch(url)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setState({ data: json, loading: false, error: null })
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }))
    }
  }, [url])

  useEffect(() => {
    setState((s) => ({ ...s, loading: true }))
    load()
    if (!refreshMs) return
    const id = setInterval(load, refreshMs)
    return () => clearInterval(id)
  }, [load, refreshMs])

  return { ...state, refetch: load }
}

// ── API health ────────────────────────────────────────────────────────────
export function useApiHealth() {
  const { data } = useFetch('/api/health')
  return { serverUp: data !== null, source: data?.source ?? '' }
}

// ── Standings ─────────────────────────────────────────────────────────────
export function useStandings(league = 'bra.1') {
  const { data, loading, error, refetch } = useFetch(`/api/pl/standings?league=${league}`, 5 * 60_000)

  if (loading) return { standings: null, groups: null, loading: true,  error: null,  source: 'api', refetch }
  if (error)   return { standings: mockStandings, groups: null, loading: false, error, source: 'mock', refetch }

  const normalize = (arr) => (arr ?? []).map(row => ({ ...row, team: row.team ?? row.name ?? '' }))

  const standings = normalize(data?.standings)
  const groups    = data?.hasGroups
    ? (data.groups ?? []).map(g => ({ ...g, standings: normalize(g.standings) }))
    : null
  const noTable  = data?.noTable  ?? false
  const knockout = data?.knockout ?? false
  const rounds   = data?.rounds   ?? []

  return { standings, groups, noTable, knockout, rounds, loading: false, error: null, source: 'api', refetch }
}

// ── Matches ───────────────────────────────────────────────────────────────
export function useMatches(league = 'bra.1') {
  const { data, loading, error, refetch } = useFetch(`/api/pl/matches?league=${league}`, 30_000)

  if (loading) return { matches: null, loading: true,  error: null,  source: 'api', refetch }
  if (error)   return { matches: mockMatches, loading: false, error, source: 'mock', refetch }

  const normalize = (arr, status) => arr.map((m) => normalizeMatch(m, status))

  const matches = [
    ...normalize(data.live     ?? [], 'LIVE'),
    ...normalize(data.results  ?? [], 'FT'),
    ...normalize(data.upcoming ?? [], 'UPCOMING'),
  ]

  return { matches, loading: false, error: null, source: 'api', refetch }
}

// ── Normalizer ─────────────────────────────────────────────────────────────
function normalizeMatch(m, forcedStatus) {
  const statusMap = {
    IN_PLAY:   'LIVE',
    FINISHED:  'FT',
    SCHEDULED: 'UPCOMING',
    TIMED:     'UPCOMING',
  }
  const status = forcedStatus ?? statusMap[m.status] ?? m.status

  const utc     = m.utcDate ? new Date(m.utcDate) : null
  const kickoff = utc ? utc.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) : ''
  const date    = utc ? utc.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }) : ''

  return {
    id:      m.id,
    status,
    minute:  m.minute ?? null,
    round:   m.matchday ? `Rodada ${m.matchday}` : '—',
    stadium: m.venue ?? '—',
    kickoff,
    date,
    home: {
      name:  m.homeTeam?.name  ?? '—',
      abbr:  m.homeTeam?.tla   ?? '—',
      crest: m.homeTeam?.crest ?? null,
      score: m.score?.fullTime?.home ?? null,
      goals: [],
    },
    away: {
      name:  m.awayTeam?.name  ?? '—',
      abbr:  m.awayTeam?.tla   ?? '—',
      crest: m.awayTeam?.crest ?? null,
      score: m.score?.fullTime?.away ?? null,
      goals: [],
    },
    stats: null,
  }
}

// ── Tournament Phases (Grupos + Eliminatória) ──────────────────────────
export function usePhases(league = 'uefa.champions') {
  const { data, loading, error, refetch } = useFetch(`/api/pl/phases?league=${league}`, 10 * 60_000)

  if (loading) return { phases: null, loading: true, error: null, source: 'api', refetch }
  if (error)   return { phases: null, loading: false, error, source: 'error', refetch }

  const phases = data?.phases ?? {
    groups: [],
    round16: [],
    quarterfinals: [],
    semifinals: [],
    final: null,
  }

  return { phases, loading: false, error: null, source: 'api', refetch }
}
