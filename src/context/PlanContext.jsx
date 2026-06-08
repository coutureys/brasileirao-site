/**
 * 🎯 PLAN CONTEXT — Gerenciar Free vs Pro
 */
import { createContext, useState, useEffect, useCallback } from 'react'

export const PlanContext = createContext()

export function PlanProvider({ children }) {
  const [plan, setPlan] = useState('free') // 'free' ou 'pro'
  const [user, setUser] = useState(null)

  // Carregar plano salvo
  useEffect(() => {
    const savedPlan = localStorage.getItem('scoutfut-plan')
    const savedUser = localStorage.getItem('scoutfut-user')

    if (savedPlan) {
      setPlan(savedPlan)
    } else {
      // Usar env var ou default free
      const envPlan = import.meta.env.VITE_USER_PLAN || 'free'
      setPlan(envPlan)
      localStorage.setItem('scoutfut-plan', envPlan)
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('[Plan] Failed to load user:', e)
      }
    }
  }, [])

  // Upgrade para PRO
  const upgradeToPro = useCallback(() => {
    setPlan('pro')
    localStorage.setItem('scoutfut-plan', 'pro')
    return true
  }, [])

  // Downgrade para FREE
  const downgradeToFree = useCallback(() => {
    setPlan('free')
    localStorage.setItem('scoutfut-plan', 'free')
    return true
  }, [])

  // Check se é PRO
  const isPro = plan === 'pro'
  const isFree = plan === 'free'

  // Features por plano
  const features = {
    free: {
      liveScores: true,
      standings: true,
      upcomingMatches: true,
      basicStats: true, // posse, passes, cartões, etc
      xG: false,
      playerRatings: false,
      timeline: false,
      advancedStats: false,
      api: 'footballdata', // Football-Data.org
    },
    pro: {
      liveScores: true,
      standings: true,
      upcomingMatches: true,
      basicStats: true,
      xG: true,
      playerRatings: true,
      timeline: true,
      advancedStats: true,
      api: 'apifootball', // API-Football
    },
  }

  const currentFeatures = features[plan]

  return (
    <PlanContext.Provider
      value={{
        plan,
        isPro,
        isFree,
        features: currentFeatures,
        upgradeToPro,
        downgradeToFree,
        user,
        setUser,
      }}
    >
      {children}
    </PlanContext.Provider>
  )
}
