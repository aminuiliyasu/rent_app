'use client'

import {
  DAY_CODES,
  DAY_LABELS,
  PRESET_EVERYDAY,
  PRESET_WEEKDAYS,
  PRESET_WEEKENDS,
  type DayCode,
  parseAvailableDays,
  serializeAvailableDays,
} from '@/lib/availableDays'

type AvailableDaysPickerProps = {
  value: string
  onChange: (value: string) => void
}

const PRESETS = [
  { value: PRESET_EVERYDAY, label: 'Every day' },
  { value: PRESET_WEEKDAYS, label: 'Weekdays' },
  { value: PRESET_WEEKENDS, label: 'Weekends' },
] as const

export default function AvailableDaysPicker({ value, onChange }: AvailableDaysPickerProps) {
  const selected = parseAvailableDays(value)

  const applySelection = (next: Set<DayCode>) => {
    onChange(serializeAvailableDays(next))
  }

  const toggleDay = (day: DayCode) => {
    const next = new Set(selected)
    if (next.has(day)) next.delete(day)
    else next.add(day)
    applySelection(next)
  }

  const applyPreset = (preset: string) => {
    onChange(preset)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => applyPreset(preset.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              value === preset.value
                ? 'bg-primary-800 text-white border-primary-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {DAY_CODES.map((day) => {
          const active = selected.has(day)
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={active}
              className={`min-w-[3rem] px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                active
                  ? 'bg-primary-800 text-white border-primary-800'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
              }`}
            >
              {DAY_LABELS[day]}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Pick quick presets or tap individual days — e.g. Wed only, or Thu and Sat.
      </p>
    </div>
  )
}
