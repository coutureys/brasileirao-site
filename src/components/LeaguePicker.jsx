import { useNavigate } from 'react-router-dom'
import { LEAGUES } from '../leagues'

export default function LeaguePicker({ selected, onChange, onLeagueClick }) {
  const navigate = useNavigate()
  const current = LEAGUES.find(l => l.id === selected) ?? LEAGUES[0]

  const handleLeagueClick = (leagueId) => {
    onChange(leagueId)
    if (onLeagueClick) {
      onLeagueClick(leagueId)
    } else {
      navigate(`/competition/${leagueId}`)
    }
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-none">
      <div className="flex gap-2 px-4 sm:px-6 lg:px-8 pb-1 min-w-max mx-auto max-w-7xl">
        {LEAGUES.map(league => {
          const active = selected === league.id
          return (
            <button
              key={league.id}
              onClick={() => handleLeagueClick(league.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold
                          flex-shrink-0 transition-all duration-200 border
                          ${active
                            ? 'text-white shadow-lg scale-105'
                            : 'bg-brand-accent border-brand-border text-white/40 hover:text-white hover:border-white/20'
                          }`}
              style={active ? {
                background: league.color + '18',
                borderColor: league.color + '40',
                color: league.color,
                boxShadow: `0 0 20px ${league.color}15`,
              } : {}}>
              <span className="text-base leading-none">{league.flag}</span>
              <span className="hidden sm:inline">{league.short}</span>
              <span className="sm:hidden">{league.short}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
