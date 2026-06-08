import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="hidden sm:block border-t border-brand-border mt-16 bg-brand-dark/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Grid principal */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-green/10 border border-brand-green/20
                              flex items-center justify-center text-sm">⚽</div>
              <span className="font-black text-sm">Scout<span className="text-brand-green">Fut</span></span>
            </div>
            <p className="text-xs text-white/40">
              Acompanhe seus times com dados profissionais em tempo real.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white/60 mb-3">Navegação</h4>
            <ul className="space-y-1.5">
              {[
                { label: 'Início', to: '/' },
                { label: 'Jogos', to: '/jogos' },
                { label: 'Competições', to: '/competicoes' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-white/50 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white/60 mb-3">Recursos</h4>
            <ul className="space-y-1.5">
              {[
                { label: 'Analytics', to: '/analytics' },
                { label: 'Favoritos', to: '/favoritos' },
                { label: 'Jogadores', to: '/jogadores' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-white/50 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informações */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white/60 mb-3">Informações</h4>
            <ul className="space-y-1.5 text-xs text-white/50">
              <li>📡 Dados: ESPN API v2</li>
              <li>🌐 Platform: React + Vite</li>
              <li>💾 Database: Neon Postgres</li>
              <li>🚀 Hosting: Vercel</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-6"></div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {year} ScoutFut. Todos os direitos reservados.</p>
          <p>Feito com ❤️ para os fãs de futebol</p>
        </div>
      </div>
    </footer>
  )
}
