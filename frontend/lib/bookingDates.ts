import { ListingType } from '@/lib/types'

/** Parse `YYYY-MM-DD` as local midnight (avoids UTC-only date quirks). */
export function parseYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) throw new Error('Invalid date')
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

/**
 * Build start/end instants for creating a booking from `<input type="date">` values.
 * - Same calendar day + hourly worker → 1 hour window (same-day short hire).
 * - Same calendar day otherwise → one rental day (end = next local midnight).
 * - Different days → inclusive end date in the UI → exclusive end at start of day after `endYmd`.
 */
export function buildBookingDateRange(
  startYmd: string,
  endYmd: string,
  opts: { type: ListingType; priceHour?: number | null }
): { start: Date; end: Date } {
  const start = parseYmdLocal(startYmd)
  const endDay = parseYmdLocal(endYmd)

  if (endDay.getTime() < start.getTime()) {
    throw new Error('End date is before start date')
  }

  const sameCalendarDay = startYmd === endYmd

  if (sameCalendarDay) {
    if (opts.type === ListingType.WORKER && opts.priceHour != null && opts.priceHour > 0) {
      const end = new Date(start)
      end.setHours(end.getHours() + 1)
      return { start, end }
    }
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { start, end }
  }

  const end = new Date(endDay)
  end.setDate(end.getDate() + 1)
  return { start, end }
}
