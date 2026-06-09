/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Tema "blood red" — dark, cinematográfico, flat.
          // 'green' é mantido como alias do acento (= vermelho) para
          // compatibilidade com as classes brand-green já espalhadas.
          green:    '#8B0000',  // acento principal (vermelho sangue)
          red:      '#8B0000',  // alias explícito
          redHover: '#C0001A',  // hover do acento
          dark:     '#0A0A0A',  // fundo base
          card:     '#141414',  // superfície (cards)
          accent:   '#1E1E1E',  // superfície 2 (hover, aninhados)
          border:   '#2A2A2A',  // borda padrão
          muted:    '#888888',  // texto secundário
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        // Sem glow — superfícies flat. Sombras apenas para leve profundidade.
        'glow-green': 'none',
        'glow-sm':    'none',
        'card':       '0 2px 8px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-in':  'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'scale-in':   'scaleIn 0.3s ease-out',
        'shake':      'shake 0.5s ease-in-out',
        'confetti':   'confetti 2s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceIn:  {
          '0%':   { opacity: 0, transform: 'scale(0.3)' },
          '50%':  { opacity: 1, transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to:   { opacity: 1, transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        confetti: {
          '0%':   { opacity: 1, transform: 'translateY(0) rotate(0)' },
          '100%': { opacity: 0, transform: 'translateY(100px) rotate(360deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.7 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
