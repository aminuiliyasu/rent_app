'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import {
  type Locale,
  type TranslationKey,
  translate,
  LOCALE_STORAGE_KEY,
} from '@/lib/i18n/translations'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (saved === 'en' || saved === 'hu') return saved
  const browser = navigator.language.toLowerCase()
  if (browser.startsWith('hu')) return 'hu'
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLocaleState(detectInitialLocale())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale, mounted])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string>) => translate(locale, key, vars),
    [locale],
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: TranslationKey, vars?: Record<string, string>) => translate('en', key, vars),
    }
  }
  return context
}
