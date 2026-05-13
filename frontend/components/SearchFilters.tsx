'use client'

import { useState, useEffect } from 'react'
import { ListingType, Category } from '@/lib/types'
import api from '@/lib/api'
import { mergeCategoriesWithSeed, categoryHasPersistentId } from '@/lib/seedCategories'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SearchFiltersProps {
  filters: any
  setFilters: (filters: any) => void
}

export default function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(true)
  const [categories, setCategories] = useState<Category[]>(() => mergeCategoriesWithSeed([]))

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        setCategories(mergeCategoriesWithSeed(res.data || []))
      })
      .catch(() => setCategories(mergeCategoriesWithSeed([])))
  }, [])

  const updateFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const hasGeoFilter = Boolean(filters.lat && filters.lng)

  const activeFiltersCount = [
    filters.search,
    filters.categoryId,
    filters.categorySlug,
    filters.type,
    filters.minPrice != null && !Number.isNaN(filters.minPrice),
    filters.maxPrice != null && !Number.isNaN(filters.maxPrice),
    filters.location,
    hasGeoFilter,
    hasGeoFilter && filters.radius != null && !Number.isNaN(filters.radius),
  ].filter(Boolean).length

  return (
    <div className="card-glass overflow-visible">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500">
            <FunnelIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
            {activeFiltersCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{activeFiltersCount} active</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {showFilters ? <XMarkIcon className="h-5 w-5" /> : <FunnelIcon className="h-5 w-5" />}
        </button>
      </div>

      {showFilters && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-field"
              placeholder="Search listings..."
            />
          </div>

          {/* Type */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value || null)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value={ListingType.ITEM}>Items</option>
              <option value={ListingType.WORKER}>Workers</option>
            </select>
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
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
              <option value="">All categories</option>
              {categories.map((c) => (
                <option
                  key={c.slug || String(c.id)}
                  value={categoryHasPersistentId(c) ? `id:${c.id}` : `slug:${c.slug}`}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Price Range (per day)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Min"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : null)}
                  className="input-field"
                />
              </div>
              <div>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Max"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : null)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Location — own stacking context so borders / siblings never paint over the label */}
          <div className="relative z-10 pt-2">
            <label
              htmlFor="filter-location"
              className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 relative bg-transparent"
            >
              Location (Optional)
            </label>
            <input
              id="filter-location"
              type="text"
              placeholder="City, country, district…"
              value={filters.location || ''}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="input-field mb-3"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 mb-1">
              Matches <strong className="text-gray-600 dark:text-gray-300">city</strong>,{' '}
              <strong className="text-gray-600 dark:text-gray-300">country</strong>, or{' '}
              <strong className="text-gray-600 dark:text-gray-300">district</strong> (address) only — separate from Search above.
            </p>
            <input
              type="number"
              min={1}
              placeholder="Radius (km)"
              value={filters.radius ?? ''}
              onChange={(e) => updateFilter('radius', e.target.value ? Number(e.target.value) : null)}
              className="input-field"
            />
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={() =>
              setFilters({
                search: '',
                categoryId: null,
                categorySlug: null,
                type: null,
                minPrice: null,
                maxPrice: null,
                location: '',
                lat: null,
                lng: null,
                radius: null,
              })
            }
            className="w-full btn-secondary font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
