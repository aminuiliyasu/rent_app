'use client'

import AvailableDaysPicker from '@/components/AvailableDaysPicker'
import { useLanguage } from '@/contexts/LanguageContext'
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
  const { t } = useLanguage()

  return (
    <div className="card-glass animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <UserIcon className="h-7 w-7 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden />
        {t('listingForm.workerProfile')}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('listingForm.workerProfileHint')}</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              {t('listingForm.displayName')}
            </label>
            <input
              type="text"
              value={values.workerName}
              onChange={(e) => onChange({ workerName: e.target.value })}
              className="input-field"
              placeholder={t('listingForm.displayNamePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              {t('listingForm.profession')} *
            </label>
            <input
              type="text"
              value={values.workerProfession}
              onChange={(e) => onChange({ workerProfession: e.target.value })}
              className="input-field"
              placeholder={t('listingForm.professionPlaceholder')}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            {t('listingForm.serviceArea')}
          </label>
          <input
            type="text"
            value={values.serviceArea}
            onChange={(e) => onChange({ serviceArea: e.target.value })}
            className="input-field"
            placeholder={t('listingForm.serviceAreaPlaceholder')}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('listingForm.serviceAreaHint')}</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            {t('listingForm.aboutService')}
          </label>
          <textarea
            value={values.workerBio}
            onChange={(e) => onChange({ workerBio: e.target.value })}
            className="input-field"
            rows={4}
            placeholder={t('listingForm.aboutServicePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            {t('listingForm.whenAvailable')}
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
