import { formatAvailableDaysLabel } from '@/lib/availableDays'
import type { Locale } from '@/lib/i18n/translations'
import { translate } from '@/lib/i18n/translations'

export const PRESET_MORNING = 'MORNING'
export const PRESET_AFTERNOON = 'AFTERNOON'
export const PRESET_EVENING = 'EVENING'
export const PRESET_ALL_DAY = 'ALL_DAY'

export type TimeSlotId = `${string}-${string}`

export type TimeRange = {
  start: string
  end: string
}

export const TIME_SLOTS: readonly TimeRange[] = [
  { start: '06:00', end: '09:00' },
  { start: '09:00', end: '12:00' },
  { start: '12:00', end: '15:00' },
  { start: '15:00', end: '18:00' },
  { start: '18:00', end: '21:00' },
  { start: '21:00', end: '24:00' },
] as const

const MORNING_RANGES: TimeRange[] = [
  { start: '06:00', end: '09:00' },
  { start: '09:00', end: '12:00' },
]
const AFTERNOON_RANGES: TimeRange[] = [
  { start: '12:00', end: '15:00' },
  { start: '15:00', end: '18:00' },
]
const EVENING_RANGES: TimeRange[] = [
  { start: '18:00', end: '21:00' },
  { start: '21:00', end: '24:00' },
]
const ALL_DAY_RANGE: TimeRange = { start: '00:00', end: '24:00' }

const RANGE_RE = /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/

export function slotId(range: TimeRange): TimeSlotId {
  return `${range.start}-${range.end}`
}

function padTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function normalizeClock(raw: string): string | null {
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null
  if (hours === 24 && minutes === 0) return '24:00'
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return padTime(hours, minutes)
}

export function minutesOf(clock: string): number | null {
  const normalized = normalizeClock(clock)
  if (!normalized) return null
  if (normalized === '24:00') return 24 * 60
  const [hours, minutes] = normalized.split(':').map(Number)
  return hours * 60 + minutes
}

function parseRangeToken(token: string): TimeRange | null {
  const value = token.trim().toUpperCase().replace(/\s+/g, '')
  const match = value.match(RANGE_RE)
  if (!match) return null
  const start = normalizeClock(`${match[1]}:${match[2]}`)
  const end = normalizeClock(`${match[3]}:${match[4]}`)
  if (!start || !end) return null
  const startMin = minutesOf(start)
  const endMin = minutesOf(end)
  if (startMin == null || endMin == null || startMin >= endMin) return null
  return { start, end }
}

function expandPreset(value: string): TimeRange[] {
  if (value === PRESET_MORNING) return MORNING_RANGES.map((r) => ({ ...r }))
  if (value === PRESET_AFTERNOON) return AFTERNOON_RANGES.map((r) => ({ ...r }))
  if (value === PRESET_EVENING) return EVENING_RANGES.map((r) => ({ ...r }))
  if (value === PRESET_ALL_DAY) return [{ ...ALL_DAY_RANGE }]
  return []
}

function mergeRanges(ranges: TimeRange[]): TimeRange[] {
  const sorted = ranges
    .map((range) => ({ start: range.start, end: range.end, a: minutesOf(range.start), b: minutesOf(range.end) }))
    .filter((range): range is TimeRange & { a: number; b: number } => range.a != null && range.b != null)
    .sort((left, right) => left.a - right.a)

  const merged: TimeRange[] = []
  for (const range of sorted) {
    const last = merged[merged.length - 1]
    if (!last) {
      merged.push({ start: range.start, end: range.end })
      continue
    }
    const lastEnd = minutesOf(last.end) ?? 0
    if (range.a <= lastEnd) {
      if (range.b > lastEnd) last.end = range.end
      continue
    }
    merged.push({ start: range.start, end: range.end })
  }
  return merged
}

function rangesEqual(a: TimeRange[], b: TimeRange[]): boolean {
  if (a.length !== b.length) return false
  return a.every((range, index) => range.start === b[index].start && range.end === b[index].end)
}

export function parseAvailableHours(raw: string | null | undefined): TimeRange[] {
  if (!raw?.trim()) return []

  const value = raw.trim().toUpperCase()
  const preset = expandPreset(value)
  if (preset.length) return preset

  const ranges = value
    .split(',')
    .map(parseRangeToken)
    .filter((range): range is TimeRange => range != null)

  return mergeRanges(ranges)
}

export function serializeAvailableHours(ranges: Iterable<TimeRange>): string {
  const merged = mergeRanges(Array.from(ranges))
  if (merged.length === 0) return ''

  if (rangesEqual(merged, [ALL_DAY_RANGE])) return PRESET_ALL_DAY
  if (rangesEqual(merged, MORNING_RANGES)) return PRESET_MORNING
  if (rangesEqual(merged, AFTERNOON_RANGES)) return PRESET_AFTERNOON
  if (rangesEqual(merged, EVENING_RANGES)) return PRESET_EVENING
  if (rangesEqual(merged, TIME_SLOTS as TimeRange[])) return PRESET_ALL_DAY

  return merged.map((range) => `${range.start}-${range.end}`).join(',')
}

export function selectedSlotIds(raw: string | null | undefined): Set<TimeSlotId> {
  const ranges = parseAvailableHours(raw)
  const selected = new Set<TimeSlotId>()
  for (const slot of TIME_SLOTS) {
    const slotStart = minutesOf(slot.start)
    const slotEnd = minutesOf(slot.end)
    if (slotStart == null || slotEnd == null) continue
    const covered = ranges.some((range) => {
      const start = minutesOf(range.start)
      const end = minutesOf(range.end)
      return start != null && end != null && start <= slotStart && end >= slotEnd
    })
    if (covered) selected.add(slotId(slot))
  }
  return selected
}

export function toggleTimeSlot(raw: string | null | undefined, slot: TimeRange): string {
  const next = new Set(selectedSlotIds(raw))
  const id = slotId(slot)
  if (next.has(id)) next.delete(id)
  else next.add(id)

  const ranges = TIME_SLOTS.filter((item) => next.has(slotId(item)))
  return serializeAvailableHours(ranges)
}

export function getDisplayRange(raw: string | null | undefined): TimeRange | null {
  const ranges = parseAvailableHours(raw)
  if (ranges.length === 0) return null
  if (ranges.length === 1) return ranges[0]
  return {
    start: ranges[0].start,
    end: ranges[ranges.length - 1].end,
  }
}

export function toTimeInputValue(clock: string | null | undefined): string {
  if (!clock) return ''
  if (clock === '24:00') return '23:59'
  return normalizeClock(clock) ?? ''
}

export function formatClockLabel(clock: string): string {
  const normalized = clock === '24:00' ? '24:00' : normalizeClock(clock)
  if (!normalized) return clock
  if (normalized === '24:00') return '24'
  const [hours, minutes] = normalized.split(':')
  const hour = String(Number(hours))
  return minutes === '00' ? hour : `${hour}:${minutes}`
}

export function formatRangeLabel(range: TimeRange): string {
  return `${formatClockLabel(range.start)}–${formatClockLabel(range.end)}`
}

export function formatAvailableHoursLabel(
  raw: string | null | undefined,
  locale: Locale = 'hu',
): string | null {
  if (!raw?.trim()) return null

  const value = raw.trim().toUpperCase()
  if (value === PRESET_ALL_DAY) return translate(locale, 'hoursLabel.allDay')
  if (value === PRESET_MORNING) return translate(locale, 'hoursLabel.morning')
  if (value === PRESET_AFTERNOON) return translate(locale, 'hoursLabel.afternoon')
  if (value === PRESET_EVENING) return translate(locale, 'hoursLabel.evening')

  const ranges = parseAvailableHours(raw)
  if (ranges.length === 0) return null
  if (rangesEqual(ranges, [ALL_DAY_RANGE]) || rangesEqual(ranges, TIME_SLOTS as TimeRange[])) {
    return translate(locale, 'hoursLabel.allDay')
  }
  if (rangesEqual(ranges, MORNING_RANGES)) return translate(locale, 'hoursLabel.morning')
  if (rangesEqual(ranges, AFTERNOON_RANGES)) return translate(locale, 'hoursLabel.afternoon')
  if (rangesEqual(ranges, EVENING_RANGES)) return translate(locale, 'hoursLabel.evening')

  const labels = ranges.map(formatRangeLabel)
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) {
    return `${labels[0]} ${translate(locale, 'daysLabel.and')} ${labels[1]}`
  }
  return `${labels.slice(0, -1).join(', ')}, ${translate(locale, 'daysLabel.and')} ${labels[labels.length - 1]}`
}

export function formatAvailabilitySummary(
  daysRaw: string | null | undefined,
  hoursRaw: string | null | undefined,
  locale: Locale = 'hu',
): string | null {
  const parts = [formatAvailableDaysLabel(daysRaw, locale), formatAvailableHoursLabel(hoursRaw, locale)].filter(
    (part): part is string => Boolean(part),
  )
  return parts.length ? parts.join(' · ') : null
}
