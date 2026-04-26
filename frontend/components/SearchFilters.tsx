'use client'

import { useState } from 'react'
import { ListingType } from '@/lib/types'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SearchFiltersProps {
  filters: any
  setFilters: (filters: any) => void
}

export default function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(true)

  const updateFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const activeFiltersCount = [
    filters.search,
    filters.categoryId,
    filters.type,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length

  return (
    <div className="card-glass sticky top-24">
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
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {showFilters ? <XMarkIcon className="h-5 w-5" /> : <FunnelIcon className="h-5 w-5" />}
        </button>
      </div>

      {showFilters && (
        <div className="space-y-6 animate-slide-down">
          {/* Search */}
          <div>
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
          <div>
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

          {/* Price Range */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Price Range (per day)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min $"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : null)}
                  className="input-field"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max $"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : null)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter location"
              className="input-field mb-3"
            />
            <input
              type="number"
              placeholder="Radius (km)"
              value={filters.radius || ''}
              onChange={(e) => updateFilter('radius', e.target.value ? Number(e.target.value) : null)}
              className="input-field"
            />
          </div>

          {/* Reset */}
          <button
            onClick={() => setFilters({
              search: '',
              categoryId: null,
              type: null,
              minPrice: null,
              maxPrice: null,
              lat: null,
              lng: null,
              radius: null,
            })}
            className="w-full btn-secondary font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
