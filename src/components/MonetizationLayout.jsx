/**
 * 💰 MONETIZATION — Estratégia de monetização
 */

/**
 * Ad Banner — Espaço para anúncios Google AdSense
 */
export function AdBanner({ placement = 'top' }) {
  return (
    <div className="bg-white/3 border border-white/10 rounded-xl p-4 text-center text-white/40 text-xs">
      {/* Google AdSense será inserido aqui */}
      <p>
        {placement === 'top' && '📢 Anúncio (topo)'}
        {placement === 'sidebar' && '📢 Anúncio (barra lateral)'}
        {placement === 'footer' && '📢 Anúncio (rodapé)'}
      </p>
      <p className="mt-1 text-[10px]">Google AdSense - Publicidade contextual</p>
    </div>
  )
}

/**
 * Premium Box — Upgrade para premium
 */
export function PremiumBox() {
  return (
    <div className="bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/30 rounded-xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">👑</span>
        <div>
          <h3 className="text-sm font-black text-white">ScoutFut Premium</h3>
          <p className="text-xs text-white/50">Desbloqueie recursos avançados</p>
        </div>
      </div>

      <ul className="text-xs text-white/60 space-y-2 mb-4">
        <li>✓ Sem anúncios</li>
        <li>✓ Análises tática com IA</li>
        <li>✓ Odds de múltiplas casas</li>
        <li>✓ Histórico ilimitado de palpites</li>
        <li>✓ Acesso à API para bots</li>
        <li>✓ Suporte prioritário</li>
      </ul>

      <button className="w-full px-4 py-3 bg-yellow-500 text-black font-black rounded-lg hover:bg-yellow-400 transition">
        Assinar Premium • R$ 9,90/mês
      </button>
    </div>
  )
}

/**
 * Affiliate Links — Links de afiliados para casas de apostas
 */
export function AffiliateLinks() {
  const affiliates = [
    { name: 'Betano', commission: '5-7%', icon: '🎰', link: '#betano' },
    { name: 'Bet365', commission: '5%', icon: '🎰', link: '#bet365' },
    { name: 'Sportingbet', commission: '6%', icon: '🎰', link: '#sportingbet' },
    { name: 'Pinnacle', commission: '3%', icon: '🎰', link: '#pinnacle' },
  ]

  return (
    <div className="bg-white/3 border border-white/10 rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-black text-white">🤝 Casas de Apostas Parceiras</h3>

      <div className="grid grid-cols-2 gap-3">
        {affiliates.map(aff => (
          <a
            key={aff.name}
            href={aff.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
          >
            <p className="text-lg mb-1">{aff.icon}</p>
            <p className="text-xs font-bold text-white">{aff.name}</p>
            <p className="text-[10px] text-white/50">Comissão: {aff.commission}</p>
          </a>
        ))}
      </div>

      <p className="text-xs text-white/40 text-center">
        ℹ️ Links de afiliado • Ganhamos comissão de suas apostas
      </p>
    </div>
  )
}

/**
 * Revenue Model — Visão geral do modelo de receita
 */
export function RevenueModel() {
  const sources = [
    {
      title: 'Google AdSense',
      desc: 'Anúncios contextuais',
      revenue: '40%',
      status: '✅ Ativo',
    },
    {
      title: 'Premium Subscriptions',
      desc: 'R$ 9,90/mês por usuário',
      revenue: '35%',
      status: '✅ Ativo',
    },
    {
      title: 'Affiliate Marketing',
      desc: 'Comissão de casas de apostas',
      revenue: '20%',
      status: '✅ Ativo',
    },
    {
      title: 'Data Sales (GDPR-compliant)',
      desc: 'Insights anônimos para casas',
      revenue: '5%',
      status: '🔄 Em desenvolvimento',
    },
  ]

  return (
    <div className="bg-white/3 border border-white/10 rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-black text-white">💰 Modelo de Receita</h3>

      <div className="space-y-3">
        {sources.map((source, i) => (
          <div key={i} className="flex items-start justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{source.title}</p>
              <p className="text-xs text-white/50">{source.desc}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-green-400">{source.revenue}</p>
              <p className="text-xs text-white/40">{source.status}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-white/10">
        <p className="text-xs text-white/50">
          📊 Receita anual estimada (com 50k usuários): R$ 2.5M+
        </p>
      </div>
    </div>
  )
}

/**
 * MonetizationDashboard — Dashboard de monetização
 */
export default function MonetizationDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white mb-2">💰 Monetização</h2>
        <p className="text-sm text-white/40">Modelos de receita e partnerships</p>
      </div>

      {/* Main Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left - Revenue Model */}
        <div className="md:col-span-2">
          <RevenueModel />
        </div>

        {/* Right - Premium */}
        <div className="space-y-6">
          <PremiumBox />
        </div>
      </div>

      {/* Affiliate Links */}
      <AffiliateLinks />

      {/* Ad Example */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">📍 Exemplos de Placements</h3>
        <div className="grid grid-cols-2 gap-4">
          <AdBanner placement="top" />
          <AdBanner placement="sidebar" />
        </div>
        <AdBanner placement="footer" />
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-2">
        <h4 className="text-sm font-bold text-blue-400">ℹ️ Sobre Monetização</h4>
        <ul className="text-xs text-white/60 space-y-1">
          <li>✓ Mantemos a experiência limpa - máx 1 anúncio por página</li>
          <li>✓ Premium remove TODOS os anúncios</li>
          <li>✓ Affiliate links marcados claramente com <span className="text-yellow-400">🤝</span></li>
          <li>✓ GDPR compliant - dados anonimizados</li>
          <li>✓ Usuários livres decidem participar ou não</li>
        </ul>
      </div>
    </div>
  )
}
