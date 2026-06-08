import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLeague } from '../leagues'
import Standings from '../components/Standings'
import LiveScores from '../components/LiveScores'
import Players from '../components/Players'
import TeamEvolution from '../components/TeamEvolution'

/**
 * 🏆 COMPETITION HUB — Página dedicada por competição
 * FlashScore style: Classificação, Próximos, Resultados, Artilheiros
 */
export default function CompetitionPage() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('standings')

  const league = getLeague(leagueId) || getLeague('bra.1')
  const leagueInfo = league

  if (!league) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-white/60 font-bold">Competição não encontrada</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'standings', label: 'Classificação', icon: '📊' },
    { id: 'matches', label: 'Próximos', icon: '⏱️' },
    { id: 'results', label: 'Resultados', icon: '✓' },
    { id: 'players', label: 'Artilheiros', icon: '⚽' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Header da Competição */}
      <div className="bg-gradient-to-b from-brand-accent to-brand-dark border-b border-brand-border py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end gap-6 mb-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border border-white/20
                            flex items-center justify-center text-4xl sm:text-6xl">
                {leagueInfo.flag}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-white/50 text-sm uppercase tracking-wider mb-1">
                {leagueInfo.flag} Competição Oficial
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {leagueInfo.name}
              </h1>
              <p className="text-white/60 text-sm mt-2">
                Temporada 2025-26 • 38 rodadas
              </p>
            </div>

            {/* Botão voltar */}
            <button
              onClick={() => navigate('/')}
              className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10
                        hover:bg-white/10 transition text-sm font-bold text-white/70"
            >
              ← Voltar
            </button>
          </div>

          {/* Barra de progresso da temporada */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/50">
              <span>Rodada 30 de 38</span>
              <span>79% completo</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-green to-emerald-400 rounded-full transition-all"
                   style={{ width: '79%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="sticky top-[57px] z-20 bg-brand-dark/95 backdrop-blur-sm border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 border-b-2 font-bold text-sm flex-shrink-0 transition-all ${
                  activeTab === tab.id
                    ? 'border-brand-green text-white'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="bg-brand-dark min-h-screen pb-20 md:pb-0">
        {activeTab === 'standings' && (
          <Standings league={leagueId} leagueInfo={leagueInfo} />
        )}

        {activeTab === 'matches' && (
          <div className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="section-title mb-8">Próximos Jogos</h2>
              <LiveScores league={leagueId} leagueInfo={leagueInfo} />
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="section-title mb-8">Últimos Resultados</h2>
              <div className="card p-10 text-center text-white/40">
                <p className="text-2xl mb-2">📋</p>
                <p>Resultados em desenvolvimento</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Players league={leagueId} leagueInfo={leagueInfo} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <TeamEvolution teamName={leagueInfo.name} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
