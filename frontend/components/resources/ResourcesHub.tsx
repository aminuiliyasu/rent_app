'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { LAUNCH_REGION_LABEL } from '@/lib/site'
import { MagnifyingGlassIcon, PlusIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

export default function ResourcesHub() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container pb-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
            <span className="gradient-text">{t('resources.hubTitle')}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('resources.hubSubtitle', { region: LAUNCH_REGION_LABEL })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            href="/resources/renters"
            className="card-glass group border border-blue-100 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 hover:scale-[1.02] transition-transform"
          >
            <MagnifyingGlassIcon className="h-14 w-14 text-blue-600 dark:text-blue-400 mb-5" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('resources.renterTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{t('resources.renterDesc')}</p>
            <span className="inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
              {t('resources.renterCta')}
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </Link>

          <Link
            href="/resources/owners"
            className="card-glass group border border-green-100 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 hover:scale-[1.02] transition-transform"
          >
            <PlusIcon className="h-14 w-14 text-green-600 dark:text-green-400 mb-5" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('resources.ownerTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{t('resources.ownerDesc')}</p>
            <span className="inline-flex items-center gap-2 font-semibold text-green-600 dark:text-green-400 group-hover:gap-3 transition-all">
              {t('resources.ownerCta')}
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
