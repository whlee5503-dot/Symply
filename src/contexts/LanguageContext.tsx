import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { en } from '../i18n/en'
import { es } from '../i18n/es'
import { ko } from '../i18n/ko'

export type Language = 'en' | 'es' | 'ko'
const STORAGE_KEY = 'symply-language'

const TRANSLATIONS = { en, es, ko }

// KR 모드: 한국어/영어만 허용
const KR_MODE = import.meta.env.VITE_LOCALE_MODE === 'kr'
export const AVAILABLE_LANGS: Language[] = KR_MODE ? ['ko', 'en'] : ['en', 'es', 'ko']

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof en
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function detectLanguage(): Language {
  // 1) 저장된 설정 우선
  const saved = localStorage.getItem(STORAGE_KEY) as Language | null
  if (saved && AVAILABLE_LANGS.includes(saved)) return saved
  // 2) 브라우저 언어 자동 감지
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('ko')) return 'ko'
  if (!KR_MODE && browserLang.startsWith('es')) return 'es'
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage)

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const t = TRANSLATIONS[language]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
