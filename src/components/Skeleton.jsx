export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-5 animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-4 bg-white/10 rounded" />
        <div className="w-24 h-3 bg-white/5 rounded" />
      </div>
      <div className="space-y-3">
        <SkeletonTeamRow />
        <SkeletonTeamRow />
      </div>
    </div>
  )
}

function SkeletonTeamRow() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10" />
        <div className="w-28 h-4 bg-white/10 rounded" />
      </div>
      <div className="w-8 h-8 bg-white/10 rounded-lg" />
    </div>
  )
}

export function SkeletonTableRows({ count = 5 }) {
  return Array.from({ length: count }, (_, i) => (
    <tr key={i} className="border-b border-white/5 animate-pulse">
      <td className="px-4 py-4"><div className="w-8 h-4 bg-white/10 rounded" /></td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10" />
          <div className="w-32 h-4 bg-white/10 rounded" />
        </div>
      </td>
      {[...Array(7)].map((_, j) => (
        <td key={j} className="px-3 py-4 text-center">
          <div className="w-6 h-4 bg-white/10 rounded mx-auto" />
        </td>
      ))}
    </tr>
  ))
}

export function ApiStatusBar({ source, error, league, refetch }) {
  if (source === 'api') return (
    <div className="flex items-center gap-2 text-xs text-brand-green/80">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
      Dados ao vivo · {league}
    </div>
  )

  return (
    <div className="flex items-center gap-2 text-xs text-amber-400/80">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Dados mockados
      {error === 'API_KEY_MISSING' && (
        <span className="text-white/40">— adicione a chave no .env</span>
      )}
      <button
        onClick={refetch}
        className="ml-1 underline underline-offset-2 hover:text-amber-300 transition"
      >
        Tentar novamente
      </button>
    </div>
  )
}
