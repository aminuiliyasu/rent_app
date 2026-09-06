import type { Locale, TranslationKey } from '@/lib/i18n/translations'
import { translate } from '@/lib/i18n/translations'

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

export function formatAvailableDaysLabel(
  raw: string | null | undefined,
  locale: Locale = 'hu',
): string | null {
  if (!raw?.trim()) return null

  const value = raw.trim().toUpperCase()
  if (value === PRESET_EVERYDAY) return translate(locale, 'daysLabel.everyDay')
  if (value === PRESET_WEEKDAYS) return translate(locale, 'daysLabel.weekdays')
  if (value === PRESET_WEEKENDS) return translate(locale, 'daysLabel.weekends')

  const dayKey: Record<DayCode, TranslationKey> = {
    MON: 'daysLabel.monday',
    TUE: 'daysLabel.tuesday',
    WED: 'daysLabel.wednesday',
    THU: 'daysLabel.thursday',
    FRI: 'daysLabel.friday',
    SAT: 'daysLabel.saturday',
    SUN: 'daysLabel.sunday',
  }

  const labels = DAY_CODES.filter((day) => parseAvailableDays(raw).has(day)).map((day) =>
    translate(locale, dayKey[day]),
  )
  if (labels.length === 0) return null
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) {
    return `${labels[0]} ${translate(locale, 'daysLabel.and')} ${labels[1]}`
  }

  return `${labels.slice(0, -1).join(', ')}, ${translate(locale, 'daysLabel.and')} ${labels[labels.length - 1]}`
}

const DAY_SHORT_KEYS: Record<DayCode, TranslationKey> = {
  MON: 'daysLabel.monShort',
  TUE: 'daysLabel.tueShort',
  WED: 'daysLabel.wedShort',
  THU: 'daysLabel.thuShort',
  FRI: 'daysLabel.friShort',
  SAT: 'daysLabel.satShort',
  SUN: 'daysLabel.sunShort',
}

export function formatDayChipLabel(day: DayCode, locale: Locale = 'hu'): string {
  return translate(locale, DAY_SHORT_KEYS[day])
}
