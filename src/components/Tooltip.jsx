import { useState } from 'react'

/**
 * 🎯 Tooltip — Dica flutuante ao passar mouse
 * Padrão: <Tooltip text="..." children={...} />
 */
export default function Tooltip({ children, text, position = 'top' }) {
  const [show, setShow] = useState(false)

  const posClasses = {
    top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full',
    bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-2',
    left: 'top-1/2 right-full -translate-y-1/2 -translate-x-2',
    right: 'top-1/2 left-full -translate-y-1/2 translate-x-2',
  }

  const arrowClasses = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-brand-accent border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-brand-accent border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-l-brand-accent border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-r-brand-accent border-t-transparent border-b-transparent border-l-transparent',
  }

  return (
    <div className="relative inline-block"
         onMouseEnter={() => setShow(true)}
         onMouseLeave={() => setShow(false)}>
      {children}

      {show && (
        <div className={`absolute z-50 ${posClasses[position]} pointer-events-none`}>
          <div className="relative bg-brand-accent border border-brand-border rounded-xl px-3 py-2 text-xs text-white/80 whitespace-nowrap shadow-xl">
            {text}
            <div className={`absolute w-2 h-2 border-2 ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 🏆 Tooltip de critérios de desempate
 * Mostra os 4 critérios aplicados
 */
export function TiebreakerTooltip({ team, position }) {
  const criteria = [
    { icon: '📊', label: '1º Critério', desc: 'Pontos acumulados', value: `${team.pts}` },
    { icon: '⚽', label: '2º Critério', desc: 'Saldo de gols', value: `${team.sg > 0 ? '+' : ''}${team.sg}` },
    { icon: '🎯', label: '3º Critério', desc: 'Gols marcados', value: `${team.gp}` },
    { icon: '🤝', label: '4º Critério', desc: 'Confronto direto*', value: '—' },
  ]

  const content = (
    <div className="space-y-1">
      {criteria.map((c, i) => (
        <div key={i} className="flex items-start gap-2 text-[11px]">
          <span>{c.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-white">{c.label}</p>
            <p className="text-white/50 text-[10px]">{c.desc}</p>
          </div>
          <span className="font-bold text-brand-green ml-2">{c.value}</span>
        </div>
      ))}
      <p className="text-[10px] text-white/30 pt-1 border-t border-white/10 mt-1">
        * Aplicado apenas em caso de empate nos 3 primeiros critérios
      </p>
    </div>
  )

  return (
    <Tooltip
      text={content}
      position="bottom"
    >
      <span className="inline-block cursor-help">
        {position}º
        <span className="inline-block w-3 h-3 ml-0.5 rounded-full bg-white/10 text-[8px] flex items-center justify-center leading-none">
          <span className="text-white/50">?</span>
        </span>
      </span>
    </Tooltip>
  )
}
