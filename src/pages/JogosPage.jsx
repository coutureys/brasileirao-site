import LiveScores  from '../components/LiveScores'
import NextMatches from '../components/NextMatches'

export default function JogosPage({ league, leagueInfo }) {
  return (
    <>
      <LiveScores  league={league} leagueInfo={leagueInfo} />
      <NextMatches league={league} leagueInfo={leagueInfo} />
    </>
  )
}
