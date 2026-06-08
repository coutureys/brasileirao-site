/**
 * 🎬 ANIMATED CARD — Card com animações suaves Framer Motion-style
 * Usado em: Competições, Jogos, Jogadores
 */
export function AnimatedCard({
  children,
  animation = 'fade-in',
  delay = 0,
  hover = true,
  onClick,
  className = ''
}) {
  const animationClass = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'slide-down': 'animate-slide-down',
    'bounce-in': 'animate-bounce-in',
    'scale-in': 'animate-scale-in',
  }[animation]

  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${delay * 50}ms` }}
      className={`
        ${animationClass}
        ${hover ? 'hover:scale-105 hover:shadow-lg' : ''}
        transition-all duration-300 cursor-pointer
        ${className}
      `}
    >
      {children}
    </div>
  )
}

/**
 * 🎯 ANIMATED BUTTON — Botão com animações de interação
 */
export function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
}) {
  const variants = {
    primary: 'bg-brand-green text-brand-dark hover:bg-green-400',
    secondary: 'bg-white/10 border border-white/20 text-white hover:bg-white/20',
    danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-bold rounded-xl
        active:scale-95 hover:shadow-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
    >
      {children}
    </button>
  )
}

/**
 * ✨ GLOW PULSE — Elemento com pulsação de glow (ao vivo)
 */
export function GlowPulse({ children, className = '' }) {
  return (
    <div className={`animate-glow-pulse ${className}`}>
      {children}
    </div>
  )
}

/**
 * 🎪 CONFETTI POP — Elemento que "explode" como confete
 */
export function ConfettiPop({ show = true, children }) {
  if (!show) return children

  return (
    <div className="animate-confetti">
      {children}
    </div>
  )
}

/**
 * 🎈 FLOAT ANIMATION — Elemento que flutua suavemente
 */
export function FloatingElement({ children, className = '' }) {
  return (
    <div className={`animate-float ${className}`}>
      {children}
    </div>
  )
}

/**
 * 💫 SHAKE ANIMATION — Elemento que sacode (erro/atenção)
 */
export function ShakeAnimation({ trigger = false, children }) {
  return (
    <div className={trigger ? 'animate-shake' : ''}>
      {children}
    </div>
  )
}

/**
 * 📊 STAGGER CHILDREN — Container que anima filhos em sequência
 */
export function StaggerContainer({ children, stagger = 50 }) {
  return (
    <div className="space-y-4">
      {Array.isArray(children) ? children.map((child, idx) => (
        <div key={idx} style={{ animationDelay: `${idx * stagger}ms` }} className="animate-fade-in">
          {child}
        </div>
      )) : (
        <div className="animate-fade-in">{children}</div>
      )}
    </div>
  )
}
