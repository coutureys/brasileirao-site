import { useNavigate } from 'react-router-dom'
import { LEAGUES } from '../leagues'
import RecentResults from '../components/RecentResults'
import { AnimatedCard, AnimatedButton, StaggerContainer } from '../components/AnimatedCard'
import { useSEO } from '../hooks/useSEO'
import { websiteSchema } from '../utils/seo'

export default function HomePage({ league, leagueInfo }) {
  const navigate = useNavigate()

  useSEO({
    title: 'ScoutFut — Análise Profissional de Futebol',
    description: 'Siga seu time com dados profissionais. Scores ao vivo, tabelas, estatísticas e análises.',
    url: 'https://brasileirao-site.vercel.app/',
    type: 'website',
    schema: websiteSchema,
  })

  const quickLinks = [
    { to: '/jogos', name: 'Jogos', emoji: '⚽', color: '#10b981', desc: 'Resultados e jogos ao vivo' },
    { to: '/tabela', name: 'Tabela', emoji: '📊', color: '#3b82f6', desc: 'Classificação da Série A' },
    { to: '/jogadores', name: 'Artilheiros', emoji: '🥇', color: '#f59e0b', desc: 'Gols e estatísticas' },
    { to: '/noticias', name: 'Notícias', emoji: '📰', color: '#8b5cf6', desc: 'Últimas do Brasileirão' },
  ]

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-brand-dark">
      {/* === HERO SECTION === */}
      <div className="relative bg-gradient-to-br from-brand-accent via-brand-dark to-brand-dark overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-green rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 inline-block px-4 py-2 bg-brand-green/10 border border-brand-green/30 rounded-full">
            <span className="text-xs font-bold text-brand-green uppercase">⚡ Ao Vivo Agora</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight">
            ⚽ Scout<span className="text-brand-green">Fut</span>
          </h1>

          <p className="text-xl sm:text-2xl text-white/70 mb-4 max-w-2xl mx-auto">
            Siga seu time com dados profissionais
          </p>
          <p className="text-base text-white/50 mb-10 max-w-2xl mx-auto">
            Análise em tempo real, estatísticas completas e acompanhamento de jogadores
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="primary"
              onClick={() => navigate('/jogos')}
              className="animate-fade-in">
              ⚽ Ver Jogos Agora
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              onClick={() => navigate('/competicoes')}
              className="animate-fade-in"
              style={{ animationDelay: '100ms' }}>
              📋 Todas as Competições
            </AnimatedButton>
          </div>

          {/* Stats com animações */}
          <div className="grid grid-cols-3 gap-4 mt-14 max-w-md mx-auto">
            {[
              { value: 'Série A', label: 'Brasileirão', delay: 0 },
              { value: 'Ao Vivo', label: 'Tempo real', delay: 1 },
              { value: 'Grátis', label: 'Sem cadastro', delay: 2 },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center animate-bounce-in"
                style={{ animationDelay: `${stat.delay * 100}ms` }}>
                <p className="text-2xl font-black text-brand-green">{stat.value}</p>
                <p className="text-xs text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === CONTEÚDO === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* === DESTAQUES === */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-black text-white">🔥 Acesso Rápido</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((lg, idx) => (
              <AnimatedCard
                key={lg.to}
                animation="slide-up"
                delay={idx}
                onClick={() => navigate(lg.to)}
                className="group relative overflow-hidden rounded-2xl p-6"
                style={{
                  background: `linear-gradient(135deg, ${lg.color}20, ${lg.color}10)`,
                  border: `2px solid ${lg.color}30`,
                }}>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ background: `radial-gradient(circle at center, ${lg.color}20, transparent)` }} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{lg.emoji}</div>
                  <h3 className="text-lg font-black text-white mb-1 text-left">{lg.name}</h3>
                  <p className="text-sm text-white/50 text-left flex-1">{lg.desc}</p>
                  <p className="text-xs text-white/40 mt-4">→ Explorar</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* === ÚLTIMOS RESULTADOS === */}
        <section>
          <RecentResults />
        </section>

        {/* === STATS DASHBOARD === */}
        <section className="bg-gradient-to-br from-brand-accent/50 to-brand-dark border border-brand-border rounded-2xl p-8 sm:p-12 animate-slide-up">
          <h2 className="text-2xl font-black text-white mb-8">📊 Seus Dados Pessoais</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '⭐', label: 'Favoritos', value: '0', color: 'from-yellow-500/20 to-yellow-500/5', delay: 0 },
              { icon: '👥', label: 'Times Seguindo', value: '0', color: 'from-blue-500/20 to-blue-500/5', delay: 1 },
              { icon: '⚽', label: 'Alertas Ativados', value: '0', color: 'from-green-500/20 to-green-500/5', delay: 2 },
              { icon: '📈', label: 'Análises Salvas', value: '0', color: 'from-purple-500/20 to-purple-500/5', delay: 3 },
            ].map((stat, i) => (
              <AnimatedCard
                key={i}
                animation="scale-in"
                delay={stat.delay}
                className={`bg-gradient-to-br ${stat.color} border border-white/5 rounded-xl p-4`}>
                <p className="text-3xl mb-2">{stat.icon}</p>
                <p className="text-sm text-white/50 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* === CTA FINAL === */}
        <section className="bg-gradient-to-r from-brand-green/15 via-brand-green/10 to-brand-green/5
                          border border-brand-green/30 rounded-2xl p-8 sm:p-12 text-center animate-fade-in">
          <p className="text-xs font-bold text-brand-green uppercase mb-3 tracking-wider">✨ Premium</p>
          <h3 className="text-3xl font-black text-white mb-4">Comece agora</h3>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Personalize sua experiência, marque favoritos e acompanhe seu time em tempo real
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="primary"
              onClick={() => navigate('/favoritos')}
              className="animate-slide-up">
              ⭐ Adicionar Favoritos
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              onClick={() => navigate('/tabela')}
              className="animate-slide-up"
              style={{ animationDelay: '100ms' }}>
              📊 Ver Tabela
            </AnimatedButton>
          </div>
        </section>

      </div>
    </div>
  )
}
