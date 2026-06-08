/**
 * 🌓 THEME TOGGLE — Botão para alternar modo claro/escuro
 */
import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useContext(ThemeContext)

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-lg bg-white/5 border border-white/10
                 hover:bg-white/10 hover:border-white/20
                 transition-all duration-200 group"
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {isDark ? (
        <svg className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform"
             fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 18C8.67 18 6 15.33 6 12s2.67-6 6-6 6 2.67 6 6-2.67 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 6.464 5.636 7.878 3.515 5.757zM16.95 17.536l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z"/>
        </svg>
      ) : (
        <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform"
             fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}
