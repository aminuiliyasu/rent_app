'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { CurrencyPresentation } from '@/lib/listingCurrency'

const STORAGE_KEY = 'rentify-currency-presentation'

type Ctx = {
  presentation: CurrencyPresentation
  setPresentation: (p: CurrencyPresentation) => void
}

const CurrencyPresentationContext = createContext<Ctx | null>(null)

export function CurrencyPresentationProvider({ children }: { children: React.ReactNode }) {
  const [presentation, setPresentationState] = useState<CurrencyPresentation>('iso')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === 'symbol' || raw === 'iso') {
        setPresentationState(raw)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setPresentation = useCallback((p: CurrencyPresentation) => {
    setPresentationState(p)
    try {
      localStorage.setItem(STORAGE_KEY, p)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ presentation, setPresentation }),
    [presentation, setPresentation]
  )

  return (
    <CurrencyPresentationContext.Provider value={value}>
      {children}
    </CurrencyPresentationContext.Provider>
  )
}

export function useCurrencyPresentation(): Ctx {
  const ctx = useContext(CurrencyPresentationContext)
  if (!ctx) {
    throw new Error('useCurrencyPresentation must be used within CurrencyPresentationProvider')
  }
  return ctx
}
