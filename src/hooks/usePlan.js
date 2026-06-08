/**
 * 🎯 USE PLAN — Hook para acessar plano do usuário
 */
import { useContext } from 'react'
import { PlanContext } from '../context/PlanContext'

export function usePlan() {
  const context = useContext(PlanContext)

  if (!context) {
    throw new Error('usePlan must be used within PlanProvider')
  }

  return context
}
