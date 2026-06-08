import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import SearchBar from './SearchBar'

const navItems = [
  { label: 'Início',      to: '/',           icon: '🏠' },
  { label: 'Jogos',       to: '/jogos',      icon: '⚽' },
  { label: 'Tabela',      to: '/tabela',     icon: '📊' },
  { label: 'Jogadores',   to: '/jogadores',  icon: '👥' },
  { label: 'Notícias',    to: '/noticias',   icon: '📰' },
  { label: 'Analytics',   to: '/analytics',  icon: '📈' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-brand-dark/95 backdrop-blur-xl border-b border-brand-border shadow-[0_1px_20px_rgba(0,0,0,0.4)]'
          : 'bg-transparent border-b border-transparent'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-brand-green/10 border border-brand-green/20
                            flex items-center justify-center text-lg
                            group-hover:bg-brand-green/20 transition">
              ⚽
            </div>
            <span className="font-black text-base sm:text-lg tracking-tight">
              Scout<span className="text-brand-green">Fut</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'text-brand-green bg-brand-green/10 font-bold'
                    : 'text-white/50 hover:text-white hover:bg-white/5'}`
                }
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.icon}</span>
              </NavLink>
            ))}
          </nav>

          {/* Direita */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Busca avançada */}
            <div className="hidden md:block w-64">
              <SearchBar />
            </div>

            {/* Notificações */}
            <button className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg
                             bg-white/5 hover:bg-white/10 transition relative group"
                    title="Notificações">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Settings */}
            <button className="flex items-center justify-center w-9 h-9 rounded-lg
                             bg-white/5 hover:bg-white/10 transition"
                    title="Configurações">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
