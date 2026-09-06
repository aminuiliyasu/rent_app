'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SocialLinks from '@/components/SocialLinks'
import { useLanguage } from '@/contexts/LanguageContext'
import { getRenterResourceContent } from '@/lib/i18n/renterResourceContent'
import { getOwnerResourceContent } from '@/lib/i18n/ownerResourceContent'
import type { ResourceIconKey, ResourceTheme } from '@/lib/resourceContentTypes'
import {
  MagnifyingGlassIcon,
  MegaphoneIcon,
  BookOpenIcon,
  PlusIcon,
  Squares2X2Icon,
  CurrencyDollarIcon,
  CameraIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/solid'
import type { ComponentType, SVGProps } from 'react'

const ICONS: Record<ResourceIconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  search: MagnifyingGlassIcon,
  megaphone: MegaphoneIcon,
  book: BookOpenIcon,
  plus: PlusIcon,
  dashboard: Squares2X2Icon,
  shield: ShieldCheckIcon,
  star: StarIcon,
  currency: CurrencyDollarIcon,
  camera: CameraIcon,
  calendar: CalendarDaysIcon,
  chat: ChatBubbleLeftRightIcon,
}

const THEMES: Record<
  ResourceTheme,
  {
    eyebrow: string
    stepGradient: string
    guideIcon: string
    quickStart: { accent: string; iconColor: string }[]
  }
> = {
  renter: {
    eyebrow: 'text-blue-600 dark:text-blue-400',
    stepGradient: 'from-blue-500 to-indigo-600',
    guideIcon: 'text-blue-600 dark:text-blue-400',
    quickStart: [
      {
        accent:
          'border-blue-100 dark:border-blue-800 from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
      },
      {
        accent:
          'border-purple-100 dark:border-purple-800 from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
      },
      {
        accent:
          'border-amber-100 dark:border-amber-800 from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
      },
    ],
  },
  owner: {
    eyebrow: 'text-green-600 dark:text-green-400',
    stepGradient: 'from-green-500 to-emerald-600',
    guideIcon: 'text-green-600 dark:text-green-400',
    quickStart: [
      {
        accent:
          'border-green-100 dark:border-green-800 from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        iconColor: 'text-green-600 dark:text-green-400',
      },
      {
        accent:
          'border-blue-100 dark:border-blue-800 from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
      },
      {
        accent:
          'border-purple-100 dark:border-purple-800 from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
      },
    ],
  },
}

export default function ResourceGuidePage({ theme }: { theme: ResourceTheme }) {
  const { locale, t } = useLanguage()
  const content =
    theme === 'renter' ? getRenterResourceContent(locale) : getOwnerResourceContent(locale)
  const themeStyles = THEMES[theme]

  return (
    <div className="page-shell">
      <Navbar />
      <div className="pt-20 section-container pb-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className={`text-sm font-bold uppercase tracking-wide mb-3 ${themeStyles.eyebrow}`}>
            {content.eyebrow}
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
            <span className="gradient-text">{content.title}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{content.description}</p>
        </div>

        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('resources.quickStart')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.quickStart.map((item, idx) => {
              const Icon = ICONS[item.iconKey]
              const cardTheme = themeStyles.quickStart[idx] ?? themeStyles.quickStart[0]
              return (
                <div
                  key={item.title}
                  className={`card-glass flex flex-col border bg-gradient-to-br ${cardTheme.accent}`}
                >
                  <Icon className={`h-12 w-12 ${cardTheme.iconColor} mb-4`} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 leading-relaxed">
                    {item.description}
                  </p>
                  <Link href={item.href} className="btn-outline inline-flex items-center justify-center gap-2 py-3 font-semibold">
                    {item.cta}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{content.stepsTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{content.stepsSubtitle}</p>
          <div className="space-y-4">
            {content.steps.map((item) => (
              <div key={item.step} className="card-glass flex gap-4 sm:gap-6">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${themeStyles.stepGradient} text-white font-bold text-sm`}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{content.guidesTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{content.guidesSubtitle}</p>
          <div className="space-y-3">
            {content.guides.map((guide) => {
              const Icon = ICONS[guide.iconKey]
              return (
                <details
                  key={guide.id}
                  className="group card-glass overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-start gap-4 p-1 select-none">
                    <Icon className={`h-10 w-10 shrink-0 ${themeStyles.guideIcon} mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-bold text-gray-900 dark:text-white transition-colors ${
                          theme === 'owner'
                            ? 'group-open:text-green-600 dark:group-open:text-green-400'
                            : 'group-open:text-blue-600 dark:group-open:text-blue-400'
                        }`}
                      >
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{guide.summary}</p>
                    </div>
                    <span className="text-gray-400 text-xl leading-none mt-1 group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <ul className="mt-4 ml-14 mr-2 pb-2 space-y-2 border-t border-gray-200/80 dark:border-gray-700/80 pt-4">
                    {guide.points.map((point) => (
                      <li key={point.slice(0, 48)} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        <StarIcon className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )
            })}
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="card-glass flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm">{content.otherPerspective.label}</p>
            <Link href={content.otherPerspective.href} className="btn-outline inline-flex items-center gap-2 px-5 py-2.5 font-semibold shrink-0">
              {content.otherPerspective.cta}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="card-glass text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('resources.needHelp')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('resources.needHelpDesc')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link href="/safety" className="btn-outline inline-flex items-center gap-2 px-6 py-3 font-semibold">
                <ShieldCheckIcon className="h-5 w-5" />
                {t('resources.safetyTrust')}
              </Link>
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2 px-6 py-3 font-semibold">
                <EnvelopeIcon className="h-5 w-5" />
                {t('resources.contactSupport')}
              </Link>
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{t('resources.followRhentify')}</p>
            <SocialLinks variant="light" className="justify-center" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
