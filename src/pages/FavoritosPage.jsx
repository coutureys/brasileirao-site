import { useState, useMemo } from 'react'
import { LEAGUES } from '../leagues'

/**
 * 💜 FAVORITOS — Jogador e Time Favorito
 * Interface limpa tipo Jogadores
 */
export default function FavoritosPage() {
  const [favoritePlayer, setFavoritePlayer] = useState(null)
  const [favoriteTeam, setFavoriteTeam] = useState(null)
  const [playerSearch, setPlayerSearch] = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  const [activeTab, setActiveTab] = useState('player')

  // Mock de jogadores populares
  const popularPlayers = [
    { id: 1, name: 'Neymar', position: 'Atacante', team: 'Al-Hilal', rating: 9.2 },
    { id: 2, name: 'Vinícius Júnior', position: 'Atacante', team: 'Real Madrid', rating: 9.1 },
    { id: 3, name: 'Rodrygo', position: 'Atacante', team: 'Real Madrid', rating: 8.8 },
    { id: 4, name: 'Bruno Guimarães', position: 'Volante', team: 'Newcastle', rating: 8.5 },
    { id: 5, name: 'Richarlison', position: 'Atacante', team: 'Tottenham', rating: 8.2 },
    { id: 6, name: 'Lucas Paquetá', position: 'Meia', team: 'West Ham', rating: 8.0 },
    { id: 7, name: 'Alisson', position: 'Goleiro', team: 'Liverpool', rating: 8.9 },
    { id: 8, name: 'Fred', position: 'Volante', team: 'Manchester United', rating: 7.8 },
  ]

  // Times populares
  const allTeams = [
    { id: 'flamengo', name: 'Flamengo' },
    { id: 'palmeiras', name: 'Palmeiras' },
    { id: 'santos', name: 'Santos' },
    { id: 'saopaulo', name: 'São Paulo' },
    { id: 'corinthians', name: 'Corinthians' },
    { id: 'botafogo', name: 'Botafogo' },
    { id: 'vasco', name: 'Vasco' },
    { id: 'fortaleza', name: 'Fortaleza' },
  ]

  const filteredPlayers = useMemo(() => {
    return popularPlayers.filter(p =>
      p.name.toLowerCase().includes(playerSearch.toLowerCase())
    )
  }, [playerSearch])

  const filteredTeams = useMemo(() => {
    return allTeams.filter(t =>
      t.name.toLowerCase().includes(teamSearch.toLowerCase())
    )
  }, [teamSearch])

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* === HEADER COM FAVORITOS SELECIONADOS === */}
      <div className="bg-gradient-to-b from-brand-accent to-brand-dark border-b border-brand-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-white mb-6">❤️ Meus Favoritos</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Jogador Favorito */}
            <div className="card p-4 border border-brand-border/50">
              <p className="text-xs text-white/50 uppercase font-bold mb-2">Jogador Favorito</p>
              {favoritePlayer ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{favoritePlayer.name}</p>
                    <p className="text-xs text-white/50">{favoritePlayer.position}</p>
                  </div>
                  <button
                    onClick={() => setFavoritePlayer(null)}
                    className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded text-white/60">
                    Trocar
                  </button>
                </div>
              ) : (
                <p className="text-sm text-white/40">Nenhum selecionado</p>
              )}
            </div>

            {/* Time Favorito */}
            <div className="card p-4 border border-brand-border/50">
              <p className="text-xs text-white/50 uppercase font-bold mb-2">Time Favorito</p>
              {favoriteTeam ? (
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{favoriteTeam.name}</p>
                  <button
                    onClick={() => setFavoriteTeam(null)}
                    className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded text-white/60">
                    Trocar
                  </button>
                </div>
              ) : (
                <p className="text-sm text-white/40">Nenhum selecionado</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === TABS DE SELEÇÃO === */}
      <div className="sticky top-[57px] z-20 bg-brand-dark/95 backdrop-blur-sm border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-0">
            <button
              onClick={() => setActiveTab('player')}
              className={`flex-1 px-4 py-4 font-bold text-sm border-b-2 transition-all ${
                activeTab === 'player'
                  ? 'border-brand-green text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}>
              🏆 Jogador
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 px-4 py-4 font-bold text-sm border-b-2 transition-all ${
                activeTab === 'team'
                  ? 'border-brand-green text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}>
              ⚽ Time
            </button>
          </div>
        </div>
      </div>

      {/* === CONTEÚDO === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ABA: JOGADOR */}
        {activeTab === 'player' && (
          <div>
            <input
              type="text"
              placeholder="🔍 Buscar jogador..."
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-brand-border
                        text-white placeholder-white/40 focus:outline-none focus:border-brand-green mb-6"
            />

            {filteredPlayers.length === 0 ? (
              <div className="card p-10 text-center text-white/40">
                Nenhum jogador encontrado
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setFavoritePlayer(player)
                      setActiveTab(null)
                    }}
                    className="card p-4 text-left hover:bg-white/5 transition border border-brand-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">{player.name}</h3>
                      <span className="px-2 py-1 bg-brand-green/20 text-brand-green text-xs font-bold rounded">
                        {player.rating}
                      </span>
                    </div>
                    <p className="text-xs text-white/50">{player.position} • {player.team}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: TIME */}
        {activeTab === 'team' && (
          <div>
            <input
              type="text"
              placeholder="🔍 Buscar time..."
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-brand-border
                        text-white placeholder-white/40 focus:outline-none focus:border-brand-green mb-6"
            />

            {filteredTeams.length === 0 ? (
              <div className="card p-10 text-center text-white/40">
                Nenhum time encontrado
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setFavoriteTeam(team)
                      setActiveTab(null)
                    }}
                    className="w-full card p-4 text-left hover:bg-white/5 transition border border-brand-border/50">
                    <p className="font-bold text-white">{team.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
