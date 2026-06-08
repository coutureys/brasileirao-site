/**
 * 🎯 PLAN SWITCHER — Dev tool para testar Free vs Pro
 */
import { usePlan } from '../hooks/usePlan'

export default function PlanSwitcher() {
  const { plan, isPro, isFree, upgradeToPro, downgradeToFree } = usePlan()

  // Apenas mostrar em desenvolvimento
  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-black/80 border border-white/20 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/60">Plan:</span>

        <button
          onClick={() => isFree ? upgradeToPro() : downgradeToFree()}
          className={`px-3 py-1 rounded text-xs font-bold transition ${
            isPro
              ? 'bg-green-500 text-black'
              : 'bg-yellow-500 text-black'
          }`}
        >
          {plan.toUpperCase()}
        </button>

        <div className="text-[10px] text-white/40 flex-shrink-0">
          Clique para alternar
        </div>
      </div>
    </div>
  )
}
