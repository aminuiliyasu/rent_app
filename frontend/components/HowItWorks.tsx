'use client'

import Link from 'next/link'
import {
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlusCircleIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { LAUNCH_REGION_LABEL } from '@/lib/site'
import { useLanguage } from '@/contexts/LanguageContext'

type Step = {
  number: string
  title: string
  description: string
  Icon: typeof MagnifyingGlassIcon
}

function StepGrid({ steps, compact = false }: { steps: Step[]; compact?: boolean }) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${compact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
      {steps.map((step, idx) => (
        <div key={step.number} className="relative animate-slide-up" style={{ animationDelay: `${idx * 0.06}s` }}>
          <div
            className={`h-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/40 p-6 text-center transition-shadow duration-300 hover:shadow-md dark:hover:border-stone-700 ${compact ? 'p-5' : ''}`}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-900/5 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mb-4">
              <step.Icon className="h-7 w-7 text-primary-800 dark:text-accent-light" aria-hidden />
            </div>
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-800 text-white text-sm font-bold mb-3">
              {step.number}
            </div>
            <h3
              className={`font-serif font-semibold text-gray-900 dark:text-stone-100 mb-2 ${compact ? 'text-lg' : 'text-xl'}`}
            >
              {step.title}
            </h3>
            <p className={`text-gray-600 dark:text-stone-400 leading-relaxed ${compact ? 'text-sm' : 'text-base'}`}>
              {step.description}
            </p>
          </div>
          {idx < steps.length - 1 && (
            <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
              <ArrowRightIcon className="h-5 w-5 text-stone-400 dark:text-stone-600" aria-hidden />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function HowItWorks() {
  const { t } = useLanguage()

  const renterSteps: Step[] = [
    {
      number: '1',
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Desc'),
      Icon: MagnifyingGlassIcon,
    },
    {
      number: '2',
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Desc'),
      Icon: ChatBubbleLeftRightIcon,
    },
    {
      number: '3',
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Desc'),
      Icon: MapPinIcon,
    },
    {
      number: '4',
      title: t('howItWorks.step4Title'),
      description: t('howItWorks.step4Desc'),
      Icon: StarIcon,
    },
  ]

  const ownerSteps: Step[] = [
    {
      number: '1',
      title: t('howItWorks.owner1Title'),
      description: t('howItWorks.owner1Desc'),
      Icon: PlusCircleIcon,
    },
    {
      number: '2',
      title: t('howItWorks.owner2Title'),
      description: t('howItWorks.owner2Desc'),
      Icon: ChatBubbleLeftRightIcon,
    },
    {
      number: '3',
      title: t('howItWorks.owner3Title'),
      description: t('howItWorks.owner3Desc'),
      Icon: UserGroupIcon,
    },
    {
      number: '4',
      title: t('howItWorks.owner4Title'),
      description: t('howItWorks.owner4Desc'),
      Icon: StarIcon,
    },
  ]

  return (
    <section className="section-container bg-stone-50 dark:bg-slate-950 border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl mb-4 text-gray-950 dark:text-stone-100">
            {t('howItWorks.titlePrefix')}{' '}
            <span className="gradient-text italic">{t('howItWorks.titleHighlight')}</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            {t('howItWorks.subtitle', { region: LAUNCH_REGION_LABEL })}
          </p>
          <p className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full border border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-900/50 text-sm font-medium text-gray-700 dark:text-stone-300">
            {t('howItWorks.feeNote')}
          </p>
        </div>

        <div className="mb-14">
          <p className="text-eyebrow text-stone-500 dark:text-stone-500 mb-5 text-center md:text-left">
            {t('howItWorks.forRenters')}
          </p>
          <StepGrid steps={renterSteps} />
        </div>

        <div className="mb-12 pt-10 border-t border-stone-200 dark:border-stone-800">
          <p className="text-eyebrow text-stone-500 dark:text-stone-500 mb-5 text-center md:text-left">
            {t('howItWorks.forOwners')}
          </p>
          <StepGrid steps={ownerSteps} compact />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link href="/search" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            {t('howItWorks.browseCta')}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/listings/new"
            className="btn-outline inline-flex items-center gap-2 px-6 py-3 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            {t('howItWorks.listCta')}
          </Link>
          <Link
            href="/safety"
            className="text-sm font-semibold text-primary-800 dark:text-accent-light hover:underline px-2 py-3"
          >
            {t('howItWorks.safetyLink')}
          </Link>
        </div>
      </div>
    </section>
  )
}
