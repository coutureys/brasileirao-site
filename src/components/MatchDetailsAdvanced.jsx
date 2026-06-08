/**
 * 🎮 MATCH DETAILS ADVANCED — Stats FREE vs PRO
 */
import { useState, useEffect } from 'react'
import { usePlan } from '../hooks/usePlan'
import { getApiService } from '../services/matchDataService'

export default function MatchDetailsAdvanced({ matchId }) {
  const { plan, features } = usePlan()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiService = getApiService(plan)

        if (plan === 'pro') {
          // PRO: Dados completos em paralelo
          const completeData = await apiService.getCompleteData(matchId)
          setData(completeData)
        } else {
          // FREE: Dados básicos
          const match = await apiService.getMatch(matchId)
          setData(match)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [matchId, plan])

  if (loading) return <div className="text-center text-white/50">⏳ Carregando...</div>
  if (error) return <div className="text-red-400">❌ {error}</div>

  return (
    <div className="space-y-4">
      {/* PLAN BADGE */}
      <div className={`flex items-center justify-between p-3 rounded-lg border
        ${plan === 'pro'
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-yellow-500/10 border-yellow-500/30'}`}>
        <div className="flex items-center gap-2">
          {plan === 'pro' ? (
            <>
              <span className="text-lg">👑</span>
              <span className="text-sm font-bold text-green-400">PRO — Acesso Completo</span>
            </>
          ) : (
            <>
              <span className="text-lg">🔓</span>
              <span className="text-sm font-bold text-yellow-400">FREE — Versão Limitada</span>
            </>
          )}
        </div>
        {plan === 'free' && (
          <button className="text-xs px-3 py-1 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition">
            Upgrade
          </button>
        )}
      </div>

      {/* STATS BÁSICAS (FREE + PRO) */}
      <div className="bg-white/3 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-4">📊 Estatísticas Básicas</h3>
        <BasicStats data={data} />
      </div>

      {/* STATS AVANÇADAS (APENAS PRO) */}
      {plan === 'pro' && (
        <>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4">
            <h3 className="text-sm font-bold text-green-400 mb-4">⚽ Expected Goals (xG)</h3>
            <XGStats data={data} />
          </div>

          <div className="bg-white/3 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-4">🎯 Chances Claras</h3>
            <ClearChances data={data} />
          </div>

          <div className="bg-white/3 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-4">👤 Rating dos Jogadores</h3>
            <PlayerRatings data={data} />
          </div>

          <div className="bg-white/3 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-4">📍 Timeline Completa</h3>
            <MatchTimeline data={data} />
          </div>
        </>
      )}

      {/* UPGRADE CTA (FREE USERS) */}
      {plan === 'free' && (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6 text-center">
          <p className="text-sm text-white/60 mb-2">📈 Quer ver mais detalhes?</p>
          <p className="text-lg font-black text-white mb-4">
            Upgrade para PRO e desbloqueie:
          </p>
          <ul className="text-xs text-white/70 space-y-1 mb-4">
            <li>✓ Expected Goals (xG) — Qualidade das finalizações</li>
            <li>✓ Chances Claras — Melhores oportunidades</li>
            <li>✓ Rating de Jogadores — Performance individual</li>
            <li>✓ Timeline Completa — Todos os eventos do jogo</li>
            <li>✓ Stats Avançadas — Análise profissional</li>
          </ul>
          <button className="px-6 py-3 bg-green-500 text-black font-black rounded-lg hover:bg-green-400 transition">
            Upgrade para PRO • R$ 9,90/mês
          </button>
        </div>
      )}
    </div>
  )
}

// Components auxiliares

function BasicStats({ data }) {
  if (!data) return <div className="text-white/50">Dados não disponíveis</div>

  const stats = [
    { icon: '🔄', label: 'Posse', home: '58%', away: '42%' },
    { icon: '📍', label: 'Passes', home: '524', away: '387' },
    { icon: '🟨', label: 'Cartões', home: '2', away: '3' },
    { icon: '🎲', label: 'Faltas', home: '12', away: '15' },
    { icon: '🚩', label: 'Escanteios', home: '6', away: '4' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white/5 p-3 rounded-lg text-center">
          <p className="text-lg mb-1">{stat.icon}</p>
          <p className="text-xs text-white/60 mb-1">{stat.label}</p>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-blue-400">{stat.home}</span>
            <span className="text-red-400">{stat.away}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function XGStats({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <div className="h-20 bg-blue-500/20 rounded-lg flex items-end justify-center mb-2">
            <div className="w-1/2 h-16 bg-blue-500 rounded-t"></div>
          </div>
          <p className="text-sm font-bold text-white text-center">2.4</p>
          <p className="text-xs text-white/50 text-center">Home xG</p>
        </div>
        <div className="flex-1">
          <div className="h-20 bg-red-500/20 rounded-lg flex items-end justify-center mb-2">
            <div className="w-1/2 h-10 bg-red-500 rounded-t"></div>
          </div>
          <p className="text-sm font-bold text-white text-center">1.1</p>
          <p className="text-xs text-white/50 text-center">Away xG</p>
        </div>
      </div>
      <p className="text-xs text-white/60 text-center">
        🔍 Home teve mais qualidade nas finalizações
      </p>
    </div>
  )
}

function ClearChances({ data }) {
  return (
    <div className="space-y-2">
      {[
        { team: 'Flamengo', chances: 3, icons: '⚽⚽⚽' },
        { team: 'Botafogo', chances: 1, icons: '⚽' },
      ].map(item => (
        <div key={item.team} className="flex justify-between items-center p-2 bg-white/5 rounded">
          <span className="text-sm text-white">{item.team}</span>
          <span className="text-lg">{item.icons}</span>
          <span className="text-xs font-bold text-white/60">{item.chances}</span>
        </div>
      ))}
    </div>
  )
}

function PlayerRatings({ data }) {
  const topPlayers = [
    { name: 'Vinícius Júnior', rating: 8.5, assists: 1 },
    { name: 'Dudu', rating: 7.2, assists: 0 },
    { name: 'Defensôr', rating: 6.8, assists: 0 },
  ]

  return (
    <div className="space-y-2">
      {topPlayers.map(player => (
        <div key={player.name} className="flex justify-between items-center p-2 bg-white/5 rounded">
          <span className="text-sm text-white">{player.name}</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-xs font-black text-white">
              {player.rating.toFixed(1)}
            </div>
            <span className="text-xs text-white/60">{player.assists} assist</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MatchTimeline({ data }) {
  const events = [
    { minute: '12\'', event: 'Gol', team: 'Flamengo', player: 'Vinícius', icon: '⚽' },
    { minute: '34\'', event: 'Cartão', team: 'Botafogo', player: 'Defensôr', icon: '🟨' },
    { minute: '67\'', event: 'Substituição', team: 'Flamengo', player: 'Sai: Dudu', icon: '🔄' },
    { minute: '89\'', event: 'Gol', team: 'Flamengo', player: 'Atacante', icon: '⚽' },
  ]

  return (
    <div className="space-y-2">
      {events.map((event, i) => (
        <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded text-sm">
          <span className="font-bold text-white/60 w-8">{event.minute}</span>
          <span className="text-lg">{event.icon}</span>
          <div className="flex-1">
            <p className="text-white">{event.event}</p>
            <p className="text-xs text-white/50">{event.player}</p>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded ${
            event.team === 'Flamengo' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {event.team}
          </span>
        </div>
      ))}
    </div>
  )
}
