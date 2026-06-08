/**
 * 📊 ADVANCED STATS — Estatísticas avançadas (xG, xA, etc)
 */

export function AdvancedStats({ match }) {
  const homeStats = {
    team: 'Flamengo',
    goals: 2,
    xG: 2.4, // Expected Goals
    xA: 1.8, // Expected Assists
    shotAccuracy: 65,
    possession: 58,
    passAccuracy: 82,
    tackles: 12,
    interceptions: 7,
    clearances: 15,
  }

  const awayStats = {
    team: 'Botafogo',
    goals: 1,
    xG: 1.1,
    xA: 0.9,
    shotAccuracy: 45,
    possession: 42,
    passAccuracy: 75,
    tackles: 18,
    interceptions: 12,
    clearances: 22,
  }

  return (
    <div className="space-y-6">
      {/* xG (Expected Goals) */}
      <div className="bg-white/3 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-4">⚽ Expected Goals (xG)</h3>

        <div className="space-y-3">
          {/* Home */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">{homeStats.team}</span>
              <span className="font-bold text-white">
                {homeStats.goals} gols • {homeStats.xG.toFixed(1)} xG
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${(homeStats.goals / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Away */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">{awayStats.team}</span>
              <span className="font-bold text-white">
                {awayStats.goals} gols • {awayStats.xG.toFixed(1)} xG
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{ width: `${(awayStats.goals / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40 mt-3">
          xG mede qualidade de finalizações (0-1 escala de probabilidade)
        </p>
      </div>

      {/* Offensive Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* xA */}
        <StatCard
          icon="🎯"
          label="xA"
          home={homeStats.xA.toFixed(1)}
          away={awayStats.xA.toFixed(1)}
          desc="Assistências esperadas"
        />

        {/* Shot Accuracy */}
        <StatCard
          icon="🎲"
          label="Precisão"
          home={`${homeStats.shotAccuracy}%`}
          away={`${awayStats.shotAccuracy}%`}
          desc="Finalizações no alvo"
        />

        {/* Possession */}
        <StatCard
          icon="🔄"
          label="Posse"
          home={`${homeStats.possession}%`}
          away={`${awayStats.possession}%`}
          desc="Controle de bola"
        />

        {/* Pass Accuracy */}
        <StatCard
          icon="📍"
          label="Passes"
          home={`${homeStats.passAccuracy}%`}
          away={`${awayStats.passAccuracy}%`}
          desc="Precisão de passes"
        />
      </div>

      {/* Defensive Stats */}
      <div className="bg-white/3 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-4">🛡️ Defesa</h3>

        <div className="grid grid-cols-3 gap-3">
          <StatSmall
            label="Disputas"
            home={homeStats.tackles}
            away={awayStats.tackles}
          />
          <StatSmall
            label="Interceptações"
            home={homeStats.interceptions}
            away={awayStats.interceptions}
          />
          <StatSmall
            label="Cortes"
            home={homeStats.clearances}
            away={awayStats.clearances}
          />
        </div>
      </div>

      {/* Insights */}
      <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4">
        <h3 className="text-sm font-bold text-brand-green mb-2">💡 Insights</h3>
        <ul className="text-xs text-white/70 space-y-1">
          <li>✓ {homeStats.team} teve mais oportunidades de gol (xG: {homeStats.xG.toFixed(1)})</li>
          <li>✓ {homeStats.team} dominou a posse com {homeStats.possession}%</li>
          <li>✓ {awayStats.team} foi mais eficiente com menos chances</li>
          <li>✓ Defesa de {awayStats.team} fez 22 cortes</li>
        </ul>
      </div>
    </div>
  )
}

function StatCard({ icon, label, home, away, desc }) {
  return (
    <div className="bg-white/3 border border-white/10 rounded-lg p-3 text-center">
      <p className="text-lg mb-1">{icon}</p>
      <p className="text-xs text-white/40 mb-2">{label}</p>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-green-400">{home}</span>
        <span className="text-sm font-bold text-red-400">{away}</span>
      </div>
      <p className="text-xs text-white/30">{desc}</p>
    </div>
  )
}

function StatSmall({ label, home, away }) {
  return (
    <div className="text-center">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <div className="flex justify-between gap-2">
        <span className="text-sm font-bold text-white">{home}</span>
        <span className="text-sm font-bold text-white">{away}</span>
      </div>
    </div>
  )
}
