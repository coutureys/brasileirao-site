/**
 * 📈 TEAM EVOLUTION — Gráficos de evolução da temporada
 * Recharts: Pontos, Gols, Desempenho, Win Rate
 */
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { useState } from 'react'

export default function TeamEvolution({ teamName = 'Flamengo' }) {
  const [selectedRound, setSelectedRound] = useState(null)

  // Mock: Dados de evolução por rodada
  const pointsData = [
    { rodada: 1, pontos: 3, acumulado: 3, status: 'V' },
    { rodada: 2, pontos: 0, acumulado: 3, status: 'D' },
    { rodada: 3, pontos: 1, acumulado: 4, status: 'E' },
    { rodada: 4, pontos: 3, acumulado: 7, status: 'V' },
    { rodada: 5, pontos: 3, acumulado: 10, status: 'V' },
    { rodada: 6, pontos: 0, acumulado: 10, status: 'D' },
    { rodada: 7, pontos: 1, acumulado: 11, status: 'E' },
    { rodada: 8, pontos: 3, acumulado: 14, status: 'V' },
    { rodada: 9, pontos: 3, acumulado: 17, status: 'V' },
    { rodada: 10, pontos: 1, acumulado: 18, status: 'E' },
  ]

  // Gols pró e contra
  const goalsData = [
    { rodada: 1, pró: 2, contra: 0 },
    { rodada: 2, pró: 0, contra: 1 },
    { rodada: 3, pró: 1, contra: 1 },
    { rodada: 4, pró: 3, contra: 1 },
    { rodada: 5, pró: 2, contra: 0 },
    { rodada: 6, pró: 1, contra: 2 },
    { rodada: 7, pró: 1, contra: 1 },
    { rodada: 8, pró: 4, contra: 2 },
    { rodada: 9, pró: 2, contra: 1 },
    { rodada: 10, pró: 1, contra: 1 },
  ]

  // Desempenho em casa vs fora
  const performanceData = [
    { rodada: '1-5', casa: 8, fora: 2 },
    { rodada: '6-10', casa: 10, fora: 8 },
    { rodada: '11-15', casa: 12, fora: 5 },
    { rodada: '16-20', casa: 11, fora: 7 },
    { rodada: '21-25', casa: 9, fora: 6 },
  ]

  // Win rate
  const winRateData = [
    { rodada: 5, winRate: 40 },
    { rodada: 10, winRate: 50 },
    { rodada: 15, winRate: 53 },
    { rodada: 20, winRate: 55 },
    { rodada: 25, winRate: 58 },
  ]

  // Sequência V/D/E (cores)
  const sequenceData = [
    { rodada: 1, resultado: 'V', cor: '#10b981' },
    { rodada: 2, resultado: 'D', cor: '#ef4444' },
    { rodada: 3, resultado: 'E', cor: '#f59e0b' },
    { rodada: 4, resultado: 'V', cor: '#10b981' },
    { rodada: 5, resultado: 'V', cor: '#10b981' },
    { rodada: 6, resultado: 'D', cor: '#ef4444' },
    { rodada: 7, resultado: 'E', cor: '#f59e0b' },
    { rodada: 8, resultado: 'V', cor: '#10b981' },
    { rodada: 9, resultado: 'V', cor: '#10b981' },
    { rodada: 10, resultado: 'E', cor: '#f59e0b' },
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-dark border border-brand-border rounded-lg p-3">
          <p className="text-xs text-white font-bold">Rodada {payload[0].payload.rodada}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* === HEADER === */}
      <div className="bg-gradient-to-r from-brand-accent to-brand-dark border border-brand-border rounded-xl p-6">
        <h2 className="text-2xl font-black text-white mb-2">📈 Evolução {teamName}</h2>
        <p className="text-sm text-white/60">Temporada 2025-26</p>
      </div>

      {/* === 1. PONTOS POR RODADA === */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-white mb-4">📊 Pontos Acumulados</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={pointsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="rodada" stroke="#ffffff40" />
            <YAxis stroke="#ffffff40" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="acumulado"
              stroke="#10b981"
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
              strokeWidth={3}
              name="Pontos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === 2. GOLS PRÓ E CONTRA === */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-white mb-4">⚽ Gols Pró vs Contra</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={goalsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="rodada" stroke="#ffffff40" />
            <YAxis stroke="#ffffff40" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="pró" fill="#10b981" name="Gols Marcados" radius={[8, 8, 0, 0]} />
            <Bar dataKey="contra" fill="#ef4444" name="Gols Sofridos" radius={[8, 8, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* === 3. DESEMPENHO CASA VS FORA === */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-white mb-4">🏟️ Pontos por Fase</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="rodada" stroke="#ffffff40" />
            <YAxis stroke="#ffffff40" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="casa" fill="#3b82f6" name="Em Casa" radius={[8, 8, 0, 0]} />
            <Bar dataKey="fora" fill="#8b5cf6" name="Fora de Casa" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* === 4. WIN RATE AO LONGO DO TEMPO === */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-white mb-4">🏆 Win Rate (%)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={winRateData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="rodada" stroke="#ffffff40" />
            <YAxis stroke="#ffffff40" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="winRate"
              stroke="#f59e0b"
              dot={{ fill: '#f59e0b', r: 6 }}
              activeDot={{ r: 8 }}
              strokeWidth={3}
              name="Taxa de Vitória"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === 5. SEQUÊNCIA V/D/E === */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-white mb-4">🎯 Últimos Resultados</h3>
        <div className="flex gap-2 flex-wrap">
          {sequenceData.map(item => (
            <button
              key={item.rodada}
              onClick={() => setSelectedRound(item.rodada)}
              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all
                ${selectedRound === item.rodada ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}
              `}
              style={{ backgroundColor: item.cor }}>
              <span className="text-white font-black">{item.resultado}</span>
            </button>
          ))}
        </div>
        {selectedRound && (
          <div className="mt-4 p-4 bg-white/5 border border-brand-border rounded-lg">
            <p className="text-sm text-white">
              <span className="font-bold">Rodada {selectedRound}:</span> {' '}
              {sequenceData.find(d => d.rodada === selectedRound)?.resultado === 'V' && '✓ Vitória'}
              {sequenceData.find(d => d.rodada === selectedRound)?.resultado === 'D' && '✗ Derrota'}
              {sequenceData.find(d => d.rodada === selectedRound)?.resultado === 'E' && '= Empate'}
            </p>
            <p className="text-xs text-white/50 mt-2">Clique para ver detalhes do jogo</p>
          </div>
        )}
      </div>

      {/* === ESTATÍSTICAS RESUMIDAS === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <p className="text-xs text-white/50 uppercase font-bold mb-2">Vitórias</p>
          <p className="text-2xl font-black text-brand-green">6</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-white/50 uppercase font-bold mb-2">Empates</p>
          <p className="text-2xl font-black text-amber-400">3</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-white/50 uppercase font-bold mb-2">Derrotas</p>
          <p className="text-2xl font-black text-red-400">1</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-white/50 uppercase font-bold mb-2">Saldo</p>
          <p className="text-2xl font-black text-blue-400">+8</p>
        </div>
      </div>
    </div>
  )
}
