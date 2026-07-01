'use client'

import AvailableDaysPicker from '@/components/AvailableDaysPicker'
import { UserIcon } from '@heroicons/react/24/outline'

export type WorkerListingFields = {
  workerName: string
  workerProfession: string
  workerBio: string
  serviceArea: string
  availableDays: string
}

type WorkerListingSectionProps = {
  values: WorkerListingFields
  onChange: (patch: Partial<WorkerListingFields>) => void
}

export default function WorkerListingSection({ values, onChange }: WorkerListingSectionProps) {
  return (
    <div className="card-glass animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <UserIcon className="h-7 w-7 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden />
        Your service profile
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Tell renters who you are, where you work, and when you&apos;re available.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Display name
            </label>
            <input
              type="text"
              value={values.workerName}
              onChange={(e) => onChange({ workerName: e.target.value })}
              className="input-field"
              placeholder="Your name or business name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Profession *
            </label>
            <input
              type="text"
              value={values.workerProfession}
              onChange={(e) => onChange({ workerProfession: e.target.value })}
              className="input-field"
              placeholder="e.g., Photographer, cleaner, tutor"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Service area
          </label>
          <input
            type="text"
            value={values.serviceArea}
            onChange={(e) => onChange({ serviceArea: e.target.value })}
            className="input-field"
            placeholder="e.g., Budapest V–IX, or city-wide"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Districts or neighbourhoods where you usually take jobs.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            About your service
          </label>
          <textarea
            value={values.workerBio}
            onChange={(e) => onChange({ workerBio: e.target.value })}
            className="input-field"
            rows={4}
            placeholder="Skills, experience, languages, and what makes your service a good fit..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            When you&apos;re available
          </label>
          <AvailableDaysPicker
            value={values.availableDays}
            onChange={(availableDays) => onChange({ availableDays })}
          />
        </div>
      </div>
    </div>
  )
}
