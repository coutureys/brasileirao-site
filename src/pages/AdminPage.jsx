/**
 * ⚙️ ADMIN PAGE — Painel de administração
 */
import { useState } from 'react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock stats
  const stats = {
    totalUsers: 15420,
    activeUsers: 3842,
    totalGames: 1240,
    pendingGames: 12,
    totalPredictions: 245000,
    avgAccuracy: 71.3,
    totalBans: 18,
    reportedContent: 42,
  }

  const recentGames = [
    { id: 1, match: 'Flamengo x Botafogo', date: '2026-06-08', status: 'Finalizado', actions: '✓' },
    { id: 2, match: 'Palmeiras x São Paulo', date: '2026-06-09', status: 'Ao Vivo', actions: '🔄' },
    { id: 3, match: 'Grêmio x Internacional', date: '2026-06-10', status: 'Agendado', actions: '✏️' },
  ]

  const recentUsers = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', joined: '2025-01-15', status: 'Ativo' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', joined: '2025-02-20', status: 'Banido' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', joined: '2025-03-10', status: 'Ativo' },
  ]

  return (
    <div className="min-h-screen bg-brand-dark pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">⚙️ Admin Panel</h1>
          <p className="text-sm text-white/40">Gerenciar games, usuários, analytics e logs</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 border-b border-white/10 mb-8 pb-4 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📈' },
            { id: 'games', label: '⚽ Jogos', icon: '🎮' },
            { id: 'users', label: '👥 Usuários', icon: '👤' },
            { id: 'analytics', label: '📉 Analytics', icon: '📊' },
            { id: 'moderation', label: '🛡️ Moderação', icon: '⚖️' },
            { id: 'settings', label: '⚙️ Configurações', icon: '⚙️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex-shrink-0 transition-all
                ${activeTab === tab.id
                  ? 'bg-brand-green text-brand-dark'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Usuários Totais', value: stats.totalUsers.toLocaleString() },
                { label: 'Usuários Ativos', value: stats.activeUsers.toLocaleString() },
                { label: 'Jogos Totais', value: stats.totalGames.toLocaleString() },
                { label: 'Jogos Pendentes', value: stats.pendingGames, color: 'red' },
                { label: 'Palpites Totais', value: (stats.totalPredictions / 1000).toFixed(0) + 'k' },
                { label: 'Acurácia Média', value: stats.avgAccuracy + '%', color: 'green' },
                { label: 'Banimentos', value: stats.totalBans, color: 'orange' },
                { label: 'Conteúdo Reportado', value: stats.reportedContent, color: 'red' },
              ].map((stat, i) => (
                <div key={i} className={`bg-white/3 border ${
                  stat.color === 'red' ? 'border-red-500/30' :
                  stat.color === 'green' ? 'border-green-500/30' :
                  stat.color === 'orange' ? 'border-orange-500/30' :
                  'border-white/10'
                } rounded-xl p-4`}>
                  <p className="text-xs text-white/40 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-black ${
                    stat.color === 'red' ? 'text-red-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'orange' ? 'text-orange-400' :
                    'text-white'
                  }`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Games */}
            <div className="bg-white/3 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">⚽ Últimos Jogos</h3>
              <div className="space-y-2">
                {recentGames.map(game => (
                  <div key={game.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-white">{game.match}</p>
                      <p className="text-xs text-white/40">{game.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        {game.status}
                      </span>
                      <button className="text-lg hover:scale-110 transition">{game.actions}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white/3 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">👥 Últimos Usuários</h3>
              <div className="space-y-2">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-xs text-white/40">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        user.status === 'Banido' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {user.status}
                      </span>
                      <button className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition">
                        ✏️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Games Management */}
        {activeTab === 'games' && (
          <div className="bg-white/3 border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">Gerenciar Jogos</h3>
              <button className="px-4 py-2 bg-brand-green text-brand-dark font-bold rounded hover:bg-green-400 transition">
                ➕ Novo Jogo
              </button>
            </div>
            <p className="text-sm text-white/60">Criar, editar e deletar jogos • Validar resultados</p>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white/3 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Gerenciar Usuários</h3>
            <p className="text-sm text-white/60">Banir, promover moderador, ver histórico de atividades</p>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="bg-white/3 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">📊 Analytics</h3>
            <p className="text-sm text-white/60">Gráficos de usuários, predictions, engagement</p>
          </div>
        )}

        {/* Moderation */}
        {activeTab === 'moderation' && (
          <div className="bg-white/3 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">🛡️ Moderação</h3>
            <p className="text-sm text-white/60">Revisar conteúdo reportado, comentários suspeitos</p>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white/3 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">⚙️ Configurações</h3>
            <p className="text-sm text-white/60">Manutenção do site, backup, logs de sistema</p>
          </div>
        )}
      </div>
    </div>
  )
}
