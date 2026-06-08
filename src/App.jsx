import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Header       from './components/Header'
import LeaguePicker from './components/LeaguePicker'
import BottomNav    from './components/BottomNav'
import Footer       from './components/Footer'
import { ThemeProvider } from './context/ThemeContext'

import HomePage         from './pages/HomePage'
import JogosPage        from './pages/JogosPage'
import TabelaPage       from './pages/TabelaPage'
import CompeticoesPage  from './pages/CompeticoesPage'
import JogadoresPage    from './pages/JogadoresPage'
import FavoritosPage    from './pages/FavoritosPage'
import NoticiasPage     from './pages/NoticiasPage'
import AnalyticsPage    from './pages/AnalyticsPage'
import CompetitionPage  from './pages/CompetitionPage'

import { getLeague } from './leagues'
import { PlanProvider } from './context/PlanContext'
import PlanSwitcher from './components/PlanSwitcher'

export default function App() {
  const [league, setLeague] = useState('bra.1')
  const leagueInfo = getLeague(league)

  const pageProps = { league, leagueInfo }

  return (
    <ThemeProvider>
      <PlanProvider>
        <BrowserRouter>
        <div className="min-h-screen flex flex-col">
        <Header />

        {/* League picker — sticky, sempre visível */}
        <div className="sticky top-[57px] z-30 bg-brand-dark/95 backdrop-blur-sm border-b border-brand-border py-3">
          <LeaguePicker selected={league} onChange={setLeague} />
        </div>

        {/* Linha colorida da liga */}
        <div className="h-0.5 w-full"
             style={{ background: `linear-gradient(90deg, transparent, ${leagueInfo.color}50, transparent)` }} />

        <main className="flex-1 pb-20 md:pb-0">
          <Routes>
            <Route path="/"                      element={<HomePage      {...pageProps} />} />
            <Route path="/jogos"                 element={<JogosPage     {...pageProps} />} />
            <Route path="/tabela"                element={<TabelaPage    {...pageProps} />} />
            <Route path="/competicoes"           element={<CompeticoesPage />} />
            <Route path="/jogadores"             element={<JogadoresPage {...pageProps} />} />
            <Route path="/favoritos"             element={<FavoritosPage />} />
            <Route path="/noticias"              element={<NoticiasPage />} />
            <Route path="/analytics"             element={<AnalyticsPage />} />
            <Route path="/competition/:leagueId" element={<CompetitionPage />} />
            <Route path="*"                      element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        <BottomNav />
        <PlanSwitcher />
        </div>
      </BrowserRouter>
      </PlanProvider>
    </ThemeProvider>
  )
}
