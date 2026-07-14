/** Human-readable copy for booking + review UI */

import type { BookingReviewSummary } from '@/lib/types'
import type { Locale } from '@/lib/i18n/translations'
import { translate } from '@/lib/i18n/translations'

export function normalizeReviewSummary(raw: unknown): BookingReviewSummary | undefined {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const o = raw as Record<string, unknown>
  return {
    canSubmitReview: Boolean(o.canSubmitReview ?? o.can_submit_review),
    awaitingPartnerReview: Boolean(o.awaitingPartnerReview ?? o.awaiting_partner_review),
    bothReviewsVisible: Boolean(o.bothReviewsVisible ?? o.both_reviews_visible),
    myReview: (o.myReview ?? o.my_review) as BookingReviewSummary['myReview'],
    partnerReview: (o.partnerReview ?? o.partner_review) as BookingReviewSummary['partnerReview'],
  }
}

/**
 * Messages inbox: only when we know the trip is complete and mutual reviews are not both published yet.
 * If `reviewSummary` is missing, show nothing (cannot tell).
 */
export function reviewAttentionForInbox(
  status: string,
  rs: BookingReviewSummary | undefined,
): { needsMyReview: boolean; waitingOnPartnerReview: boolean } {
  if (status !== 'COMPLETED' || rs == null || rs.bothReviewsVisible) {
    return { needsMyReview: false, waitingOnPartnerReview: false }
  }
  const needsMyReview = Boolean(rs.canSubmitReview)
  const waitingOnPartnerReview = Boolean(rs.awaitingPartnerReview) && !needsMyReview
  return { needsMyReview, waitingOnPartnerReview }
}

export function friendlyBookingStatus(status: string, locale: Locale = 'en'): string {
  switch (status) {
    case 'PENDING':
      return translate(locale, 'booking.status.pending')
    case 'CONFIRMED':
      return translate(locale, 'booking.status.confirmed')
    case 'IN_PROGRESS':
      return translate(locale, 'booking.status.inProgress')
    case 'COMPLETED':
      return translate(locale, 'booking.status.completed')
    case 'CANCELLED':
      return translate(locale, 'booking.status.cancelled')
    case 'DISPUTED':
      return translate(locale, 'booking.status.disputed')
    default:
      return status
  }
}

export function ratingWords(stars: number, locale: Locale = 'en'): string {
  if (stars <= 1) return translate(locale, 'booking.rating.poor')
  if (stars === 2) return translate(locale, 'booking.rating.fair')
  if (stars === 3) return translate(locale, 'booking.rating.good')
  if (stars === 4) return translate(locale, 'booking.rating.great')
  return translate(locale, 'booking.rating.excellent')
}

export function timelineStepFromStatus(status: string): number {
  switch (status) {
    case 'PENDING':
      return 0
    case 'CONFIRMED':
      return 1
    case 'IN_PROGRESS':
      return 2
    case 'COMPLETED':
      return 3
    default:
      return -1
  }
}

function resolveDisplayEndDate(start: Date, end: Date): Date {
  // Day-based bookings are persisted with an exclusive end at 00:00 next day.
  // Show the user-facing inclusive date by stepping back 1 ms.
  const isExclusiveMidnight =
    end.getHours() === 0 &&
    end.getMinutes() === 0 &&
    end.getSeconds() === 0 &&
    end.getMilliseconds() === 0 &&
    end.getTime() > start.getTime()
  return isExclusiveMidnight ? new Date(end.getTime() - 1) : end
}

export function formatBookingDateRange(
  startIso: string,
  endIso: string,
  dateOptions?: Intl.DateTimeFormatOptions,
): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startIso} - ${endIso}`
  }
  const displayEnd = resolveDisplayEndDate(start, end)
  const baseOpts: Intl.DateTimeFormatOptions = dateOptions ?? {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
  const left = start.toLocaleDateString(undefined, baseOpts)
  const right = displayEnd.toLocaleDateString(undefined, baseOpts)
  return `${left} - ${right}`
}

function titleFromEmbeddedListing(listing: unknown): string | undefined {
  if (listing == null || typeof listing !== 'object') return undefined
  const t = (listing as { title?: unknown }).title
  if (typeof t === 'string' && t.trim()) return t.trim()
  return undefined
}

/** Which listing/item a booking refers to (not the booking id). */
export function bookedListingTitle(
  booking: { listingId: number; listing?: { title?: string | null } | null },
  titleByListingId?: Record<number, string>,
): string {
  const fromApi = booking.listing?.title?.trim() || titleFromEmbeddedListing(booking.listing)
  if (fromApi) return fromApi
  const lid = Number(booking.listingId)
  const hydrated = titleByListingId?.[lid]?.trim()
  if (hydrated) return hydrated
  return `Listing #${booking.listingId}`
}

/**
 * Messages inbox: completed trips that still need *your* review surface first, then “waiting on them”,
 * then active bookings, then other finished threads. Newer start date wins within the same tier.
 */
export function sortBookingsForInbox<
  T extends {
    status: string
    startDate: string
    id: number
    reviewSummary?: BookingReviewSummary
  },
>(bookings: T[]): T[] {
  const tier = (b: T): number => {
    const { needsMyReview, waitingOnPartnerReview } = reviewAttentionForInbox(b.status, b.reviewSummary)
    if (needsMyReview) return 0
    if (waitingOnPartnerReview) return 1
    const done = b.status === 'COMPLETED' || b.status === 'CANCELLED'
    return done ? 3 : 2
  }
  return [...bookings].sort((a, b) => {
    const ta = tier(a)
    const tb = tier(b)
    if (ta !== tb) return ta - tb
    const da = new Date(a.startDate).getTime()
    const db = new Date(b.startDate).getTime()
    if (db !== da) return db - da
    return b.id - a.id
  })
}
