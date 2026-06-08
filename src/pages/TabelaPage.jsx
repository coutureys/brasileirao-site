import Standings from '../components/Standings'
import PhasedTournament from '../components/PhasedTournament'
import CopaElimination from '../components/CopaElimination'

// Competições com múltiplas fases
const PHASED_LEAGUES = ['conmebol.libertadores', 'conmebol.sudamericana', 'uefa.champions']
const ELIMINATION_LEAGUES = ['bra.copa']

export default function TabelaPage({ league, leagueInfo }) {
  const hasPhases = PHASED_LEAGUES.includes(league)
  const isElimination = ELIMINATION_LEAGUES.includes(league)

  return isElimination ? (
    <CopaElimination league={league} leagueInfo={leagueInfo} />
  ) : hasPhases ? (
    <PhasedTournament league={league} leagueInfo={leagueInfo} />
  ) : (
    <Standings league={league} leagueInfo={leagueInfo} />
  )
}
