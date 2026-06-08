/**
 * 📊 MATCH DATA SERVICE — Seleciona API conforme o plano
 * FREE: Football-Data.org (básico)
 * PRO: API-Football (completo com xG, ratings, etc)
 */

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
const dataCache = new Map()

/**
 * Fetch com cache
 */
async function cachedFetch(key, fetchFn) {
  const cached = dataCache.get(key)
  const now = Date.now()

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }

  try {
    const data = await fetchFn()
    dataCache.set(key, { data, timestamp: now })
    return data
  } catch (error) {
    console.error(`[Service] Fetch failed for ${key}:`, error)
    // Retornar cache expirado se disponível
    if (cached) return cached.data
    throw error
  }
}

/**
 * FOOTBALL-DATA.ORG (FREE)
 */
export const footballDataAPI = {
  async getMatch(matchId) {
    const key = `fd-match-${matchId}`
    return cachedFetch(key, async () => {
      const res = await fetch(
        `${import.meta.env.VITE_FOOTBALLDATA_API}/matches/${matchId}`,
        {
          headers: {
            'X-Auth-Token': import.meta.env.VITE_FOOTBALLDATA_KEY,
          },
        }
      )
      return res.json()
    })
  },

  async getStandings(leagueId) {
    const key = `fd-standings-${leagueId}`
    return cachedFetch(key, async () => {
      const res = await fetch(
        `${import.meta.env.VITE_FOOTBALLDATA_API}/competitions/${leagueId}/standings`,
        {
          headers: {
            'X-Auth-Token': import.meta.env.VITE_FOOTBALLDATA_KEY,
          },
        }
      )
      return res.json()
    })
  },

  async getMatches(leagueId, status = 'SCHEDULED') {
    const key = `fd-matches-${leagueId}-${status}`
    return cachedFetch(key, async () => {
      const res = await fetch(
        `${import.meta.env.VITE_FOOTBALLDATA_API}/competitions/${leagueId}/matches?status=${status}`,
        {
          headers: {
            'X-Auth-Token': import.meta.env.VITE_FOOTBALLDATA_KEY,
          },
        }
      )
      return res.json()
    })
  },

  async getBasicStats(matchId) {
    // Stats básicas: posse, passes, cartões, faltas, escanteios
    const match = await this.getMatch(matchId)
    return {
      homeTeam: match.homeTeam?.name,
      awayTeam: match.awayTeam?.name,
      score: match.score,
      stats: match.statistics || [],
      status: match.status,
    }
  },
}

/**
 * API-FOOTBALL (PRO)
 */
export const apiFootballAPI = {
  async getMatch(matchId) {
    const key = `af-match-${matchId}`
    return cachedFetch(key, async () => {
      const res = await fetch(
        `${import.meta.env.VITE_APIFOOTBALL_API}/fixtures?id=${matchId}`,
        {
          headers: {
            'x-rapidapi-key': import.meta.env.VITE_APIFOOTBALL_KEY,
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
          },
        }
      )
      return res.json()
    })
  },

  async getMatchStats(matchId) {
    const key = `af-stats-${matchId}`
    return cachedFetch(key, async () => {
      const res = await fetch(
        `${import.meta.env.VITE_APIFOOTBALL_API}/fixtures/statistics?fixture=${matchId}`,
        {
          headers: {
            'x-rapidapi-key': import.meta.env.VITE_APIFOOTBALL_KEY,
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
          },
        }
      )
      return res.json()
    })
  },

  async getPlayerStats(matchId) {
    const key = `af-players-${matchId}`
    return cachedFetch(key, async () => {
      const res = await fetch(
        `${import.meta.env.VITE_APIFOOTBALL_API}/fixtures/players?fixture=${matchId}`,
        {
          headers: {
            'x-rapidapi-key': import.meta.env.VITE_APIFOOTBALL_KEY,
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
          },
        }
      )
      return res.json()
    })
  },

  async getMatchEvents(matchId) {
    const key = `af-events-${matchId}`
    return cachedFetch(key, async () => {
      const res = await fetch(
        `${import.meta.env.VITE_APIFOOTBALL_API}/fixtures/events?fixture=${matchId}`,
        {
          headers: {
            'x-rapidapi-key': import.meta.env.VITE_APIFOOTBALL_KEY,
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
          },
        }
      )
      return res.json()
    })
  },

  async getCompleteData(matchId) {
    // Promise.all para requisições paralelas
    const [match, stats, players, events] = await Promise.all([
      this.getMatch(matchId),
      this.getMatchStats(matchId),
      this.getPlayerStats(matchId),
      this.getMatchEvents(matchId),
    ])

    return {
      match: match.response?.[0],
      stats: stats.response || [],
      players: players.response || [],
      events: events.response || [],
    }
  },
}

/**
 * SELETOR DE API BASEADO NO PLANO
 */
export function getApiService(plan) {
  return plan === 'pro' ? apiFootballAPI : footballDataAPI
}

/**
 * Limpar cache
 */
export function clearCache() {
  dataCache.clear()
}

/**
 * Cache info (debug)
 */
export function getCacheInfo() {
  return {
    size: dataCache.size,
    keys: Array.from(dataCache.keys()),
  }
}
