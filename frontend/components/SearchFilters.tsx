'use client'

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { ListingType, Category } from '@/lib/types'
import api from '@/lib/api'
import { mergeCategoriesWithSeed, categoryHasPersistentId } from '@/lib/seedCategories'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizeCategories } from '@/lib/i18n/categoryNames'
import type { SearchFilterState } from '@/lib/searchFilters'
import {
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'

interface SearchFiltersProps {
  filters: SearchFilterState
  setFilters: Dispatch<SetStateAction<SearchFilterState>>
}

export default function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const { locale, t } = useLanguage()
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<Category[]>(() => mergeCategoriesWithSeed([]))

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        setCategories(mergeCategoriesWithSeed(res.data || []))
      })
      .catch(() => setCategories(mergeCategoriesWithSeed([])))
  }, [])

  const updateFilter = <K extends keyof SearchFilterState>(key: K, value: SearchFilterState[K]) => {
    setFilters({ ...filters, [key]: value })
  }

  const hasGeoFilter = Boolean(filters.lat && filters.lng)

  const activeFiltersCount = [
    filters.type,
    filters.minPrice != null && !Number.isNaN(filters.minPrice),
    filters.maxPrice != null && !Number.isNaN(filters.maxPrice),
    hasGeoFilter,
    hasGeoFilter && filters.radius != null && !Number.isNaN(filters.radius),
  ].filter(Boolean).length

  const displayCategories = localizeCategories(categories, locale)

  return (
    <div className="card-glass overflow-visible mb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-primary-800 shrink-0">
            <FunnelIcon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('filters.title')}</h2>
            {activeFiltersCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('filters.active', { count: String(activeFiltersCount) })}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
            showFilters
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              : 'bg-primary-800 text-white shadow-md hover:bg-primary-900 ring-2 ring-primary-700/30'
          }`}
          aria-expanded={showFilters}
        >
          <FunnelIcon className="h-5 w-5" />
          {showFilters ? t('filters.toggleHide') : t('filters.toggleShow')}
          {!showFilters && activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
          {showFilters ? (
            <ChevronUpIcon className="h-4 w-4 opacity-70" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 opacity-90" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200/80 dark:border-gray-700/80 space-y-6 animate-slide-down">
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('filters.type')}</label>
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value || null)}
              className="input-field"
            >
              <option value="">{t('filters.allTypes')}</option>
              <option value={ListingType.ITEM}>{t('filters.items')}</option>
              <option value={ListingType.WORKER}>{t('filters.workers')}</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('category.label')}</label>
            <select
              value={
                filters.categoryId != null && filters.categoryId > 0
                  ? `id:${filters.categoryId}`
                  : filters.categorySlug
                    ? `slug:${filters.categorySlug}`
                    : ''
              }
              onChange={(e) => {
                const v = e.target.value
                if (!v) {
                  setFilters({ ...filters, categoryId: null, categorySlug: null })
                } else if (v.startsWith('slug:')) {
                  setFilters({ ...filters, categoryId: null, categorySlug: v.slice(5) })
                } else if (v.startsWith('id:')) {
                  setFilters({ ...filters, categoryId: Number(v.slice(3)), categorySlug: null })
                }
              }}
              className="input-field"
            >
              <option value="">{t('category.all')}</option>
              {displayCategories.map((c) => (
                <option
                  key={c.slug || String(c.id)}
                  value={categoryHasPersistentId(c) ? `id:${c.id}` : `slug:${c.slug}`}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              {t('filters.priceRange')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder={t('filters.min')}
                value={filters.minPrice ?? ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : null)}
                className="input-field"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder={t('filters.max')}
                value={filters.maxPrice ?? ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : null)}
                className="input-field"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Radius (km)
            </label>
            <input
              type="number"
              min={1}
              placeholder="Radius (km)"
              value={filters.radius ?? ''}
              onChange={(e) => updateFilter('radius', e.target.value ? Number(e.target.value) : null)}
              className="input-field"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                type: null,
                minPrice: null,
                maxPrice: null,
                lat: null,
                lng: null,
                radius: null,
              }))
            }
            className="w-full btn-secondary font-semibold"
          >
            {t('filters.resetRefinements')}
          </button>
        </div>
      )}
    </div>
  )
}
