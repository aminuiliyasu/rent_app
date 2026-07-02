'use client'

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import type { Locale } from '@/lib/i18n/translations'
import { LOCALE_LABELS } from '@/lib/i18n/translations'

type LocaleThemeControlsProps = {
  compact?: boolean
  className?: string
}

export default function LocaleThemeControls({
  compact = false,
  className = '',
}: LocaleThemeControlsProps) {
  const { locale, setLocale, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const options: Locale[] = ['en', 'hu']

  const btnSize = compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 p-0.5 ${className}`}
    >
      <div role="group" aria-label={t('nav.language')} className="inline-flex items-center">
        {options.map((code) => {
          const active = locale === code
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-lg font-bold transition-all ${btnSize} ${
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

      <span
        className="mx-0.5 h-5 w-px shrink-0 bg-gray-200 dark:bg-gray-600"
        aria-hidden
      />

      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center justify-center rounded-lg font-bold transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 ${btnSize}`}
        aria-label={t('nav.toggleTheme')}
      >
        {theme === 'dark' ? (
          <SunIcon className={iconSize} aria-hidden />
        ) : (
          <MoonIcon className={iconSize} aria-hidden />
        )}
      </button>
    </div>
  )
}
