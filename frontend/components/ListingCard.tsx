'use client'

import Link from 'next/link'
import { Listing, ListingType } from '@/lib/types'
import { formatListingCardPrice, stripLegacyPricingAppendix } from '@/lib/listingCurrency'
import { firstListingImageUrl } from '@/lib/listingImageUrl'
import { formatListingLocationLine } from '@/lib/listingLocation'
import { formatAvailabilitySummary, formatAvailableHoursLabel } from '@/lib/availableHours'
import { DAY_CODES, formatDayChipLabel, parseAvailableDays } from '@/lib/availableDays'
import { useCurrencyPresentation } from '@/contexts/CurrencyPresentationContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { StarIcon, CubeIcon } from '@heroicons/react/24/solid'
import {
  StarIcon as StarOutlineIcon,
  MapPinIcon,
  SparklesIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

interface ListingCardProps {
  listing: Listing
}

function workerDisplayName(listing: Listing): string {
  return listing.workerName?.trim() || listing.ownerName?.trim() || listing.title
}

function workerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function WorkerListingCard({ listing }: ListingCardProps) {
  const { presentation } = useCurrencyPresentation()
  const { locale, t } = useLanguage()
  const portraitSrc = firstListingImageUrl(listing)
  const cardPrice = formatListingCardPrice(listing, presentation, { preferHourly: true })
  const locationLine = listing.serviceArea?.trim() || formatListingLocationLine(listing)
  const hoursLabel = formatAvailableHoursLabel(listing.availableHours, locale)
  const selectedDays = parseAvailableDays(listing.availableDays)
  const hasSchedule = selectedDays.size > 0 || Boolean(hoursLabel)
  const name = workerDisplayName(listing)
  const profession = listing.workerProfession?.trim()
  const skillTitle = listing.title?.trim()
  const showSkillTitle = Boolean(skillTitle && skillTitle.toLowerCase() !== name.toLowerCase() && skillTitle.toLowerCase() !== profession?.toLowerCase())
  const bio = listing.workerBio?.trim() || ''

  return (
    <Link href={`/listings/${listing.id}`} className="worker-listing-card group">
      <div className="flex h-11 items-center justify-between gap-2 px-4 sm:px-5 bg-[#2a241c] dark:bg-[#0d0b09] border-b border-accent/30">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-light">
          {t('listings.serviceEyebrow')}
        </span>
        {listing.isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-950">
            <SparklesIcon className="h-3 w-3" />
            {t('listings.featured')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-0 pt-4 sm:px-5">
        <div className="flex gap-3.5 sm:gap-4">
          <div className="relative h-[8.5rem] w-[6.5rem] sm:h-[9.75rem] sm:w-[7.25rem] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-accent/70 to-[#3a3228] shadow-[0_10px_24px_rgba(28,22,16,0.22)] ring-1 ring-black/10 dark:ring-white/10">
            {portraitSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- reliable preview via `/uploads` rewrite
              <img
                src={portraitSrc}
                alt=""
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-serif text-2xl font-semibold text-stone-50">
                {workerInitials(name)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            {profession && (
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a6238] dark:text-accent-light">
                {profession}
              </p>
            )}
            <h3 className="heading-display text-[1.35rem] sm:text-[1.5rem] leading-[1.15] text-[#1c1915] dark:text-stone-50 line-clamp-2">
              {name}
            </h3>
            {showSkillTitle && (
              <p className="mt-1 text-sm font-medium text-stone-600 dark:text-stone-300 line-clamp-2">{skillTitle}</p>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
              {listing.averageRating ? (
                <span className="inline-flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                  <StarIcon className="h-3.5 w-3.5 text-accent" />
                  {listing.averageRating.toFixed(1)}
                  {listing.reviewCount ? (
                    <span className="font-medium text-stone-500 dark:text-stone-400">({listing.reviewCount})</span>
                  ) : null}
                </span>
              ) : null}
              {locationLine && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                  <span className="truncate font-medium">{locationLine}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {bio && (
          <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400 line-clamp-2">{bio}</p>
        )}

        {hasSchedule && (
          <div className="mt-4 rounded-xl border border-stone-300/80 dark:border-stone-600 bg-white/70 dark:bg-black/30 px-3 py-2.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5c4a2e] dark:text-accent-light">
              <ClockIcon className="h-3.5 w-3.5 text-accent-muted" aria-hidden />
              {t('listings.schedule')}
            </p>
            {selectedDays.size > 0 && (
              <div className="grid grid-cols-7 gap-1">
                {DAY_CODES.map((day) => {
                  const on = selectedDays.has(day)
                  return (
                    <span
                      key={day}
                      className={`inline-flex items-center justify-center rounded-md py-1 text-[10px] font-bold tracking-wide ${
                        on
                          ? 'bg-[#2a241c] text-accent-light'
                          : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {formatDayChipLabel(day, locale)}
                    </span>
                  )
                })}
              </div>
            )}
            {hoursLabel && (
              <p className="mt-2 text-xs font-semibold text-stone-700 dark:text-stone-300">{hoursLabel}</p>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-300/70 dark:border-stone-700/60 py-3.5">
          {cardPrice ? (
            <div className="min-w-0">
              <p className="text-lg font-extrabold tabular-nums leading-none text-stone-900 dark:text-stone-50">
                {cardPrice.formatted}
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                {presentation === 'symbol' && (
                  <span className="mr-1.5 rounded bg-stone-200/90 dark:bg-stone-800 px-1 py-0.5 text-stone-800 dark:text-stone-200">
                    {cardPrice.currencyCode}
                  </span>
                )}
                {cardPrice.periodLabel}
              </p>
            </div>
          ) : (
            <span />
          )}
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#7a6238] dark:text-accent-light">
            {t('listings.viewProfile')}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ItemListingCard({ listing }: ListingCardProps) {
  const { presentation } = useCurrencyPresentation()
  const { locale, t } = useLanguage()
  const cardImageSrc = firstListingImageUrl(listing)
  const cardPrice = formatListingCardPrice(listing, presentation)
  const desc = stripLegacyPricingAppendix(listing.description)
  const locationLine = formatListingLocationLine(listing)
  const availabilityLine = formatAvailabilitySummary(listing.availableDays, listing.availableHours, locale)
  return (
    <Link href={`/listings/${listing.id}`} className="listing-card group">
      {/* Image */}
      <div className="relative h-64 mb-0 overflow-hidden bg-[#ece6db] dark:bg-[#1a1612]">
        {cardImageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- reliable preview via `/uploads` rewrite (avoid optimizer quirks)
          <img
            src={cardImageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <CubeIcon className="h-16 w-16 text-primary-700 dark:text-primary-300" aria-hidden />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80"></div>
        
        {listing.isFeatured && (
          <div className="absolute top-3 right-3 bg-accent text-stone-950 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
            <SparklesIcon className="h-3 w-3" />
            {t('listings.featured')}
          </div>
        )}
        
        {cardPrice && (
          <div className="absolute bottom-3 left-3 max-w-[min(100%,20rem)] bg-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col gap-0.5 items-start min-w-0">
              <span className="text-lg sm:text-2xl font-extrabold text-primary-800 leading-snug break-words text-left w-full">
                {cardPrice.formatted}
              </span>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-600">
                {presentation === 'symbol' && (
                  <>
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-gray-800">
                      {cardPrice.currencyCode}
                    </span>
                    <span className="text-gray-400">·</span>
                  </>
                )}
                <span>{cardPrice.periodLabel}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="heading-display text-xl mb-2 line-clamp-2 text-gray-950 dark:text-white">
          {listing.title}
        </h3>

        {listing.ownerName && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
            {t('listings.listedBy', { owner: listing.ownerName })}
          </p>
        )}
        
        {desc && (
          <p className="text-gray-600 dark:text-gray-400 text-base line-clamp-2 mb-4">{desc}</p>
        )}

        {availabilityLine && (
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
            {availabilityLine}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          {locationLine ? (
            <div className="flex min-w-0 max-w-[85%] items-start gap-2 text-base text-gray-600 dark:text-gray-400">
              <MapPinIcon className="h-4 w-4 shrink-0 text-accent mt-0.5" aria-hidden />
              <span className="font-medium leading-snug line-clamp-2">{locationLine}</span>
            </div>
          ) : (
            <span className="min-w-0 flex-1" />
          )}
          
          {listing.averageRating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  i < Math.floor(listing.averageRating || 0) ? (
                    <StarIcon key={i} className="h-4 w-4 text-accent fill-current" />
                  ) : (
                    <StarOutlineIcon key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                  )
                ))}
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">{listing.averageRating.toFixed(1)}</span>
              {listing.reviewCount && (
                <span className="text-gray-500 dark:text-gray-400 text-xs">({listing.reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-accent/40 transition-colors duration-300 pointer-events-none"></div>
    </Link>
  )
}

export default function ListingCard({ listing }: ListingCardProps) {
  if (listing.type === ListingType.WORKER) {
    return <WorkerListingCard listing={listing} />
  }
  return <ItemListingCard listing={listing} />
}
