/**
 * 💰 PLAN UPGRADE MODAL — Upgrade Free → Pro
 */
import { usePlan } from '../hooks/usePlan'

export default function PlanUpgradeModal({ isOpen, onClose }) {
  const { plan, upgradeToPro } = usePlan()

  if (!isOpen || plan === 'pro') return null

  const handleUpgrade = () => {
    upgradeToPro()
    onClose()
    // TODO: Integrar com Stripe/payment
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-brand-card to-brand-dark border border-brand-green/30 rounded-3xl max-w-md w-full p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-5xl mb-3">👑</p>
          <h2 className="text-2xl font-black text-white mb-2">ScoutFut PRO</h2>
          <p className="text-sm text-white/60">Desbloqueie análises profissionais</p>
        </div>

        {/* Comparação */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { feature: 'Scores ao vivo', free: '✓', pro: '✓' },
            { feature: 'Tabela & próximos', free: '✓', pro: '✓' },
            { feature: 'Stats básicas', free: '✓', pro: '✓' },
            { feature: 'xG (Expected Goals)', free: '✗', pro: '✓' },
            { feature: 'Chances claras', free: '✗', pro: '✓' },
            { feature: 'Rating jogadores', free: '✗', pro: '✓' },
            { feature: 'Timeline completa', free: '✗', pro: '✓' },
            { feature: 'Sem anúncios', free: '✗', pro: '✓' },
          ].map((row, i) => (
            <div key={i} className="col-span-2 flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60">{row.feature}</span>
              <div className="flex gap-4">
                <span className={row.free === '✓' ? 'text-white/40' : 'text-white/20'}>{row.free}</span>
                <span className={row.pro === '✓' ? 'text-green-400' : 'text-white/20'}>{row.pro}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Preço */}
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-white mb-1">R$ 9,90</p>
          <p className="text-xs text-white/60">/mês ou R$ 99/ano (17% off)</p>
        </div>

        {/* Benefícios */}
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Análises detalhadas
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Sem anúncios
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Stats profissionais
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Cancelar a qualquer momento
          </li>
        </ul>

        {/* Botões */}
        <div className="space-y-2">
          <button
            onClick={handleUpgrade}
            className="w-full px-6 py-3 bg-green-500 text-black font-black rounded-xl hover:bg-green-400 transition"
          >
            Upgrade Agora
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition"
          >
            Depois
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-white/40 text-center">
          Primeira cobrança após 7 dias de trial gratuito.
          <br />
          Cancelável sem penalidades.
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
