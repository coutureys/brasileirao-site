/**
 * 🌍 USE I18N — Hook para gerenciar tradução
 */
import { useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

export function useI18n() {
  const [lang, setLang] = useState('pt-BR')

  // Carregar idioma salvo
  useEffect(() => {
    const saved = localStorage.getItem('scoutfut-language')
    if (saved) {
      setLang(saved)
    } else {
      // Detectar idioma do navegador
      const browserLang = navigator.language || navigator.userLanguage
      if (browserLang.startsWith('en')) {
        setLang('en')
      } else if (browserLang.startsWith('es')) {
        setLang('es')
      }
    }
  }, [])

  const changeLang = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang)
      localStorage.setItem('scoutfut-language', newLang)
    }
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[lang] || translations['pt-BR']

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return { lang, changeLang, t }
}
