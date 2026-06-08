/**
 * 📅 CALENDAR WIDGET — Calendário de jogos + integração Google Calendar
 */
import { useState } from 'react'

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 8)) // Jun 8, 2026
  const [view, setView] = useState('month') // month, week, day
  const [selectedMatches, setSelectedMatches] = useState([])

  // Mock de dados
  const matches = [
    { date: new Date(2026, 5, 8), time: '20:00', teams: 'Flamengo x Botafogo', league: 'Série A' },
    { date: new Date(2026, 5, 9), time: '19:00', teams: 'Palmeiras x São Paulo', league: 'Série A' },
    { date: new Date(2026, 5, 10), time: '21:30', teams: 'Libertadores - Semis', league: 'Libertadores' },
    { date: new Date(2026, 5, 15), time: '20:00', teams: 'Grêmio x Internacional', league: 'Série A' },
  ]

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getMatchesForDate = (day) => {
    return matches.filter(m =>
      m.date.getDate() === day &&
      m.date.getMonth() === currentDate.getMonth() &&
      m.date.getFullYear() === currentDate.getFullYear()
    )
  }

  const addToGoogleCalendar = (match) => {
    const text = encodeURIComponent(match.teams)
    const details = encodeURIComponent(`${match.league}\n${match.time}`)
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`
    window.open(googleCalendarUrl, '_blank')
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-white capitalize">{monthName}</h3>
          <p className="text-xs text-white/40">{matches.length} jogos este mês</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            ←
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            →
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'month', label: 'Mês', icon: '📅' },
          { id: 'week', label: 'Semana', icon: '📆' },
          { id: 'day', label: 'Dia', icon: '📍' },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all
              ${view === v.id
                ? 'bg-brand-green text-brand-dark'
                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="space-y-3">
        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-white/40 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayMatches = getMatchesForDate(day)
            const isToday = new Date().getDate() === day &&
                           new Date().getMonth() === currentDate.getMonth()

            return (
              <button
                key={day}
                onClick={() => setSelectedMatches(dayMatches)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all
                  ${isToday
                    ? 'bg-brand-green text-brand-dark'
                    : dayMatches.length > 0
                    ? 'bg-blue-500/20 border border-blue-500/30 text-white hover:bg-blue-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                <span>{day}</span>
                {dayMatches.length > 0 && (
                  <span className="text-[10px]">⚽</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Matches */}
      {selectedMatches.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
          <h4 className="text-sm font-bold text-white mb-3">Jogos selecionados</h4>
          {selectedMatches.map((match, idx) => (
            <div key={idx} className="bg-white/3 border border-white/10 rounded-lg p-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{match.teams}</p>
                <p className="text-xs text-white/50">{match.time} • {match.league}</p>
              </div>
              <button
                onClick={() => addToGoogleCalendar(match)}
                className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition flex-shrink-0"
              >
                📅 Adicionar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
        <button className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 rounded text-white/60 transition">
          📤 Exportar iCal
        </button>
        <button className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 rounded text-white/60 transition">
          🔗 Sincronizar Google
        </button>
      </div>
    </div>
  )
}
