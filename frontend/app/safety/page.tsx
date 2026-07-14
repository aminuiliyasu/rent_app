'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  ShieldCheckIcon,
  LockClosedIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  IdentificationIcon,
} from '@heroicons/react/24/solid'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSafetyContent } from '@/lib/i18n/safetyContent'

const FEATURE_ICONS = [ShieldCheckIcon, LockClosedIcon, UserGroupIcon, CheckBadgeIcon]
const DEPOSIT_ICONS = [BanknotesIcon, IdentificationIcon]

export default function SafetyPage() {
  const { locale } = useLanguage()
  const content = getSafetyContent(locale)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container pb-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
            {content.pageTitle} <span className="gradient-text">{content.pageTitleHighlight}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {content.pageSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {content.features.map((feature, idx) => {
            const Icon = FEATURE_ICONS[idx] ?? ShieldCheckIcon
            return (
              <div key={feature.title} className="card-glass">
                <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              {content.depositsTitle}{' '}
              <span className="gradient-text">{content.depositsTitleHighlight}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {content.depositsIntro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {content.depositTypes.map((type, idx) => {
              const Icon = DEPOSIT_ICONS[idx] ?? BanknotesIcon
              return (
                <div key={type.title} className="card-glass border border-blue-100/80 dark:border-blue-900/40">
                  <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{type.title}</h3>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4">{type.summary}</p>
                  <ul className="space-y-3">
                    {type.details.map((detail) => (
                      <li key={detail.slice(0, 48)} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <div className="card-glass bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/80 dark:border-amber-900/40">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{content.tipsTitle}</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
              {content.tips.map((tip) => (
                <li key={tip.slice(0, 48)}>• {tip}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link href="/search?location=Budapest" className="btn-outline px-8 py-4 text-lg">
              {content.ctaBrowse}
            </Link>
            <Link href="/listings/new" className="btn-primary px-8 py-4 text-lg">
              {content.ctaList}
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
