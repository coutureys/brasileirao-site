import { useState } from 'react'
import MatchTimeline from './MatchTimeline'
import MatchStats from './MatchStats'

/**
 * 📊 MATCH DETAILS — Detalhes completos da partida
 * Modal com placar, estatísticas reais (ESPN) e timeline de eventos
 */
export default function MatchDetails({ match, onClose }) {
  const [activeTab, setActiveTab] = useState('stats')

  if (!match) return null

  const tabs = [
    { id: 'stats',    label: 'Estatísticas', icon: '📊' },
    { id: 'timeline', label: 'Timeline',     icon: '⏱️' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-4xl bg-brand-card border border-brand-border
                      rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up
                      max-h-[95vh] sm:max-h-[90vh] flex flex-col"
           onClick={e => e.stopPropagation()}>

        {/* Header com Placar */}
        <div className="bg-brand-accent p-6 sm:p-8 border-b border-brand-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10
                       flex items-center justify-center hover:bg-white/20 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Match Info */}
          <div className="text-center">
            <p className="text-white/50 text-sm mb-2">{match.date} • {match.kickoff}</p>

            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Time Casa */}
              <div className="flex flex-col items-center gap-2">
                {match.home.crest && (
                  <img src={match.home.crest} alt="" className="w-12 h-12 object-contain" />
                )}
                <p className="font-bold text-white text-sm sm:text-base truncate max-w-[100px]">
                  {match.home.name}
                </p>
              </div>

              {/* Placar */}
              <div className="flex flex-col items-center gap-1">
                <div className="text-4xl sm:text-5xl font-black text-white tabular-nums">
                  {match.home.score ?? '—'}
                </div>
                <p className="text-white/40 text-xs">
                  {match.status === 'IN_PLAY' && '🔴 AO VIVO'}
                  {match.status === 'FINISHED' && '✓ Encerrada'}
                  {match.status === 'SCHEDULED' && '⏳ Agendada'}
                </p>
                <div className="text-2xl text-white/50">—</div>
                <div className="text-4xl sm:text-5xl font-black text-white tabular-nums">
                  {match.away.score ?? '—'}
                </div>
              </div>

              {/* Time Visitante */}
              <div className="flex flex-col items-center gap-2">
                {match.away.crest && (
                  <img src={match.away.crest} alt="" className="w-12 h-12 object-contain" />
                )}
                <p className="font-bold text-white text-sm sm:text-base truncate max-w-[100px]">
                  {match.away.name}
                </p>
              </div>
            </div>

            <p className="text-white/60 text-sm">{match.stadium}</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-1 p-2 sm:p-3 border-b border-brand-border bg-brand-accent/40">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-white bg-brand-green shadow'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba */}
        <div className="flex-1 min-h-0 flex flex-col">
          {activeTab === 'stats' && (
            <MatchStats match={match} embedded onClose={onClose} />
          )}
          {activeTab === 'timeline' && (
            <MatchTimeline match={match} embedded onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  )
}
