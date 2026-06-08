/**
 * 🤖 AI RECOMMENDATIONS — Recomendações + Análise Tática + Vídeos
 */
import { useState } from 'react'

export default function AIRecommendations() {
  const [activeTab, setActiveTab] = useState('recommendations')

  // Mock AI data
  const recommendations = [
    {
      id: 1,
      type: 'team',
      title: 'Por que você deveria seguir Flamengo',
      reason: 'Baseado em seus últimos 5 palpites: 80% acurácia em jogos do Flamengo',
      confidence: 92,
      icon: '⚽',
    },
    {
      id: 2,
      type: 'player',
      title: 'Vinícius Júnior está em forma',
      reason: 'Rating 8.5+ nas últimas 3 rodadas • Alto volume de ações',
      confidence: 88,
      icon: '👤',
    },
    {
      id: 3,
      type: 'prediction',
      title: 'Aposte em Mais de 2.5 gols',
      reason: 'Flamengo x Botafogo: Ambos times marcaram em 85% dos confrontos',
      confidence: 79,
      icon: '🎯',
    },
  ]

  const tacticalAnalysis = {
    homeTeam: 'Flamengo',
    awayTeam: 'Botafogo',
    analysis: [
      '🎯 Formação esperada: 4-2-3-1 vs 4-1-4-1',
      '🔄 Estratégia: Flamengo deve explorar as laterais com Vinícius e Rodinei',
      '⚠️ Ponto fraco: Defesa de Botafogo vulnerável a cruzamentos (65% dos gols sofreu)',
      '💪 Força: Flamengo com 75% de posse em casa',
      '📈 Prognóstico: Flamengo vence (72% probabilidade)',
    ],
  }

  const youtubeHighlights = [
    {
      id: 1,
      match: 'Flamengo x Palmeiras',
      duration: '12:34',
      views: '245k',
      thumbnail: '🎬',
    },
    {
      id: 2,
      match: 'Libertadores: Flamengo x River',
      duration: '18:50',
      views: '542k',
      thumbnail: '🎬',
    },
    {
      id: 3,
      match: 'Gols de Vinícius Júnior',
      duration: '08:12',
      views: '1.2M',
      thumbnail: '🎬',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">🤖 IA & Analytics</h2>
          <p className="text-xs text-white/40">Powered by Machine Learning</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'recommendations', label: '💡 Recomendações' },
          { id: 'tactical', label: '⚙️ Análise Tática' },
          { id: 'videos', label: '🎬 Vídeos IA' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all
              ${activeTab === tab.id
                ? 'bg-brand-green text-brand-dark'
                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className="card p-4 hover:bg-white/5 transition cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-1">{rec.title}</p>
                  <p className="text-xs text-white/60 mb-2">{rec.reason}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-green-400">{rec.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4">
            <p className="text-xs text-brand-green/60 mb-2">ℹ️ Como funciona</p>
            <p className="text-xs text-white/60">
              Nossas recomendações são geradas usando algoritmos de machine learning que analisam:
              histórico de palpites, performance de jogadores, estatísticas históricas e padrões de
              mercado.
            </p>
          </div>
        </div>
      )}

      {/* Tactical Analysis */}
      {activeTab === 'tactical' && (
        <div className="space-y-4">
          {/* Match Header */}
          <div className="bg-white/3 border border-white/10 rounded-xl p-6 text-center">
            <p className="text-sm text-white/40 mb-2">PRÓXIMO JOGO</p>
            <h3 className="text-2xl font-black text-white">
              {tacticalAnalysis.homeTeam} × {tacticalAnalysis.awayTeam}
            </h3>
            <p className="text-xs text-white/50 mt-2">Rodada 32 • 15 de junho • 20:00</p>
          </div>

          {/* Analysis Points */}
          <div className="bg-white/3 border border-white/10 rounded-xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white mb-4">📋 Análise Tática</h4>
            {tacticalAnalysis.analysis.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-white/3 rounded-lg border border-white/5"
              >
                <span className="flex-shrink-0">{point.split(':')[0]}</span>
                <p className="text-xs text-white/60">{point.split(':')[1]?.trim()}</p>
              </div>
            ))}
          </div>

          {/* Prediction */}
          <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-6">
            <div className="text-center">
              <p className="text-xs text-brand-green/60 mb-2">PREVISÃO IA</p>
              <p className="text-xl font-black text-white mb-1">
                {tacticalAnalysis.homeTeam} vence
              </p>
              <p className="text-sm text-brand-green font-bold">Confiança: 72%</p>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Highlights */}
      {activeTab === 'videos' && (
        <div className="space-y-3">
          {youtubeHighlights.map(video => (
            <div
              key={video.id}
              className="card p-4 hover:bg-white/5 transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-3xl">
                  {video.thumbnail}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-1">{video.match}</p>
                  <p className="text-xs text-white/50 mb-2">{video.duration} • {video.views} visualizações</p>
                  <button className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition">
                    ▶️ Assistir no YouTube
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-xs text-blue-400">
              🎬 Vídeos de highlights são gerados automaticamente usando IA.
              Detecta gols, assistências, defesas espetaculares e momentos importantes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
