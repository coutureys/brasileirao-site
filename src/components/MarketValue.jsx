/**
 * 💵 MARKET VALUE — Valor de mercado dos jogadores
 */
import { useState } from 'react'

export default function MarketValue({ player }) {
  const [timeframe, setTimeframe] = useState('3m') // 1m, 3m, 6m, 1y

  // Mock data
  const playerData = {
    name: 'Vinícius Júnior',
    age: 26,
    position: 'Atacante',
    team: 'Flamengo',
    marketValue: 42500000, // R$ 42.5 milhões
    lastUpdate: '2026-06-08',
    change: 2500000, // +R$ 2.5M
    changePercent: 6.3,
  }

  const historyData = {
    '1m': [
      { date: '2026-05-08', value: 40000000 },
      { date: '2026-05-22', value: 41200000 },
      { date: '2026-06-08', value: 42500000 },
    ],
    '3m': [
      { date: '2026-03-08', value: 38000000 },
      { date: '2026-04-08', value: 40000000 },
      { date: '2026-05-08', value: 40000000 },
      { date: '2026-06-08', value: 42500000 },
    ],
    '6m': [
      { date: '2025-12-08', value: 35000000 },
      { date: '2026-01-08', value: 36500000 },
      { date: '2026-02-08', value: 37800000 },
      { date: '2026-03-08', value: 38000000 },
      { date: '2026-04-08', value: 40000000 },
      { date: '2026-05-08', value: 40000000 },
      { date: '2026-06-08', value: 42500000 },
    ],
    '1y': [
      { date: '2025-06-08', value: 32000000 },
      { date: '2025-09-08', value: 34500000 },
      { date: '2025-12-08', value: 35000000 },
      { date: '2026-03-08', value: 38000000 },
      { date: '2026-06-08', value: 42500000 },
    ],
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const currentHistory = historyData[timeframe]
  const minValue = Math.min(...currentHistory.map(h => h.value))
  const maxValue = Math.max(...currentHistory.map(h => h.value))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/3 border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-white/40 mb-1">VALOR DE MERCADO</p>
            <h2 className="text-3xl font-black text-white mb-1">{formatCurrency(playerData.marketValue)}</h2>
            <p className="text-xs text-white/50">{playerData.name} • {playerData.position}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-black flex items-center gap-2
              ${playerData.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {playerData.changePercent > 0 ? '📈' : '📉'} {playerData.changePercent}%
            </div>
            <p className={`text-sm font-bold ${playerData.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {playerData.changePercent > 0 ? '+' : ''}{formatCurrency(playerData.change)}
            </p>
            <p className="text-xs text-white/40 mt-2">{playerData.lastUpdate}</p>
          </div>
        </div>

        {/* Comparison */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
          <ComparisonStat label="Mínimo (período)" value={formatCurrency(minValue)} />
          <ComparisonStat label="Máximo (período)" value={formatCurrency(maxValue)} />
          <ComparisonStat label="Variação" value={`${(((maxValue - minValue) / minValue) * 100).toFixed(1)}%`} />
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {[
          { id: '1m', label: '1 Mês' },
          { id: '3m', label: '3 Meses' },
          { id: '6m', label: '6 Meses' },
          { id: '1y', label: '1 Ano' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTimeframe(t.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all
              ${timeframe === t.id
                ? 'bg-brand-green text-brand-dark'
                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart Simulation */}
      <div className="bg-white/3 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-4">📊 Evolução</h3>

        {/* Simple bar chart */}
        <div className="space-y-2 mb-4">
          {currentHistory.map((h, idx) => {
            const percent = ((h.value - minValue) / (maxValue - minValue)) * 100
            return (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-white/50">{h.date}</span>
                  <span className="text-xs font-bold text-white">{formatCurrency(h.value)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${idx === currentHistory.length - 1 ? 'bg-brand-green' : 'bg-blue-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Idade" value={`${playerData.age} anos`} />
        <StatCard label="Posição" value={playerData.position} />
        <StatCard label="Time" value={playerData.team} />
        <StatCard label="Contrato" value="2025-2030" />
      </div>

      {/* Similar Players */}
      <div className="bg-white/3 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">👥 Jogadores similares</h3>
        <div className="space-y-2">
          {[
            { name: 'Rodrygo', value: 45000000 },
            { name: 'Neymar', value: 65000000 },
            { name: 'Dudu', value: 38000000 },
          ].map((p, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <span className="text-white">{p.name}</span>
              <span className="font-bold text-white">{formatCurrency(p.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  )
}

function ComparisonStat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  )
}
