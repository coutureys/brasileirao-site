/**
 * 🌓 THEME CONTEXT — Gerenciar modo claro/escuro
 */
import { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)

  // Carregar preferência salva
  useEffect(() => {
    const saved = localStorage.getItem('scoutfut-theme')
    if (saved) {
      setIsDark(saved === 'dark')
    } else {
      // Detectar preferência do sistema
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  // Salvar e aplicar mudança
  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev
      localStorage.setItem('scoutfut-theme', newValue ? 'dark' : 'light')
      applyTheme(newValue)
      return newValue
    })
  }

  const applyTheme = (dark) => {
    const html = document.documentElement
    if (dark) {
      html.classList.remove('light')
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
    }
  }

  // Aplicar tema na montagem
  useEffect(() => {
    applyTheme(isDark)
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
