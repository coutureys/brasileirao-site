/**
 * 📊 MATCH STATS — Estatísticas completas do jogo (ESPN style)
 * Lado a lado com barras comparativas
 */

export default function MatchStats({ match }) {
  // Mock de estatísticas
  const stats = {
    home: {
      possession: 58,
      totalShots: 14,
      shotsOnTarget: 6,
      accuracy: 82,
      fouls: 12,
      yellowCards: 2,
      redCards: 0,
      corners: 7,
      throwin: 18,
      longBallsAccurate: 24,
    },
    away: {
      possession: 42,
      totalShots: 9,
      shotsOnTarget: 4,
      accuracy: 76,
      fouls: 15,
      yellowCards: 3,
      redCards: 0,
      corners: 4,
      throwin: 16,
      longBallsAccurate: 19,
    },
  }

  const StatBar = ({ label, homeVal, awayVal, homeWins }) => {
    const total = homeVal + awayVal
    const homePercent = (homeVal / total) * 100
    const awayPercent = (awayVal / total) * 100

    return (
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-white/70">{label}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Barra Home */}
          <div className="flex-1 text-right pr-3">
            <p className={`text-sm font-black ${homeWins ? 'text-brand-green' : 'text-white'}`}>
              {homeVal}
            </p>
          </div>

          {/* Barra Visual */}
          <div className="flex-1 flex h-6 rounded-lg overflow-hidden bg-white/5 border border-white/10">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center transition-all"
              style={{ width: `${homePercent}%` }}>
              {homePercent > 40 && (
                <span className="text-[10px] font-black text-white">{Math.round(homePercent)}%</span>
              )}
            </div>
            <div
              className="bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center transition-all"
              style={{ width: `${awayPercent}%` }}>
              {awayPercent > 40 && (
                <span className="text-[10px] font-black text-white">{Math.round(awayPercent)}%</span>
              )}
            </div>
          </div>

          {/* Valor Away */}
          <div className="flex-1 text-left pl-3">
            <p className={`text-sm font-black ${!homeWins && awayVal > homeVal ? 'text-red-400' : 'text-white'}`}>
              {awayVal}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const StatRow = ({ label, homeVal, awayVal, homeWins, unit = '' }) => {
    return (
      <div className="flex items-center justify-between py-2.5 px-3 border-b border-white/5 hover:bg-white/2 transition">
        <span className="text-xs text-white/50 flex-1">{label}</span>
        <div className="flex items-center gap-8 flex-1 justify-end">
          <span className={`font-bold text-sm tabular-nums ${homeWins ? 'text-brand-green' : 'text-white'}`}>
            {homeVal}{unit}
          </span>
          <span className={`font-bold text-sm tabular-nums w-12 text-right ${!homeWins && awayVal > homeVal ? 'text-red-400' : 'text-white'}`}>
            {awayVal}{unit}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* === HEADER === */}
      <div className="bg-brand-accent/50 border border-brand-border/50 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-white/50 uppercase font-bold mb-1">Time</p>
            <p className="text-sm font-bold text-white">{match.home.name}</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase font-bold mb-1">Estatísticas</p>
            <p className="text-sm font-bold text-brand-green">Comparativo</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase font-bold mb-1">Time</p>
            <p className="text-sm font-bold text-white">{match.away.name}</p>
          </div>
        </div>
      </div>

      {/* === SEÇÕES COM BARRAS === */}

      {/* Posse de Bola */}
      <div className="card p-4">
        <h3 className="text-sm font-bold text-white mb-4">⚽ Posse de Bola</h3>
        <StatBar
          label="Possession"
          homeVal={stats.home.possession}
          awayVal={stats.away.possession}
          homeWins={stats.home.possession > stats.away.possession}
        />
      </div>

      {/* Finalizações */}
      <div className="card p-4">
        <h3 className="text-sm font-bold text-white mb-4">🎯 Finalizações</h3>
        <StatBar
          label="Total"
          homeVal={stats.home.totalShots}
          awayVal={stats.away.totalShots}
          homeWins={stats.home.totalShots > stats.away.totalShots}
        />
        <StatBar
          label="No Alvo"
          homeVal={stats.home.shotsOnTarget}
          awayVal={stats.away.shotsOnTarget}
          homeWins={stats.home.shotsOnTarget > stats.away.shotsOnTarget}
        />
      </div>

      {/* Passes */}
      <div className="card p-4">
        <h3 className="text-sm font-bold text-white mb-4">📍 Passes</h3>
        <StatBar
          label="Acurácia"
          homeVal={stats.home.accuracy}
          awayVal={stats.away.accuracy}
          homeWins={stats.home.accuracy > stats.away.accuracy}
        />
        <StatBar
          label="Passes Longos"
          homeVal={stats.home.longBallsAccurate}
          awayVal={stats.away.longBallsAccurate}
          homeWins={stats.home.longBallsAccurate > stats.away.longBallsAccurate}
        />
      </div>

      {/* Tabela Detalhada */}
      <div className="card overflow-hidden">
        <div className="bg-brand-accent/50 border-b border-brand-border px-4 py-3">
          <h3 className="text-sm font-bold text-white">📋 Detalhes</h3>
        </div>

        <div>
          <StatRow
            label="Faltas Cometidas"
            homeVal={stats.home.fouls}
            awayVal={stats.away.fouls}
            homeWins={stats.home.fouls < stats.away.fouls}
          />
          <StatRow
            label="Cartões Amarelos"
            homeVal={stats.home.yellowCards}
            awayVal={stats.away.yellowCards}
            homeWins={stats.home.yellowCards < stats.away.yellowCards}
          />
          <StatRow
            label="Cartões Vermelhos"
            homeVal={stats.home.redCards}
            awayVal={stats.away.redCards}
            homeWins={stats.home.redCards < stats.away.redCards}
          />
          <StatRow
            label="Escanteios"
            homeVal={stats.home.corners}
            awayVal={stats.away.corners}
            homeWins={stats.home.corners > stats.away.corners}
          />
          <StatRow
            label="Laterais"
            homeVal={stats.home.throwin}
            awayVal={stats.away.throwin}
            homeWins={stats.home.throwin > stats.away.throwin}
          />
        </div>
      </div>

      {/* === LEGENDA === */}
      <div className="flex gap-3 text-xs text-white/50 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>{match.home.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded"></div>
          <span>{match.away.name}</span>
        </div>
      </div>
    </div>
  )
}
