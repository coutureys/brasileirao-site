import { useState } from 'react'
import { usePhases } from '../hooks/useFootball'
import Tooltip from './Tooltip'

/**
 * 🏆 PHASED TOURNAMENT — Grupos + Eliminatória
 * Suporta: Grupos → R16 → Quartas → Semis → Final
 */
export default function PhasedTournament({ league = 'uefa.champions', leagueInfo }) {
  const { phases, loading, error, refetch } = usePhases(league)
  const [activePhase, setActivePhase] = useState('groups')

  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-12 text-center animate-pulse text-white/30">
            Carregando fases do torneio...
          </div>
        </div>
      </section>
    )
  }

  if (error || !phases) {
    return (
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-10 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-bold text-white/60">Erro ao carregar fases do torneio</p>
            <button onClick={refetch}
                    className="mt-4 px-4 py-2 rounded-xl bg-brand-green text-brand-dark font-bold text-sm">
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    )
  }

  const phaseConfig = [
    { key: 'groups', label: 'Grupos', icon: '👥', matches: phases.groups.length > 0 },
    { key: 'round16', label: 'R16', icon: '⏱️', matches: phases.round16.length > 0 },
    { key: 'quarterfinals', label: 'Quartas', icon: '🎯', matches: phases.quarterfinals.length > 0 },
    { key: 'semifinals', label: 'Semis', icon: '🔥', matches: phases.semifinals.length > 0 },
    { key: 'final', label: 'Final', icon: '👑', matches: phases.final !== null },
  ]

  const activeCfg = phaseConfig.find(p => p.key === activePhase)

  return (
    <section id="fases" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="section-tag" style={leagueInfo ? { color: leagueInfo.color } : {}}>
            {leagueInfo?.flag} {leagueInfo?.name ?? 'Torneio'} 2025-26
          </p>
          <h2 className="section-title mt-1">Fases do Torneio</h2>
        </div>

        {/* Navegação de Fases */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {phaseConfig.map((cfg) => (
              <Tooltip
                key={cfg.key}
                text={cfg.matches ? '' : '⏳ Fase ainda não iniciada'}
                position="bottom"
              >
                <button
                  onClick={() => setActivePhase(cfg.key)}
                  disabled={!cfg.matches}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm flex-shrink-0 border transition-all ${
                    activePhase === cfg.key
                      ? 'text-white bg-brand-green border-brand-green/30'
                      : cfg.matches
                      ? 'text-white/60 border-brand-border bg-brand-accent hover:text-white'
                      : 'text-white/20 border-white/10 bg-white/5 cursor-not-allowed'
                  }`}
                  style={
                    activePhase === cfg.key && leagueInfo
                      ? { background: leagueInfo.color + '20', borderColor: leagueInfo.color + '30', color: leagueInfo.color }
                      : {}
                  }
                >
                  <span className="mr-1.5">{cfg.icon}</span>
                  {cfg.label}
                  {!cfg.matches && <span className="ml-1 text-xs">🔒</span>}
                </button>
              </Tooltip>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">
            💡 Abas desabilitadas 🔒 ainda não iniciaram. Confira as datas no calendário da competição.
          </p>
        </div>

        {/* Conteúdo de cada fase */}
        {activePhase === 'groups' && <GroupsPhase groups={phases.groups} leagueInfo={leagueInfo} />}
        {activePhase === 'round16' && <KnockoutPhase matches={phases.round16} title="Oitavas de Final" leagueInfo={leagueInfo} />}
        {activePhase === 'quarterfinals' && <KnockoutPhase matches={phases.quarterfinals} title="Quartas de Final" leagueInfo={leagueInfo} />}
        {activePhase === 'semifinals' && <KnockoutPhase matches={phases.semifinals} title="Semifinal" leagueInfo={leagueInfo} />}
        {activePhase === 'final' && <FinalPhase match={phases.final} leagueInfo={leagueInfo} />}

      </div>
    </section>
  )
}

// ── Fase de Grupos ─────────────────────────────────────────────────────
function GroupsPhase({ groups, leagueInfo }) {
  return (
    <div className="space-y-8">
      {groups.map((group, idx) => (
        <div key={idx} className="card overflow-hidden">
          <div className="bg-white/5 px-6 py-4 border-b border-white/10">
            <h3 className="font-black text-lg text-white">{group.name}</h3>
          </div>

          <div className="divide-y divide-white/5">
            {group.standings.map((team, i) => (
              <div key={i} className={`px-6 py-3 flex items-center justify-between ${
                i < 2 ? 'bg-brand-green/5' : 'bg-red-500/5'
              }`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`font-bold w-8 text-center ${i < 2 ? 'text-brand-green' : 'text-red-400'}`}>
                    {team.pos}º
                  </span>
                  {team.team.crest ? (
                    <img src={team.team.crest} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {team.team.abbr[0]}
                    </div>
                  )}
                  <p className="font-semibold text-sm truncate">{team.team.name}</p>
                </div>

                <div className="flex-shrink-0 ml-4">
                  <Tooltip
                    position="left"
                    text={`${team.pts}pts • ${team.sg > 0 ? '+' : ''}${team.sg}SG • ${team.gp}GM`}
                  >
                    <span className={`text-sm font-bold tabular-nums cursor-help ${i < 2 ? 'text-brand-green' : 'text-white/50'}`}>
                      {team.pts}
                    </span>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-4 text-sm text-white/60">
        <p className="font-bold text-white mb-2">ℹ️ Como funciona:</p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>Top 2 de cada grupo se classificam para as oitavas</li>
          <li>Termos de desempate: Pontos → Saldo → Gols</li>
          <li>Times em verde foram classificados</li>
          <li>Times em vermelho foram eliminados</li>
        </ul>
      </div>
    </div>
  )
}

// ── Fase de Eliminação ─────────────────────────────────────────────────
function KnockoutPhase({ matches, title, leagueInfo }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="card p-10 text-center text-white/40">
        <p className="text-2xl mb-2">⏳</p>
        <p>Ainda não há jogos marcados para {title.toLowerCase()}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match, i) => (
        <KnockoutMatch key={i} match={match} />
      ))}
    </div>
  )
}

// ── Jogo de Eliminação ─────────────────────────────────────────────────
function KnockoutMatch({ match }) {
  const homeWin = match.home.score > match.away.score
  const awayWin = match.away.score > match.home.score
  const isDone = match.status === 'FT'

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Casa */}
        <div className="flex-1 min-w-[140px] text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            {match.home.crest ? (
              <img src={match.home.crest} alt="" className="w-7 h-7 object-contain" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                {match.home.abbr[0]}
              </div>
            )}
            <p className={`font-bold text-sm sm:text-base ${homeWin && isDone ? 'text-brand-green' : 'text-white/70'}`}>
              {match.home.name}
            </p>
          </div>
          {isDone && (
            <p className={`text-xs text-white/40`}>
              {homeWin ? '✅ Classificado' : '❌ Eliminado'}
            </p>
          )}
        </div>

        {/* Placar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDone ? (
            <>
              <span className={`text-2xl font-black tabular-nums ${homeWin ? 'text-brand-green' : 'text-white/70'}`}>
                {match.home.score}
              </span>
              <span className="text-white/20 text-lg">–</span>
              <span className={`text-2xl font-black tabular-nums ${awayWin ? 'text-brand-green' : 'text-white/70'}`}>
                {match.away.score}
              </span>
            </>
          ) : (
            <span className="text-white/40 text-sm font-bold">vs</span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 min-w-[140px] text-left">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-bold text-sm sm:text-base ${awayWin && isDone ? 'text-brand-green' : 'text-white/70'}`}>
              {match.away.name}
            </p>
            {match.away.crest ? (
              <img src={match.away.crest} alt="" className="w-7 h-7 object-contain" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                {match.away.abbr[0]}
              </div>
            )}
          </div>
          {isDone && (
            <p className={`text-xs text-white/40`}>
              {awayWin ? '✅ Classificado' : '❌ Eliminado'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Final ───────────────────────────────────────────────────────────────
function FinalPhase({ match, leagueInfo }) {
  if (!match) {
    return (
      <div className="card p-10 text-center text-white/40">
        <p className="text-2xl mb-2">🏆</p>
        <p>Final ainda não ocorreu</p>
      </div>
    )
  }

  const isDone = match.status === 'FT'
  const homeWin = match.home.score > match.away.score

  return (
    <div className="card p-8 sm:p-12">
      <div className="text-center mb-12">
        <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">🏆 FINAL</h3>
        <p className="text-white/40">{new Date(match.date).toLocaleDateString('pt-BR')}</p>
      </div>

      <div className="flex items-center justify-between gap-6 sm:gap-12">
        {/* Casa */}
        <div className="flex-1 text-center">
          <div className="mb-6">
            {match.home.crest ? (
              <img src={match.home.crest} alt="" className="w-16 h-16 sm:w-24 sm:h-24 mx-auto object-contain" />
            ) : (
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full bg-white/10 flex items-center justify-center text-2xl sm:text-4xl font-black">
                {match.home.abbr[0]}
              </div>
            )}
          </div>
          <p className={`text-lg sm:text-xl font-black ${homeWin && isDone ? 'text-brand-green' : 'text-white'}`}>
            {match.home.name}
          </p>
          {isDone && homeWin && (
            <p className="text-brand-green font-bold mt-2">🏆 CAMPEÃO</p>
          )}
        </div>

        {/* Placar */}
        <div className="flex-shrink-0">
          {isDone ? (
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-6xl font-black text-white tabular-nums">
                {match.home.score}
              </span>
              <span className="text-2xl sm:text-4xl text-white/20">–</span>
              <span className="text-4xl sm:text-6xl font-black text-white tabular-nums">
                {match.away.score}
              </span>
            </div>
          ) : (
            <p className="text-white/40 font-bold">em breve</p>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 text-center">
          <div className="mb-6">
            {match.away.crest ? (
              <img src={match.away.crest} alt="" className="w-16 h-16 sm:w-24 sm:h-24 mx-auto object-contain" />
            ) : (
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-full bg-white/10 flex items-center justify-center text-2xl sm:text-4xl font-black">
                {match.away.abbr[0]}
              </div>
            )}
          </div>
          <p className={`text-lg sm:text-xl font-black ${!homeWin && isDone ? 'text-brand-green' : 'text-white'}`}>
            {match.away.name}
          </p>
          {isDone && !homeWin && (
            <p className="text-brand-green font-bold mt-2">🏆 CAMPEÃO</p>
          )}
        </div>
      </div>
    </div>
  )
}
