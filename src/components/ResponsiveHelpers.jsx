/**
 * 📱 RESPONSIVE HELPERS — Componentes para layout responsivo
 */

/**
 * Container — Max-width responsivo
 */
export function Container({ children, className = '' }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

/**
 * ResponsiveGrid — Grid automático baseado em breakpoints
 */
export function ResponsiveGrid({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = '',
}) {
  const colsClass = `grid-cols-${cols.default} sm:grid-cols-${cols.sm || cols.default} md:grid-cols-${cols.md || cols.sm} lg:grid-cols-${cols.lg || cols.md}`
  const gapClass = `gap-${gap > 4 ? Math.ceil(gap / 4) * 4 : gap}`

  return (
    <div className={`grid ${colsClass} ${gapClass} ${className}`}>
      {children}
    </div>
  )
}

/**
 * MobileOnly — Mostrar apenas em mobile
 */
export function MobileOnly({ children, className = '' }) {
  return <div className={`md:hidden ${className}`}>{children}</div>
}

/**
 * DesktopOnly — Mostrar apenas em desktop
 */
export function DesktopOnly({ children, className = '' }) {
  return <div className={`hidden md:block ${className}`}>{children}</div>
}

/**
 * TabletAndUp — Mostrar em tablet e acima
 */
export function TabletAndUp({ children, className = '' }) {
  return <div className={`hidden sm:block ${className}`}>{children}</div>
}

/**
 * Stack — Layout em coluna com espaçamento responsivo
 */
export function Stack({
  children,
  gap = 4,
  className = '',
}) {
  const gapClass = `gap-${gap > 4 ? Math.ceil(gap / 4) * 4 : gap}`
  return (
    <div className={`flex flex-col ${gapClass} ${className}`}>
      {children}
    </div>
  )
}

/**
 * HStack — Layout em linha com espaçamento responsivo
 */
export function HStack({
  children,
  gap = 2,
  className = '',
  wrap = false,
}) {
  return (
    <div className={`flex ${wrap ? 'flex-wrap' : ''} gap-${gap} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Spacer — Espaço flexível
 */
export function Spacer({ size = 4 }) {
  return <div style={{ height: `${size * 0.25}rem` }} />
}

/**
 * TouchableOpacity — Botão com feedback tátil
 */
export function TouchableOpacity({
  children,
  onClick,
  disabled = false,
  className = '',
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        active:opacity-70 active:scale-95
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}

/**
 * ResponsiveText — Texto que responde a breakpoints
 */
export function ResponsiveText({
  children,
  sizes = { default: 'base', sm: 'base', md: 'lg', lg: 'xl' },
  weight = 'normal',
  color = 'text-white',
  className = '',
}) {
  const sizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  }

  const weightMap = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
  }

  return (
    <span className={`
      ${sizeMap[sizes.default]}
      sm:${sizeMap[sizes.sm || sizes.default]}
      md:${sizeMap[sizes.md || sizes.sm]}
      lg:${sizeMap[sizes.lg || sizes.md]}
      ${weightMap[weight]}
      ${color}
      ${className}
    `}>
      {children}
    </span>
  )
}

/**
 * SafeAreaView — View com safe area padding
 */
export function SafeAreaView({
  children,
  bottom = true,
  top = false,
  className = '',
}) {
  const paddingStyle = {
    ...(top && { paddingTop: 'env(safe-area-inset-top)' }),
    ...(bottom && { paddingBottom: 'env(safe-area-inset-bottom)' }),
  }

  return (
    <div style={paddingStyle} className={className}>
      {children}
    </div>
  )
}

/**
 * AspectRatio — Mantém proporção (16:9, 1:1, etc)
 */
export function AspectRatio({
  ratio = '16/9',
  children,
  className = '',
}) {
  const ratioClass = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-video',
    '16/9': 'aspect-video',
    '21/9': 'aspect-auto',
  }[ratio] || 'aspect-video'

  return (
    <div className={`${ratioClass} overflow-hidden ${className}`}>
      {children}
    </div>
  )
}
