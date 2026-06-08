import { useNavigate } from 'react-router-dom'
import { LEAGUES } from '../leagues'

/**
 * 🏆 COMPETIÇÕES — Todas as competições disponíveis
 */
export default function CompeticoesPage() {
  const navigate = useNavigate()

  const topLeagues = [
    { id: 'bra.1', color: '#10b981' },
    { id: 'lib', color: '#f59e0b' },
    { id: 'bra.2', color: '#3b82f6' },
    { id: 'bra.copa', color: '#8b5cf6' },
  ]

  const featured = LEAGUES.filter(l => topLeagues.some(t => t.id === l.id))
  const others = LEAGUES.filter(l => !topLeagues.some(t => t.id === l.id))

  const getColor = (id) => topLeagues.find(t => t.id === id)?.color || '#ffffff20'

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Header */}
        <h1 className="text-3xl font-black text-white">🏆 Competições</h1>

        {/* === DESTAQUES === */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-green/70 mb-4">
            Destaques
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {featured.map(league => {
              const color = getColor(league.id)
              return (
                <button
                  key={league.id}
                  onClick={() => navigate(`/competition/${league.id}`)}
                  className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                    border: `1px solid ${color}30`,
                  }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                       style={{ background: `radial-gradient(circle at center, ${color}15, transparent)` }} />
                  <div className="relative z-10">
                    <span className="text-4xl block mb-2">{league.flag}</span>
                    <p className="text-sm font-black text-white leading-tight">{league.name}</p>
                    <p className="text-[11px] text-white/40 mt-1">{league.country}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* === TODAS === */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">
            Todas as competições
          </h2>
          <div className="space-y-1">
            {others.map(league => (
              <button
                key={league.id}
                onClick={() => navigate(`/competition/${league.id}`)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl
                          hover:bg-white/5 transition-all active:scale-[0.98]">
                <span className="text-2xl flex-shrink-0">{league.flag}</span>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{league.name}</p>
                  <p className="text-[11px] text-white/40">{league.country}</p>
                </div>
                <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
