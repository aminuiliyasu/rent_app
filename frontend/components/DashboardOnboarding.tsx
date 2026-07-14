'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MegaphoneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ONBOARDING_DISMISSED_KEY } from '@/lib/site'
import { useLanguage } from '@/contexts/LanguageContext'

interface DashboardOnboardingProps {
  showWelcome?: boolean
  hasListings: boolean
  hasBookings: boolean
}

export default function DashboardOnboarding({
  showWelcome = false,
  hasListings,
  hasBookings,
}: DashboardOnboardingProps) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1'
    const isNewUser = showWelcome || (!hasListings && !hasBookings)
    setVisible(isNewUser && !dismissed)
  }, [showWelcome, hasListings, hasBookings])

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="card-glass mb-10 animate-slide-up border-2 border-blue-200/60 dark:border-blue-800/60">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {showWelcome ? t('onboarding.welcome') : t('onboarding.getStarted')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('onboarding.intro')}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={t('common.dismiss')}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/search?location=Budapest"
          onClick={dismiss}
          className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all group"
        >
          <MagnifyingGlassIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('onboarding.browseTitle')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('onboarding.browseDesc')}
          </p>
        </Link>

        <Link
          href="/listings/new"
          onClick={dismiss}
          className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800 hover:shadow-lg transition-all group"
        >
          <PlusIcon className="h-8 w-8 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('onboarding.listTitle')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('onboarding.listDesc')}
          </p>
        </Link>

        <Link
          href="/feed"
          onClick={dismiss}
          className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800 hover:shadow-lg transition-all group"
        >
          <MegaphoneIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('onboarding.requestTitle')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('onboarding.requestDesc')}
          </p>
        </Link>
      </div>
    </div>
  )
}
