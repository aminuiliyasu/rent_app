'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import type { Locale } from '@/lib/i18n/translations'
import { LOCALE_LABELS } from '@/lib/i18n/translations'

type LanguageSwitcherProps = {
  compact?: boolean
  className?: string
}

export default function LanguageSwitcher({ compact = false, className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage()

  const options: Locale[] = ['en', 'hu']

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 p-0.5 ${className}`}
      role="group"
      aria-label={t('nav.language')}
    >
      {options.map((code) => {
        const active = locale === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`rounded-lg font-bold transition-all ${
              compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
            } ${
              active
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            aria-pressed={active}
          >
            {LOCALE_LABELS[code]}
          </button>
        )
      })}
    </div>
  )
}
