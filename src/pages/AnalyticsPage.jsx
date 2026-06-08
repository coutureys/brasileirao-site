import { useState } from 'react'
import TeamEvolution from '../components/TeamEvolution'

const TEAMS = [
  { id: 'flamengo', name: 'Flamengo' },
  { id: 'palmeiras', name: 'Palmeiras' },
  { id: 'santos', name: 'Santos' },
  { id: 'saopaulo', name: 'São Paulo' },
  { id: 'corinthians', name: 'Corinthians' },
  { id: 'botafogo', name: 'Botafogo' },
  { id: 'vasco', name: 'Vasco' },
  { id: 'fortaleza', name: 'Fortaleza' },
]

export default function AnalyticsPage() {
  const [selectedTeam, setSelectedTeam] = useState('flamengo')
  const team = TEAMS.find(t => t.id === selectedTeam)

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* === SELETOR DE TIME === */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-6">📊 Analytics</h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TEAMS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTeam(t.id)}
                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  selectedTeam === t.id
                    ? 'bg-brand-green text-brand-dark shadow-lg'
                    : 'bg-brand-accent border border-brand-border text-white hover:bg-white/5'
                }`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* === GRÁFICOS === */}
        {team && <TeamEvolution teamName={team.name} />}
      </div>
    </div>
  )
}
