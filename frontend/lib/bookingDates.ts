import { ListingType } from '@/lib/types'
import { getDisplayRange, minutesOf, toTimeInputValue } from '@/lib/availableHours'

/** Parse `YYYY-MM-DD` as local midnight (avoids UTC-only date quirks). */
export function parseYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) throw new Error('Invalid date')
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatYmdLocal(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function clockFromMinutes(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59))
  return `${pad2(Math.floor(clamped / 60))}:${pad2(clamped % 60)}`
}

export function parseClockParts(clock: string): { hours: number; minutes: number } | null {
  const normalized = toTimeInputValue(clock)
  if (!normalized) return null
  const [hours, minutes] = normalized.split(':').map(Number)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null
  return { hours, minutes }
}

export function combineLocalDateTime(ymd: string, clock: string): Date {
  const day = parseYmdLocal(ymd)
  const parts = parseClockParts(clock)
  if (!parts) throw new Error('Invalid time')
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), parts.hours, parts.minutes, 0, 0)
}

export function defaultBookingTimes(availableHours?: string | null): { start: string; end: string } {
  const range = getDisplayRange(availableHours)
  const rawStart = range?.start && range.start !== '00:00' ? toTimeInputValue(range.start) : '09:00'
  const start = rawStart || '09:00'
  const startMin = minutesOf(start) ?? 9 * 60
  const rangeEndMin = range?.end ? minutesOf(range.end) : null
  const preferredEnd = startMin + 60
  const endMin =
    rangeEndMin != null && rangeEndMin > startMin ? Math.min(preferredEnd, rangeEndMin) : preferredEnd
  if (endMin > 23 * 60 + 59) {
    return { start, end: '23:59' }
  }
  return { start, end: clockFromMinutes(endMin) }
}

export function nextHourAfter(
  startYmd: string,
  startTime: string,
): { endYmd: string; endTime: string } {
  const start = combineLocalDateTime(startYmd, startTime)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  return { endYmd: formatYmdLocal(end), endTime: `${pad2(end.getHours())}:${pad2(end.getMinutes())}` }
}

export type BookingRangeOpts = {
  type: ListingType
  priceHour?: number | null
  startTime?: string | null
  endTime?: string | null
}

/**
 * Build start/end instants for creating a booking.
 * When start/end times are provided, those clocks are used (hourly / same-day windows).
 * Otherwise:
 * - Same calendar day + hourly worker → 1 hour window
 * - Same calendar day otherwise → one rental day (end = next local midnight)
 * - Different days → inclusive end date in the UI → exclusive end at start of day after `endYmd`
 */
export function buildBookingDateRange(
  startYmd: string,
  endYmd: string,
  opts: BookingRangeOpts,
): { start: Date; end: Date } {
  const startTime = opts.startTime?.trim() || ''
  const endTime = opts.endTime?.trim() || ''

  if (startTime && endTime) {
    const start = combineLocalDateTime(startYmd, startTime)
    const end = combineLocalDateTime(endYmd, endTime)
    if (end.getTime() <= start.getTime()) {
      throw new Error('End date is before start date')
    }
    return { start, end }
  }

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

export function billableHoursBetween(start: Date, end: Date): number {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)))
}

export function usesHourlyEstimate(
  opts: { type: ListingType; priceHour?: number | null },
  start: Date,
  end: Date,
): boolean {
  if (opts.priceHour == null || opts.priceHour <= 0) return false
  if (opts.type === ListingType.WORKER) return true
  const hours = billableHoursBetween(start, end)
  return hours < 24
}

export function estimateBookingRental(
  opts: { type: ListingType; priceHour?: number | null; priceDay?: number | null },
  start: Date,
  end: Date,
): { amount: number; hours: number; days: number; hourly: boolean } {
  const ms = end.getTime() - start.getTime()
  const hours = billableHoursBetween(start, end)
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)))
  const hourly = usesHourlyEstimate(opts, start, end)
  if (hourly && opts.priceHour) {
    return { amount: hours * opts.priceHour, hours, days, hourly: true }
  }
  return { amount: (opts.priceDay || 0) * days, hours, days, hourly: false }
}
