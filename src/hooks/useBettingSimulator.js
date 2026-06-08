/**
 * 🎲 USE BETTING SIMULATOR — Simulador de apostas (créditos virtuais)
 */
import { useState, useEffect, useCallback } from 'react'

export function useBettingSimulator() {
  const [balance, setBalance] = useState(1000) // R$ 1000 iniciais
  const [bets, setBets] = useState([])
  const [totalWon, setTotalWon] = useState(0)
  const [totalLost, setTotalLost] = useState(0)

  // Carregar dados salvos
  useEffect(() => {
    const saved = localStorage.getItem('scoutfut-betting-simulator')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setBalance(data.balance || 1000)
        setBets(data.bets || [])
        setTotalWon(data.totalWon || 0)
        setTotalLost(data.totalLost || 0)
      } catch (e) {
        console.error('[Betting] Failed to load:', e)
      }
    }
  }, [])

  // Salvar dados
  const saveData = useCallback(() => {
    localStorage.setItem(
      'scoutfut-betting-simulator',
      JSON.stringify({ balance, bets, totalWon, totalLost })
    )
  }, [balance, bets, totalWon, totalLost])

  // Colocar aposta
  const placeBet = useCallback(
    (amount, odds, prediction, match) => {
      if (amount > balance) return null

      const bet = {
        id: `bet-${Date.now()}`,
        amount,
        odds,
        prediction,
        match,
        timestamp: new Date(),
        status: 'pending',
        result: null,
        winAmount: 0,
      }

      setBalance(prev => prev - amount)
      setBets(prev => [bet, ...prev])

      return bet.id
    },
    [balance]
  )

  // Resolver aposta
  const resolveBet = useCallback((betId, won, winAmount = 0) => {
    setBets(prev =>
      prev.map(b => {
        if (b.id === betId) {
          const newBet = {
            ...b,
            status: 'resolved',
            result: won ? 'won' : 'lost',
            winAmount,
          }

          if (won) {
            setBalance(prev => prev + winAmount)
            setTotalWon(prev => prev + winAmount)
          } else {
            setTotalLost(prev => prev + b.amount)
          }

          return newBet
        }
        return b
      })
    )
  }, [])

  // Calcular ROI
  const roi = totalWon > 0 ? ((totalWon - totalLost) / 1000) * 100 : 0

  // Estatísticas
  const stats = {
    totalBets: bets.length,
    winBets: bets.filter(b => b.result === 'won').length,
    loseBets: bets.filter(b => b.result === 'lost').length,
    pendingBets: bets.filter(b => b.status === 'pending').length,
    winRate: bets.length > 0
      ? ((bets.filter(b => b.result === 'won').length / bets.length) * 100).toFixed(1)
      : 0,
    totalInvested: bets.reduce((sum, b) => sum + b.amount, 0),
    totalWon,
    totalLost,
    roi: roi.toFixed(1),
  }

  // Resetar
  const reset = useCallback(() => {
    setBalance(1000)
    setBets([])
    setTotalWon(0)
    setTotalLost(0)
    localStorage.removeItem('scoutfut-betting-simulator')
  }, [])

  return {
    balance,
    bets,
    stats,
    placeBet,
    resolveBet,
    reset,
    saveData,
  }
}
