/**
 * 💰 ODDS WIDGET — Cotações de apostas em tempo real
 */
import { useState } from 'react'

export default function OddsWidget({ match }) {
  const [selectedBet, setSelectedBet] = useState(null)
  const [showCompare, setShowCompare] = useState(false)

  // Mock odds data
  const odds = {
    matchResult: [
      { result: 'Vitória Flamengo', odd: 1.85, change: '+0.05' },
      { result: 'Empate', odd: 3.40, change: '-0.10' },
      { result: 'Vitória Botafogo', odd: 4.20, change: '+0.15' },
    ],
    totalGoals: [
      { result: 'Mais de 2.5 gols', odd: 1.70, change: '+0.02' },
      { result: 'Menos de 2.5 gols', odd: 2.10, change: '-0.05' },
      { result: 'Mais de 3.5 gols', odd: 2.50, change: '+0.10' },
    ],
    bothScore: [
      { result: 'Ambos marcam Sim', odd: 1.65, change: '+0.08' },
      { result: 'Ambos marcam Não', odd: 2.20, change: '-0.08' },
    ],
    handicap: [
      { result: 'Flamengo -1', odd: 2.05, change: '+0.03' },
      { result: 'Botafogo +1', odd: 1.80, change: '-0.02' },
    ],
  }

  const getOddColor = (odd) => {
    if (odd <= 1.5) return 'text-green-400'
    if (odd <= 2.5) return 'text-yellow-400'
    if (odd <= 4) return 'text-orange-400'
    return 'text-red-400'
  }

  const getChangeColor = (change) => {
    return change.startsWith('+') ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">💰 Cotações</h2>
          <p className="text-xs text-white/40">Atualizado em tempo real</p>
        </div>
        <button
          onClick={() => setShowCompare(!showCompare)}
          className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded text-white/60 transition"
        >
          📊 Comparar
        </button>
      </div>

      {/* Bet Types */}
      {[
        { title: 'Resultado da Partida', bets: odds.matchResult, icon: '🎯' },
        { title: 'Total de Gols', bets: odds.totalGoals, icon: '⚽' },
        { title: 'Ambos Marcam', bets: odds.bothScore, icon: '2️⃣' },
        { title: 'Handicap', bets: odds.handicap, icon: '📊' },
      ].map((category, idx) => (
        <div key={idx} className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-white mb-3">{category.icon} {category.title}</h3>

          {category.bets.map((bet, i) => (
            <button
              key={i}
              onClick={() => setSelectedBet(bet)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all
                ${selectedBet === bet
                  ? 'bg-brand-green/20 border-brand-green'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <span className="text-sm font-bold text-white text-left">{bet.result}</span>
              <div className="text-right">
                <span className={`text-lg font-black ${getOddColor(bet.odd)}`}>
                  {bet.odd.toFixed(2)}
                </span>
                <span className={`text-xs ml-2 ${getChangeColor(bet.change)}`}>
                  {bet.change}
                </span>
              </div>
            </button>
          ))}
        </div>
      ))}

      {/* Selected Bet */}
      {selectedBet && (
        <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-brand-green/60 mb-1">APOSTA SELECIONADA</p>
              <p className="text-lg font-bold text-white">{selectedBet.result}</p>
            </div>
            <p className={`text-3xl font-black ${getOddColor(selectedBet.odd)}`}>
              {selectedBet.odd.toFixed(2)}
            </p>
          </div>

          {/* Simulated Bet */}
          <div className="space-y-2 mb-4 pb-4 border-t border-brand-green/20">
            <div className="flex gap-2 mt-3">
              <input
                type="number"
                placeholder="R$ 100"
                defaultValue="100"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              />
              <button className="px-4 py-2 bg-brand-green text-brand-dark font-bold rounded hover:bg-green-400 transition">
                Apostar
              </button>
            </div>
          </div>

          {/* Odds Comparison */}
          {showCompare && (
            <div className="bg-white/3 p-3 rounded border border-white/10 text-xs">
              <p className="text-white/60 mb-2">Melhores casas:</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Betano</span>
                  <span className="text-green-400">1.87</span>
                </div>
                <div className="flex justify-between">
                  <span>Bet365</span>
                  <span className="text-yellow-400">1.85</span>
                </div>
                <div className="flex justify-between">
                  <span>Sportingbet</span>
                  <span className="text-yellow-400">1.85</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
        <p className="text-xs text-red-400">
          ⚠️ Apostas envolvem risco. Jogue com responsabilidade. Menores de 18 não devem apostar.
        </p>
      </div>
    </div>
  )
}
