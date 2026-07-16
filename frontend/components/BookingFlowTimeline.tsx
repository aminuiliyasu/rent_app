'use client'

import { Fragment } from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'
import { friendlyBookingStatus } from '@/lib/bookingUi'
import { useLanguage } from '@/contexts/LanguageContext'

type Props = {
  status: string
  activeStep: number
}

export default function BookingFlowTimeline({ status, activeStep }: Props) {
  const { locale, t } = useLanguage()

  const steps = [
    { key: 'request', label: t('bookingTimeline.stepRequest'), desc: t('bookingTimeline.stepRequestDesc') },
    { key: 'booked', label: t('bookingTimeline.stepBooked'), desc: t('bookingTimeline.stepBookedDesc') },
    { key: 'active', label: t('bookingTimeline.stepActive'), desc: t('bookingTimeline.stepActiveDesc') },
    { key: 'wrap', label: t('bookingTimeline.stepWrap'), desc: t('bookingTimeline.stepWrapDesc') },
  ] as const

  if (activeStep < 0) {
    return (
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/60 dark:bg-gray-900/40 px-4 py-3 text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {status === 'CANCELLED'
            ? t('bookingTimeline.cancelled')
            : status === 'DISPUTED'
              ? t('bookingTimeline.disputed')
              : t('bookingTimeline.status', { status: friendlyBookingStatus(status, locale) })}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex min-w-[300px] items-start justify-between gap-1 sm:min-w-0 sm:gap-2">
        {steps.map((step, i) => {
          const done = i < activeStep
          const current = i === activeStep

          return (
            <Fragment key={step.key}>
              <div className="flex min-w-[4rem] flex-1 flex-col items-center sm:min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    done
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                      : current
                        ? 'border-blue-500 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/15'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  {done ? <CheckIcon className="h-5 w-5" /> : i + 1}
                </div>
                <span
                  className={`mt-2 text-center text-[10px] font-semibold uppercase tracking-wide sm:text-xs ${
                    current ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="mt-0.5 hidden text-center text-[10px] leading-tight text-gray-500 sm:block">{step.desc}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mt-[18px] h-1 min-w-[8px] flex-1 rounded-full ${
                    i < activeStep ? 'bg-emerald-400/90' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  aria-hidden
                />
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
