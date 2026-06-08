/**
 * 🔍 SEARCH BAR AVANÇADA — Busca com autocomplete e filtros
 * 🔐 Com validação de input e URL encoding seguro
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LEAGUES } from '../leagues'
import { SearchQuerySchema } from '../lib/validators'
import { sanitizeText } from '../lib/sanitize'

export default function SearchBar({ className = '' }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  // Dados para busca
  const allTeams = [
    { name: 'Flamengo', league: 'bra.1', type: 'team', id: 'flamengo' },
    { name: 'Palmeiras', league: 'bra.1', type: 'team', id: 'palmeiras' },
    { name: 'São Paulo', league: 'bra.1', type: 'team', id: 'saopaulo' },
    { name: 'Corinthians', league: 'bra.1', type: 'team', id: 'corinthians' },
    { name: 'Botafogo', league: 'bra.1', type: 'team', id: 'botafogo' },
    { name: 'Atletico Mineiro', league: 'bra.1', type: 'team', id: 'atletico' },
    { name: 'Grêmio', league: 'bra.1', type: 'team', id: 'gremio' },
    { name: 'Internacional', league: 'bra.1', type: 'team', id: 'internacional' },
  ]

  const allPlayers = [
    { name: 'Vinícius Júnior', team: 'Flamengo', type: 'player', id: 'vinicius' },
    { name: 'Neymar', team: 'Santos', type: 'player', id: 'neymar' },
    { name: 'Rodrygo', team: 'Palmeiras', type: 'player', id: 'rodrygo' },
  ]

  // Busca com debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      const q = query.toLowerCase()
      const matches = [
        // Competições
        ...LEAGUES.filter(l => l.name.toLowerCase().includes(q))
          .map(l => ({ ...l, type: 'league', isLeague: true })),
        // Times
        ...allTeams.filter(t => t.name.toLowerCase().includes(q))
          .slice(0, 3),
        // Jogadores
        ...allPlayers.filter(p => p.name.toLowerCase().includes(q))
          .slice(0, 3),
      ]

      setResults(matches.slice(0, 8))
      setSelectedIdx(-1)
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Navegação com teclado
  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIdx(prev => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIdx(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIdx >= 0) {
          handleSelect(results[selectedIdx])
        }
        break
      case 'Escape':
        setShowResults(false)
        break
      default:
        break
    }
  }

  const handleSelect = (item) => {
    if (item.type === 'league' || item.isLeague) {
      navigate(`/competition/${encodeURIComponent(item.id)}`)
    } else if (item.type === 'team') {
      navigate(`/competition/${encodeURIComponent(item.league)}`)
    } else if (item.type === 'player') {
      // 🔐 URL encode the search parameter
      const encodedName = encodeURIComponent(sanitizeText(item.name))
      navigate(`/jogadores?search=${encodedName}`)
    }

    setQuery('')
    setShowResults(false)
  }

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getIcon = (item) => {
    if (item.type === 'league' || item.isLeague) return '🏆'
    if (item.type === 'team') return '⚽'
    if (item.type === 'player') return '👤'
    return '🔍'
  }

  const getCategory = (item) => {
    if (item.type === 'league' || item.isLeague) return 'Competições'
    if (item.type === 'team') return 'Times'
    if (item.type === 'player') return 'Jogadores'
    return 'Resultados'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <div className="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar times, jogadores, ligas..."
          value={query}
          onChange={(e) => {
            // 🔐 Validate input with Zod
            const result = SearchQuerySchema.safeParse({ query: e.target.value })
            if (result.success) {
              setQuery(result.data.query)
            }
          }}
          onFocus={() => query && setShowResults(true)}
          onKeyDown={handleKeyDown}
          maxLength={50}
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-brand-border rounded-lg
                     text-white text-sm placeholder-white/30
                     hover:border-brand-green/30 focus:border-brand-green
                     focus:bg-brand-accent transition-all outline-none"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute right-2.5 inset-y-0 flex items-center
                     text-white/40 hover:text-white transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-brand-card border border-brand-border
                     rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
        >
          {results.map((item, idx) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className={`w-full px-4 py-3 text-left transition-all flex items-center gap-3
                ${selectedIdx === idx
                  ? 'bg-brand-green/10 border-l-2 border-brand-green'
                  : 'hover:bg-white/5 border-l-2 border-transparent'}`}
            >
              <span className="text-lg flex-shrink-0">{getIcon(item)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{item.name}</p>
                <p className="text-xs text-white/50">
                  {item.team || item.country || item.league || getCategory(item)}
                </p>
              </div>
              <span className="text-xs text-white/30 flex-shrink-0">
                {getCategory(item)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showResults && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-card border border-brand-border
                        rounded-lg p-4 text-center text-white/60 text-sm z-50">
          Nenhum resultado encontrado para "{query}"
        </div>
      )}

      {/* Help text */}
      {showResults && results.length > 0 && (
        <div className="absolute bottom-1 right-3 text-xs text-white/30 pointer-events-none">
          ↑↓ navegar • ⏎ ir • esc fechar
        </div>
      )}
    </div>
  )
}
