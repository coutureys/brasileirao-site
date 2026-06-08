/**
 * 🔐 AUTH CONTEXT — Autenticação JWT
 */
import { createContext, useState, useEffect, useCallback } from 'react'
import { API_ENDPOINTS, httpClient } from '../api/endpoints'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carregar token salvo
  useEffect(() => {
    const savedToken = localStorage.getItem('scoutfut-token')
    const savedRefresh = localStorage.getItem('scoutfut-refresh-token')

    if (savedToken) {
      setToken(savedToken)
      setRefreshToken(savedRefresh)
      // Verificar se token ainda é válido
      verifyToken(savedToken)
    }

    setLoading(false)
  }, [])

  // Verificar token
  const verifyToken = useCallback(async (token) => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.me, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token inválido
        logout()
      }
    } catch (e) {
      console.error('[Auth] Verification failed:', e)
      logout()
    }
  }, [])

  // Login
  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Credenciais inválidas')
      }

      const { token, refreshToken, user } = await response.json()

      setToken(token)
      setRefreshToken(refreshToken)
      setUser(user)

      localStorage.setItem('scoutfut-token', token)
      localStorage.setItem('scoutfut-refresh-token', refreshToken)

      return { success: true }
    } catch (e) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Registrar
  const register = useCallback(async (email, password, name) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        throw new Error('Falha no registro')
      }

      const { token, refreshToken, user } = await response.json()

      setToken(token)
      setRefreshToken(refreshToken)
      setUser(user)

      localStorage.setItem('scoutfut-token', token)
      localStorage.setItem('scoutfut-refresh-token', refreshToken)

      return { success: true }
    } catch (e) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh token
  const refreshTokens = useCallback(async () => {
    if (!refreshToken) return false

    try {
      const response = await fetch(API_ENDPOINTS.auth.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const { token: newToken, refreshToken: newRefreshToken } = await response.json()

      setToken(newToken)
      setRefreshToken(newRefreshToken)

      localStorage.setItem('scoutfut-token', newToken)
      localStorage.setItem('scoutfut-refresh-token', newRefreshToken)

      return true
    } catch (e) {
      console.error('[Auth] Refresh failed:', e)
      logout()
      return false
    }
  }, [refreshToken])

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch(API_ENDPOINTS.auth.logout, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (e) {
      console.error('[Auth] Logout failed:', e)
    } finally {
      setUser(null)
      setToken(null)
      setRefreshToken(null)
      localStorage.removeItem('scoutfut-token')
      localStorage.removeItem('scoutfut-refresh-token')
    }
  }, [token])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
