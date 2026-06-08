/**
 * 🔌 API ENDPOINTS — RESTful API completa
 *
 * Base URL: /api/v1
 */

const API_BASE = '/api/v1'

export const API_ENDPOINTS = {
  // Games
  games: {
    list: `${API_BASE}/games`,
    create: `${API_BASE}/games`,
    get: (id) => `${API_BASE}/games/${id}`,
    update: (id) => `${API_BASE}/games/${id}`,
    delete: (id) => `${API_BASE}/games/${id}`,
    byLeague: (leagueId) => `${API_BASE}/games?league=${leagueId}`,
    live: `${API_BASE}/games/live`,
    upcoming: `${API_BASE}/games/upcoming`,
    results: `${API_BASE}/games/results`,
  },

  // Standings
  standings: {
    get: (leagueId) => `${API_BASE}/standings/${leagueId}`,
    update: (leagueId) => `${API_BASE}/standings/${leagueId}`,
  },

  // Players
  players: {
    list: `${API_BASE}/players`,
    get: (id) => `${API_BASE}/players/${id}`,
    byTeam: (teamId) => `${API_BASE}/players?team=${teamId}`,
    byLeague: (leagueId) => `${API_BASE}/players?league=${leagueId}`,
    topScorers: (leagueId) => `${API_BASE}/players/top-scorers/${leagueId}`,
    search: (query) => `${API_BASE}/players/search?q=${query}`,
    stats: (id) => `${API_BASE}/players/${id}/stats`,
    rating: (id) => `${API_BASE}/players/${id}/rating`,
    marketValue: (id) => `${API_BASE}/players/${id}/market-value`,
  },

  // Teams
  teams: {
    list: `${API_BASE}/teams`,
    get: (id) => `${API_BASE}/teams/${id}`,
    byLeague: (leagueId) => `${API_BASE}/teams?league=${leagueId}`,
    stats: (id) => `${API_BASE}/teams/${id}/stats`,
    headToHead: (team1, team2) => `${API_BASE}/teams/${team1}/vs/${team2}`,
  },

  // Leagues
  leagues: {
    list: `${API_BASE}/leagues`,
    get: (id) => `${API_BASE}/leagues/${id}`,
    standings: (id) => `${API_BASE}/leagues/${id}/standings`,
    schedule: (id) => `${API_BASE}/leagues/${id}/schedule`,
  },

  // Predictions
  predictions: {
    create: `${API_BASE}/predictions`,
    list: `${API_BASE}/predictions`,
    get: (id) => `${API_BASE}/predictions/${id}`,
    resolve: (id) => `${API_BASE}/predictions/${id}/resolve`,
    ranking: `${API_BASE}/predictions/ranking`,
    myPredictions: `${API_BASE}/predictions/me`,
  },

  // Favorites
  favorites: {
    list: `${API_BASE}/favorites`,
    create: `${API_BASE}/favorites`,
    delete: (id) => `${API_BASE}/favorites/${id}`,
    toggleTeam: (teamId) => `${API_BASE}/favorites/team/${teamId}`,
    togglePlayer: (playerId) => `${API_BASE}/favorites/player/${playerId}`,
  },

  // Alerts
  alerts: {
    list: `${API_BASE}/alerts`,
    create: `${API_BASE}/alerts`,
    get: (id) => `${API_BASE}/alerts/${id}`,
    markAsRead: (id) => `${API_BASE}/alerts/${id}/read`,
    preferences: `${API_BASE}/alerts/preferences`,
  },

  // Comments
  comments: {
    list: `${API_BASE}/comments`,
    byGame: (gameId) => `${API_BASE}/comments?game=${gameId}`,
    create: `${API_BASE}/comments`,
    get: (id) => `${API_BASE}/comments/${id}`,
    update: (id) => `${API_BASE}/comments/${id}`,
    delete: (id) => `${API_BASE}/comments/${id}`,
    like: (id) => `${API_BASE}/comments/${id}/like`,
    reply: (id) => `${API_BASE}/comments/${id}/reply`,
  },

  // Analytics
  analytics: {
    playerStats: (id) => `${API_BASE}/analytics/players/${id}`,
    teamEvolution: (teamId) => `${API_BASE}/analytics/teams/${teamId}/evolution`,
    matchStats: (gameId) => `${API_BASE}/analytics/matches/${gameId}/stats`,
    advancedStats: (gameId) => `${API_BASE}/analytics/matches/${gameId}/advanced`,
  },

  // User/Auth
  auth: {
    register: `${API_BASE}/auth/register`,
    login: `${API_BASE}/auth/login`,
    logout: `${API_BASE}/auth/logout`,
    refresh: `${API_BASE}/auth/refresh`,
    me: `${API_BASE}/auth/me`,
  },

  // User Profile
  users: {
    get: (id) => `${API_BASE}/users/${id}`,
    update: (id) => `${API_BASE}/users/${id}`,
    me: `${API_BASE}/users/me`,
    preferences: `${API_BASE}/users/me/preferences`,
    stats: `${API_BASE}/users/me/stats`,
  },

  // Admin
  admin: {
    games: {
      list: `${API_BASE}/admin/games`,
      create: `${API_BASE}/admin/games`,
      update: (id) => `${API_BASE}/admin/games/${id}`,
      delete: (id) => `${API_BASE}/admin/games/${id}`,
    },
    users: {
      list: `${API_BASE}/admin/users`,
      get: (id) => `${API_BASE}/admin/users/${id}`,
      ban: (id) => `${API_BASE}/admin/users/${id}/ban`,
      unban: (id) => `${API_BASE}/admin/users/${id}/unban`,
    },
    analytics: `${API_BASE}/admin/analytics`,
    logs: `${API_BASE}/admin/logs`,
  },

  // Sync
  sync: {
    favorites: `${API_BASE}/sync/favorites`,
    predictions: `${API_BASE}/sync/predictions`,
    alerts: `${API_BASE}/sync/alerts`,
  },
}

/**
 * Exemplo de uso:
 *
 * // GET /api/v1/games?league=bra.1
 * fetch(API_ENDPOINTS.games.byLeague('bra.1'))
 *
 * // POST /api/v1/predictions
 * fetch(API_ENDPOINTS.predictions.create, {
 *   method: 'POST',
 *   body: JSON.stringify({ gameId: 1, prediction: 'home' })
 * })
 *
 * // GET /api/v1/players/vinicius-jr/rating
 * fetch(API_ENDPOINTS.players.rating('vinicius-jr'))
 */

export const httpClient = {
  get: async (url) => {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return response.json()
  },

  post: async (url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return response.json()
  },

  put: async (url, data) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return response.json()
  },

  delete: async (url) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return response.json()
  },
}
