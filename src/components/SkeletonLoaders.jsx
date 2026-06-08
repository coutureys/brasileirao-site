/**
 * 💀 SKELETON LOADERS — Componentes de carregamento profissionais
 * Melhor UX enquanto dados são carregados
 */

/**
 * Base Skeleton — Elemento base com animação pulse
 */
function BaseSkeleton({ className = '' }) {
  return (
    <div className={`bg-white/5 rounded-lg animate-pulse ${className}`} />
  )
}

/**
 * Card Skeleton — Esqueleto para cards
 */
export function CardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
          <BaseSkeleton className="h-4 w-3/4" />
          <BaseSkeleton className="h-3 w-1/2" />
          <BaseSkeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * Table Skeleton — Esqueleto para tabelas/standings
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <BaseSkeleton key={`header-${i}`} className="h-4 w-full" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <BaseSkeleton key={`row-${rowIdx}-col-${colIdx}`} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Match Card Skeleton — Esqueleto para cards de partidas
 */
export function MatchCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
          {/* Header */}
          <div className="flex justify-between items-center">
            <BaseSkeleton className="h-3 w-20" />
            <BaseSkeleton className="h-3 w-20" />
          </div>

          {/* Teams */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BaseSkeleton className="h-8 w-8 rounded-full" />
              <BaseSkeleton className="h-4 flex-1" />
            </div>
            <div className="flex items-center gap-3">
              <BaseSkeleton className="h-8 w-8 rounded-full" />
              <BaseSkeleton className="h-4 flex-1" />
            </div>
          </div>

          {/* Score */}
          <BaseSkeleton className="h-12 w-full rounded-lg" />

          {/* Footer */}
          <BaseSkeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

/**
 * Player Card Skeleton — Esqueleto para cards de jogadores
 */
export function PlayerCardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-3">
          {/* Avatar */}
          <BaseSkeleton className="h-24 w-full rounded-lg" />

          {/* Name */}
          <BaseSkeleton className="h-3 w-full" />

          {/* Position */}
          <BaseSkeleton className="h-2 w-3/4" />

          {/* Rating */}
          <div className="flex gap-2">
            <BaseSkeleton className="h-6 w-10 rounded-lg" />
            <BaseSkeleton className="h-6 flex-1" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Competition Hub Skeleton — Esqueleto para página de competição
 */
export function CompetitionSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-white/3 border border-white/5 rounded-xl p-6 space-y-4">
        <div className="flex gap-4 items-center">
          <BaseSkeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <BaseSkeleton className="h-4 w-1/3" />
            <BaseSkeleton className="h-8 w-1/2" />
          </div>
        </div>
        <BaseSkeleton className="h-1 w-full" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <BaseSkeleton key={i} className="h-8 w-20" />
        ))}
      </div>

      {/* Content */}
      <TableSkeleton rows={8} cols={5} />
    </div>
  )
}

/**
 * News Feed Skeleton — Esqueleto para feed de notícias
 */
export function NewsFeedSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
          {/* Thumbnail */}
          <BaseSkeleton className="h-40 w-full rounded-lg" />

          {/* Title */}
          <BaseSkeleton className="h-4 w-3/4" />

          {/* Description */}
          <div className="space-y-2">
            <BaseSkeleton className="h-3 w-full" />
            <BaseSkeleton className="h-3 w-2/3" />
          </div>

          {/* Footer */}
          <div className="flex justify-between">
            <BaseSkeleton className="h-3 w-20" />
            <BaseSkeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Analytics Chart Skeleton — Esqueleto para gráficos
 */
export function AnalyticsChartSkeleton() {
  return (
    <div className="bg-white/3 border border-white/5 rounded-xl p-6 space-y-4">
      {/* Title */}
      <BaseSkeleton className="h-4 w-1/3" />

      {/* Chart area */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <BaseSkeleton className="h-2 flex-1" />
            <BaseSkeleton className="h-2 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Modal Skeleton — Esqueleto para modal de detalhes
 */
export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative bg-white/3 border border-white/5 rounded-3xl w-full max-w-2xl p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <BaseSkeleton className="h-4 w-1/4" />
          <BaseSkeleton className="h-8 w-1/2" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/5 pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <BaseSkeleton key={i} className="h-6 w-16" />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BaseSkeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * List Item Skeleton — Item de lista genérico
 */
export function ListItemSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/5">
          <div className="flex items-center gap-3 flex-1">
            <BaseSkeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <BaseSkeleton className="h-3 w-3/4" />
              <BaseSkeleton className="h-2 w-1/2" />
            </div>
          </div>
          <BaseSkeleton className="h-4 w-12 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

/**
 * Full Page Skeleton — Carregamento completo de página
 */
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-brand-dark space-y-8 p-4">
      {/* Header Hero */}
      <div className="h-80 bg-white/3 rounded-xl" />

      {/* Content sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <BaseSkeleton className="h-6 w-1/4" />
          <CardSkeleton count={3} />
        </div>
      ))}
    </div>
  )
}

/**
 * Shimmer Effect — Efeito mais sofisticado com gradiente
 */
export function ShimmerSkeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-shimmer" />
    </div>
  )
}
