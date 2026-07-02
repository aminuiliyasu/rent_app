'use client'

import { QueryClient, QueryClientProvider } from 'react-query'
import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CurrencyPresentationProvider } from '@/contexts/CurrencyPresentationContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CurrencyPresentationProvider>
          <ThemeProvider>
            <AuthProvider>
              <NotificationsProvider>
                {children}
              </NotificationsProvider>
            </AuthProvider>
          </ThemeProvider>
        </CurrencyPresentationProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}
