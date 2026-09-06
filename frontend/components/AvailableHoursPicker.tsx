'use client'

import { useEffect, useState } from 'react'
import {
  PRESET_AFTERNOON,
  PRESET_ALL_DAY,
  PRESET_EVENING,
  PRESET_MORNING,
  TIME_SLOTS,
  formatRangeLabel,
  getDisplayRange,
  minutesOf,
  normalizeClock,
  selectedSlotIds,
  serializeAvailableHours,
  slotId,
  toTimeInputValue,
  toggleTimeSlot,
} from '@/lib/availableHours'
import { useLanguage } from '@/contexts/LanguageContext'

type AvailableHoursPickerProps = {
  value: string
  onChange: (value: string) => void
}

export default function AvailableHoursPicker({ value, onChange }: AvailableHoursPickerProps) {
  const { t } = useLanguage()
  const selected = selectedSlotIds(value)
  const displayRange = getDisplayRange(value)
  const [customFrom, setCustomFrom] = useState(toTimeInputValue(displayRange?.start))
  const [customTo, setCustomTo] = useState(toTimeInputValue(displayRange?.end))

  useEffect(() => {
    setCustomFrom(toTimeInputValue(displayRange?.start))
    setCustomTo(toTimeInputValue(displayRange?.end))
  }, [value, displayRange?.start, displayRange?.end])

  const presets = [
    { value: PRESET_MORNING, label: t('listingForm.hoursMorning') },
    { value: PRESET_AFTERNOON, label: t('listingForm.hoursAfternoon') },
    { value: PRESET_EVENING, label: t('listingForm.hoursEvening') },
    { value: PRESET_ALL_DAY, label: t('listingForm.hoursAllDay') },
  ] as const

  const applyCustomRange = (from: string, to: string) => {
    const start = normalizeClock(from)
    const end = normalizeClock(to === '23:59' ? '23:59' : to)
    if (!start || !end) return
    const startMin = minutesOf(start)
    const endMin = minutesOf(end)
    if (startMin == null || endMin == null || startMin >= endMin) return
    onChange(serializeAvailableHours([{ start, end }]))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
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
            {t('listingForm.daysClear')}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {TIME_SLOTS.map((slot) => {
          const active = selected.has(slotId(slot))
          return (
            <button
              key={slotId(slot)}
              type="button"
              onClick={() => onChange(toggleTimeSlot(value, slot))}
              aria-pressed={active}
              className={`min-w-[3.5rem] px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                active
                  ? 'bg-primary-800 text-white border-primary-800'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
              }`}
            >
              {formatRangeLabel(slot)}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[7.5rem]">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {t('listingForm.hoursFrom')}
          </label>
          <input
            type="time"
            value={customFrom}
            onChange={(e) => {
              const nextFrom = e.target.value
              setCustomFrom(nextFrom)
              applyCustomRange(nextFrom, customTo)
            }}
            className="input-field py-2 text-sm"
          />
        </div>
        <div className="min-w-[7.5rem]">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {t('listingForm.hoursTo')}
          </label>
          <input
            type="time"
            value={customTo}
            onChange={(e) => {
              const nextTo = e.target.value
              setCustomTo(nextTo)
              applyCustomRange(customFrom, nextTo)
            }}
            className="input-field py-2 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">{t('listingForm.hoursHint')}</p>
    </div>
  )
}
