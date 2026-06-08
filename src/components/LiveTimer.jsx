/**
 * LiveTimer — Cronômetro ao vivo sincronizado com servidor
 *
 * - Atualiza a cada segundo localmente
 * - Sincroniza com dado do servidor quando API retorna novo valor
 * - Mostra MM:SS, acréscimos (45+3), intervalo, finalizado
 */
import { useState, useEffect, useRef } from 'react'

/* ── Parser do displayClock da ESPN ─────────────────────────────────────────
   ESPN pode retornar: "45:00", "45'", "45+3'", "90:00", "0:00", ou null
──────────────────────────────────────────────────────────────────────────── */
function parseClock(raw) {
  if (!raw) return { minutes: 0, seconds: 0, extra: 0 }

  const str = String(raw).trim()

  // Formato "45+3" ou "45+3'"
  const extraMatch = str.match(/^(\d+)\+(\d+)/)
  if (extraMatch) return {
    minutes: parseInt(extraMatch[1]),
    seconds: 0,
    extra:   parseInt(extraMatch[2]),
  }

  // Formato "MM:SS"
  const colonMatch = str.match(/^(\d+):(\d+)/)
  if (colonMatch) return {
    minutes: parseInt(colonMatch[1]),
    seconds: parseInt(colonMatch[2]),
    extra:   0,
  }

  // Só número "45" ou "45'"
  const numMatch = str.match(/^(\d+)/)
  if (numMatch) return { minutes: parseInt(numMatch[1]), seconds: 0, extra: 0 }

  return { minutes: 0, seconds: 0, extra: 0 }
}

/* ── Formata exibição ────────────────────────────────────────────────────── */
function format(minutes, seconds, extra) {
  const mm = String(Math.min(minutes, extra > 0 ? minutes : 90)).padStart(2, '0')
  const ss = String(Math.min(seconds, 59)).padStart(2, '0')
  const base = `${mm}:${ss}`
  return extra > 0 ? `${minutes}+${extra}' ${mm}:${ss}` : base
}

/* ── Hook do cronômetro ──────────────────────────────────────────────────── */
export function useLiveTimer({ minute, serverTs, isHalfTime, status }) {
  const parsed    = parseClock(minute)
  const baseMinRef = useRef(parsed.minutes)
  const baseSecRef = useRef(parsed.seconds)
  const baseExRef  = useRef(parsed.extra)
  const startTsRef = useRef(serverTs ?? Date.now())

  const [display, setDisplay] = useState({
    minutes: parsed.minutes,
    seconds: parsed.seconds,
    extra:   parsed.extra,
  })

  // Quando o server manda novo valor, sincroniza
  useEffect(() => {
    const p = parseClock(minute)
    baseMinRef.current  = p.minutes
    baseSecRef.current  = p.seconds
    baseExRef.current   = p.extra
    startTsRef.current  = serverTs ?? Date.now()
    setDisplay({ minutes: p.minutes, seconds: p.seconds, extra: p.extra })
  }, [minute, serverTs])

  // Tick a cada segundo — só se estiver ao vivo e não for intervalo
  useEffect(() => {
    if (status !== 'LIVE' || isHalfTime) return

    const id = setInterval(() => {
      // Quantos segundos se passaram desde a última sincronização
      const elapsed = Math.floor((Date.now() - startTsRef.current) / 1000)
      const total   = baseMinRef.current * 60 + baseSecRef.current + elapsed

      const minutes = Math.floor(total / 60)
      const seconds = total % 60
      const extra   = baseExRef.current > 0
        ? baseExRef.current
        : minutes > 45 && minutes < 90 ? 0   // 1º tempo sem acréscimo explícito
        : minutes > 90 ? minutes - 90  : 0   // 2º tempo sem acréscimo explícito

      setDisplay({ minutes: Math.min(minutes, 120), seconds, extra })
    }, 1000)

    return () => clearInterval(id)
  }, [status, isHalfTime, minute, serverTs])

  return display
}

/* ── Componente visual ──────────────────────────────────────────────────── */
export default function LiveTimer({ minute, serverTs, isHalfTime, status, size = 'md' }) {
  const { minutes, seconds, extra } = useLiveTimer({ minute, serverTs, isHalfTime, status })

  const isLive     = status === 'LIVE'
  const isFt       = status === 'FT'

  // Tamanhos
  const sizes = {
    sm: { text: 'text-xs',  badge: 'px-1.5 py-0.5 text-[9px]'  },
    md: { text: 'text-sm',  badge: 'px-2 py-0.5 text-[10px]'   },
    lg: { text: 'text-base',badge: 'px-2.5 py-1 text-xs'       },
  }
  const s = sizes[size] ?? sizes.md

  if (isFt) return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`font-black text-white/30 uppercase tracking-wider ${s.badge}`}>Final</span>
      <span className={`font-extrabold text-white/40 tabular-nums ${s.text}`}>FT</span>
    </div>
  )

  if (isHalfTime) return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`font-black bg-amber-400/15 text-amber-400 border border-amber-400/20
                        rounded-full uppercase tracking-wider ${s.badge}`}>
        Intervalo
      </span>
      <span className={`font-extrabold text-amber-400/70 tabular-nums ${s.text}`}>45:00</span>
    </div>
  )

  if (!isLive) return null

  // Tempo adicional
  const showExtra = extra > 0 || (minutes >= 45 && minutes < 50) || (minutes >= 90)
  const displayExtra = extra > 0 ? extra : minutes > 90 ? minutes - 90 : minutes - 45

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Badge AO VIVO */}
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        <span className={`font-black text-red-400 uppercase tracking-wider ${s.badge}`}>
          Ao Vivo
        </span>
      </div>

      {/* Clock */}
      <div className={`relative font-extrabold tabular-nums text-white animate-pulse-slow ${s.text}`}>
        {showExtra && extra > 0 ? (
          <span>
            <span className="text-white/60">{minutes}+</span>
            <span className="text-amber-400">{extra}'</span>
            {' '}
            <span className="text-white/40 text-[0.75em]">
              {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
            </span>
          </span>
        ) : (
          <span className="text-white">
            {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
          </span>
        )}
      </div>

      {/* Período */}
      <span className={`text-white/25 ${s.badge}`}>
        {minutes <= 45 ? '1º Tempo' : minutes <= 90 ? '2º Tempo' : 'Prorr.'}
      </span>
    </div>
  )
}
