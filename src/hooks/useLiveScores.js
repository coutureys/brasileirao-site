/**
 * useLiveScores
 * - Polling a cada N segundos (10s se tem jogos ao vivo, 30s caso contrário)
 * - Detecta mudança de placar entre atualizações
 * - Dispara som + vibração quando gol
 * - Retorna `changes` para animar o número que mudou
 */
import { useState, useEffect, useRef, useCallback } from 'react'

// ── iOS "Tri-tone" (alegria) via Web Audio API ────────────────────────────
// Recria o toque clássico do iPhone: 3 notas ascendentes em sino
// Frequências: D#5 (622Hz) → G5 (784Hz) → C6 (1047Hz)
function playGoalSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime

    // Cria efeito de sino com sine + harmonics
    const bell = (freq, startTime, vol = 0.35) => {
      // Harmônico fundamental + 2ª + 3ª oitava para timbre de sino
      [[freq, 1.0], [freq * 2, 0.4], [freq * 3, 0.15]].forEach(([f, v]) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sine'
        osc.frequency.value = f

        // Envelope: ataque rápido (5ms), decay longo (bell)
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(vol * v, startTime + 0.005)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.55)

        osc.start(startTime)
        osc.stop(startTime + 0.6)
      })
    }

    // iOS Tri-tone: D#5 → G5 → C6 (intervalos de terça menor + quarta justa)
    bell(622,  now + 0.00, 0.35)  // D#5
    bell(784,  now + 0.18, 0.35)  // G5
    bell(1047, now + 0.36, 0.40)  // C6 — nota final mais forte

  } catch (e) {
    // Browser sem suporte — silencia
  }
}

// ── Vibração no celular ──────────────────────────────────────────────────
function vibrateGoal() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }
  } catch (e) {}
}

// ── Normaliza estrutura dos matches da API ────────────────────────────────
function extractMatches(data) {
  if (!data) return []
  const { live = [], results = [], upcoming = [] } = data
  return [...live, ...results, ...upcoming]
}

// ── Hook principal ────────────────────────────────────────────────────────
export function useLiveScores({
  soundEnabled    = true,
  vibrateEnabled  = true,
  liveInterval    = 10_000,
  idleInterval    = 30_000,
  league          = 'bra.1',
} = {}) {
  const [matches,     setMatches]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [updating,    setUpdating]    = useState(false)
  const [error,       setError]       = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [changes,     setChanges]     = useState({})   // { matchId: { home, away } }
  const [newGoals,    setNewGoals]    = useState([])   // lista de gols novos

  const prevMatchesRef = useRef({})    // { matchId: { homeScore, awayScore } }
  const intervalRef    = useRef(null)
  const soundRef       = useRef(soundEnabled)
  const vibrateRef     = useRef(vibrateEnabled)

  soundRef.current   = soundEnabled
  vibrateRef.current = vibrateEnabled

  const fetchMatches = useCallback(async (isFirst = false) => {
    if (!isFirst) setUpdating(true)
    try {
      const r    = await fetch(`/api/pl/matches?league=${league}`)
      const data = await r.json()
      if (data.error) throw new Error(data.error)

      const all   = extractMatches(data)
      const newCh = {}
      const goals = []

      // Detecta mudanças de placar
      all.forEach(m => {
        const id      = m.espnId ?? m.id ?? `${m.homeTeam?.name}-${m.awayTeam?.name}`
        const prev    = prevMatchesRef.current[id]
        const hScore  = m.homeTeam?.score ?? m.score?.fullTime?.home ?? null
        const aScore  = m.awayTeam?.score ?? m.score?.fullTime?.away ?? null

        if (prev && hScore != null && aScore != null) {
          const hChanged = hScore > (prev.homeScore ?? -1)
          const aChanged = aScore > (prev.awayScore ?? -1)

          if (hChanged || aChanged) {
            newCh[id] = { home: hChanged, away: aChanged }
            if (hChanged) goals.push({ team: m.homeTeam?.name, score: `${hScore}-${aScore}` })
            if (aChanged) goals.push({ team: m.awayTeam?.name, score: `${hScore}-${aScore}` })
          }
        }

        prevMatchesRef.current[id] = { homeScore: hScore, awayScore: aScore }
      })

      // Dispara som + vibração se houve gol
      if (goals.length > 0) {
        if (soundRef.current)   playGoalSound()
        if (vibrateRef.current) vibrateGoal()
        setNewGoals(goals)
        setTimeout(() => setNewGoals([]), 5000)
      }

      // Limpa animações após 1.5s
      if (Object.keys(newCh).length > 0) {
        setChanges(newCh)
        setTimeout(() => setChanges({}), 1500)
      }

      // Normaliza para o formato já usado no app
      const normalize = (arr, status) => arr.map(m => ({
        id:         m.espnId ?? m.id,
        status,
        minute:     m.minute    ?? null,
        period:     m.period    ?? null,
        isHalfTime: m.isHalfTime ?? false,
        serverTs:   m.serverTs  ?? Date.now(),
        round:      m.matchday ? `Rodada ${m.matchday}` : '—',
        stadium:    m.venue ?? '—',
        kickoff: m.utcDate ? new Date(m.utcDate).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo' }) : '',
        date:    m.utcDate ? new Date(m.utcDate).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', timeZone:'America/Sao_Paulo' }) : '',
        home: {
          name:  m.homeTeam?.name  ?? '—',
          crest: m.homeTeam?.crest ?? null,
          score: m.homeTeam?.score ?? m.score?.fullTime?.home ?? null,
          goals: [],
        },
        away: {
          name:  m.awayTeam?.name  ?? '—',
          crest: m.awayTeam?.crest ?? null,
          score: m.awayTeam?.score ?? m.score?.fullTime?.away ?? null,
          goals: [],
        },
        _id: m.espnId ?? m.id,
      }))

      const normalized = [
        ...normalize(data.live     ?? [], 'LIVE'),
        ...normalize(data.results  ?? [], 'FT'),
        ...normalize(data.upcoming ?? [], 'UPCOMING'),
      ]

      setMatches(normalized)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setUpdating(false)
    }
  }, [])

  // Configura polling dinâmico
  useEffect(() => {
    fetchMatches(true)

    const tick = () => {
      const hasLive = matches.some(m => m.status === 'LIVE')
      const delay   = hasLive ? liveInterval : idleInterval
      intervalRef.current = setTimeout(() => { fetchMatches(); }, delay)
    }

    // Primeiro tick
    intervalRef.current = setTimeout(tick, liveInterval)

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [fetchMatches, liveInterval, idleInterval, league]) // eslint-disable-line

  // Re-agenda após cada fetch
  useEffect(() => {
    if (loading) return
    const hasLive = matches.some(m => m.status === 'LIVE')
    const delay   = hasLive ? liveInterval : idleInterval

    if (intervalRef.current) clearTimeout(intervalRef.current)
    intervalRef.current = setTimeout(() => fetchMatches(), delay)

    return () => { if (intervalRef.current) clearTimeout(intervalRef.current) }
  }, [matches, loading, fetchMatches, liveInterval, idleInterval])

  return {
    matches,
    loading,
    updating,
    error,
    lastUpdated,
    changes,
    newGoals,
    refetch: () => fetchMatches(),
  }
}
