export const DAY_CODES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const
export type DayCode = (typeof DAY_CODES)[number]

export const PRESET_EVERYDAY = 'EVERYDAY'
export const PRESET_WEEKDAYS = 'WEEKDAYS'
export const PRESET_WEEKENDS = 'WEEKENDS'

const WEEKDAY_CODES: DayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const WEEKEND_CODES: DayCode[] = ['SAT', 'SUN']

export const DAY_LABELS: Record<DayCode, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
}

export const DAY_LABELS_LONG: Record<DayCode, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
}

export function parseAvailableDays(raw: string | null | undefined): Set<DayCode> {
  if (!raw?.trim()) return new Set()

  const value = raw.trim().toUpperCase()
  if (value === PRESET_EVERYDAY) return new Set(DAY_CODES)
  if (value === PRESET_WEEKDAYS) return new Set(WEEKDAY_CODES)
  if (value === PRESET_WEEKENDS) return new Set(WEEKEND_CODES)

  const days = value
    .split(',')
    .map((part) => part.trim())
    .filter((part): part is DayCode => DAY_CODES.includes(part as DayCode))

  return new Set(days)
}

export function serializeAvailableDays(selected: Iterable<DayCode>): string {
  const set = new Set(selected)
  if (set.size === 0) return ''

  const ordered = DAY_CODES.filter((day) => set.has(day))
  if (ordered.length === DAY_CODES.length) return PRESET_EVERYDAY
  if (
    ordered.length === WEEKDAY_CODES.length &&
    WEEKDAY_CODES.every((day) => set.has(day)) &&
    !set.has('SAT') &&
    !set.has('SUN')
  ) {
    return PRESET_WEEKDAYS
  }
  if (ordered.length === WEEKEND_CODES.length && WEEKEND_CODES.every((day) => set.has(day))) {
    return PRESET_WEEKENDS
  }

  return ordered.join(',')
}

export function formatAvailableDaysLabel(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null

  const value = raw.trim().toUpperCase()
  if (value === PRESET_EVERYDAY) return 'Every day'
  if (value === PRESET_WEEKDAYS) return 'Weekdays (Mon–Fri)'
  if (value === PRESET_WEEKENDS) return 'Weekends (Sat–Sun)'

  const labels = DAY_CODES.filter((day) => parseAvailableDays(raw).has(day)).map(
    (day) => DAY_LABELS_LONG[day],
  )
  if (labels.length === 0) return null
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`

  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}
