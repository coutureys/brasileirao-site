import { useState, useEffect } from 'react'

const CAT_COLORS = {
  'Resultado':     'bg-green-500/15 text-green-400 border-green-500/20',
  'Transferência': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'Lesão':         'bg-red-500/15 text-red-400 border-red-500/20',
  'Bastidores':    'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'Série A':       'bg-brand-green/15 text-brand-green border-brand-green/20',
  'Brasileirão':   'bg-amber-500/15 text-amber-400 border-amber-500/20',
}

export default function News() {
  const [news,    setNews]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [source,  setSource]  = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/scrape/news', { signal: controller.signal })
      .then(r => r.json())
      .then(d => { setNews(d.news ?? []); setSource(d.source) })
      .catch(e => { if (e.name !== 'AbortError') setError(e.message) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  return (
    <section id="noticias" className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="section-tag">Firecrawl · Tempo real</p>
            <h2 className="section-title mt-1">Notícias</h2>
            {source && (
              <p className="text-white/40 text-xs mt-1 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${source === 'cache' ? 'bg-amber-400' : 'bg-brand-green animate-pulse'}`} />
                {source === 'cache' ? 'Cache (10 min)' : 'Raspado agora via Firecrawl'}
              </p>
            )}
          </div>
          <a href="https://ge.globo.com/futebol/brasileirao-serie-a/" target="_blank" rel="noopener noreferrer"
             className="chip text-xs hover:border-white/20 hover:text-white transition">
            Ver tudo no GE →
          </a>
        </div>

        {loading ? <Skeletons /> : error ? <ErrorState /> : news.length === 0 ? <EmptyState /> : (
          <div className="space-y-2 max-w-2xl">
            {news.map((item, i) => (
              <a
                key={i}
                href={item.url || 'https://ge.globo.com/futebol/brasileirao-serie-a/'}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <CompactCard item={item} />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Card styles ───────────────────────────────────────────────────────── */
function CompactCard({ item }) {
  const catCls = CAT_COLORS[item.category] ?? CAT_COLORS['Brasileirão']
  return (
    <div className="card-interactive group flex gap-3 p-3 sm:p-4 hover:bg-white/5 transition-all duration-200">
      {/* Imagem pequena à esquerda */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-brand-accent">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={e => { e.currentTarget.parentElement.classList.add('no-img') }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">⚽</div>
        )}
      </div>

      {/* Conteúdo à direita */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`chip text-[9px] font-bold border ${catCls}`}>
            {item.category}
          </span>
          <span className="text-[10px] text-white/30">{timeAgo(item.publishedAt)}</span>
        </div>
        <h3 className="text-sm font-bold leading-snug text-white/90 group-hover:text-brand-green transition line-clamp-2">
          {item.title}
        </h3>
        <p className="text-[11px] text-white/40 mt-auto">{item.source}</p>
      </div>
    </div>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
function NoImagePlaceholder({ small }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-accent to-brand-card">
      <span className={small ? 'text-3xl' : 'text-5xl'}>⚽</span>
      <span className="text-white/20 text-xs font-semibold uppercase tracking-wider">ScoutFut</span>
    </div>
  )
}

function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 2)  return 'agora'
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h/24)}d`
}

function Skeletons() {
  return (
    <>
      <div className="card overflow-hidden animate-pulse">
        <div className="sm:flex">
          <div className="sm:w-2/5 h-52 sm:h-64 bg-white/5 flex-shrink-0" />
          <div className="p-6 flex flex-col gap-3 flex-1">
            <div className="w-20 h-5 bg-white/8 rounded-lg" />
            <div className="h-6 bg-white/10 rounded w-full" />
            <div className="h-6 bg-white/10 rounded w-4/5" />
            <div className="h-4 bg-white/5 rounded w-full mt-2" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-36 bg-white/5" />
            <div className="p-4 space-y-2">
              <div className="w-16 h-4 bg-white/8 rounded" />
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function ErrorState() {
  return (
    <div className="card p-12 text-center">
      <p className="text-4xl mb-3">📰</p>
      <p className="text-white/60 font-semibold">Não foi possível carregar as notícias</p>
      <p className="text-white/30 text-sm mt-1">Tente novamente em alguns instantes</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <p className="text-4xl mb-3">📭</p>
      <p className="text-white/60">Nenhuma notícia disponível no momento</p>
    </div>
  )
}
