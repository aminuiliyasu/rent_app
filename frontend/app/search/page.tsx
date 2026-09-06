'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'
import SearchFilters from '@/components/SearchFilters'
import api from '@/lib/api'
import { Category, Listing } from '@/lib/types'
import { mergeCategoriesWithSeed, categoryHasPersistentId, resolveCategorySlug } from '@/lib/seedCategories'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizeCategories } from '@/lib/i18n/categoryNames'
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline'
import {
  buildLocationQuery,
  emptySearchFilters,
  type SearchFilterState,
} from '@/lib/searchFilters'

function parseInitialFilters(searchParams: { get: (key: string) => string | null }): SearchFilterState {
  const catRaw = searchParams.get('category')
  const parsedCat = catRaw ? Number(catRaw) : NaN
  const categoryId =
    catRaw != null && catRaw !== '' && Number.isFinite(parsedCat) && !Number.isNaN(parsedCat) && parsedCat > 0
      ? parsedCat
      : null
  const slugRaw = searchParams.get('categorySlug')
  const categorySlug =
    categoryId != null
      ? null
      : slugRaw && slugRaw.trim()
        ? resolveCategorySlug(slugRaw.trim())
        : null

  const district = searchParams.get('district') || ''
  const area = searchParams.get('area') || searchParams.get('location') || ''

  return {
    search: searchParams.get('q') || '',
    district,
    area,
    categoryId,
    categorySlug,
    type: searchParams.get('type') || null,
    minPrice: null,
    maxPrice: null,
    lat: null,
    lng: null,
    radius: null,
  }
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell pt-20">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto" />
          </div>
          <Footer />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const { locale, t } = useLanguage()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>(() => mergeCategoriesWithSeed([]))
  const [filters, setFilters] = useState<SearchFilterState>(() => parseInitialFilters(searchParams))

  const displayCategories = localizeCategories(categories, locale)

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(mergeCategoriesWithSeed(res.data || [])))
      .catch(() => setCategories(mergeCategoriesWithSeed([])))
  }, [])

  useEffect(() => {
    setFilters(parseInitialFilters(searchParams))
  }, [searchParams])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const keyword = (filters.search || '').trim()
      const place = buildLocationQuery(filters.district, filters.area)
      if (keyword) params.append('search', keyword)
      if (place) params.append('location', place)
      if (filters.categoryId != null && filters.categoryId > 0 && !Number.isNaN(filters.categoryId)) {
        params.append('categoryId', filters.categoryId.toString())
      } else if (filters.categorySlug) {
        params.append('categorySlug', filters.categorySlug)
      }
      if (filters.type) params.append('type', filters.type)
      if (filters.minPrice != null && !Number.isNaN(filters.minPrice)) {
        params.append('minPrice', filters.minPrice.toString())
      }
      if (filters.maxPrice != null && !Number.isNaN(filters.maxPrice)) {
        params.append('maxPrice', filters.maxPrice.toString())
      }
      if (filters.lat && filters.lng) {
        params.append('lat', filters.lat.toString())
        params.append('lng', filters.lng.toString())
        params.append('radius', (filters.radius || 10).toString())
      }
      params.append('page', '0')
      params.append('size', '20')

      const response = await api.get(`/listings?${params.toString()}`)
      setListings(response.data.content || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void fetchListings()
  }, [fetchListings])

  const headlineParts = [
    filters.search.trim(),
    buildLocationQuery(filters.district, filters.area),
    filters.categoryId || filters.categorySlug
      ? displayCategories.find(
          (c) =>
            (filters.categoryId != null && c.id === filters.categoryId) ||
            (filters.categorySlug && c.slug === filters.categorySlug)
        )?.name
      : '',
  ].filter(Boolean)

  const headlineQuery = headlineParts.join(' · ')

  const selectCategory = (category: Category | null) => {
    if (!category) {
      setFilters((prev) => ({ ...prev, categoryId: null, categorySlug: null }))
      return
    }
    if (categoryHasPersistentId(category)) {
      setFilters((prev) => ({ ...prev, categoryId: category.id, categorySlug: null }))
    } else {
      setFilters((prev) => ({ ...prev, categoryId: null, categorySlug: category.slug }))
    }
  }

  const isCategoryActive = (category: Category) =>
    (filters.categoryId != null && category.id === filters.categoryId) ||
    (filters.categorySlug != null && category.slug === filters.categorySlug)

  return (
    <div className="page-shell pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search + categories */}
        <div className="mb-8 card-glass animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                {t('search.itemLabel')}
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder={t('search.itemPlaceholder')}
                  className="input-field pl-11"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                {t('search.districtLabel')}
              </label>
              <input
                type="text"
                value={filters.district}
                onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
                placeholder={t('search.districtPlaceholder')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                {t('search.areaLabel')}
              </label>
              <input
                type="text"
                value={filters.area}
                onChange={(e) => setFilters((prev) => ({ ...prev, area: e.target.value }))}
                placeholder={t('search.areaPlaceholder')}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200/80 dark:border-gray-700/80">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">{t('search.browseCategories')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filters.categoryId == null && !filters.categorySlug
                  ? 'bg-primary-800 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t('search.allCategories')}
            </button>
            {displayCategories.map((category) => (
              <button
                key={category.slug || String(category.id)}
                type="button"
                onClick={() => selectCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isCategoryActive(category)
                    ? 'bg-primary-800 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 animate-slide-down">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
            {headlineQuery ? (
              <>
                {t('search.resultsFor')}{' '}
                <span className="gradient-text">&quot;{headlineQuery}&quot;</span>
              </>
            ) : (
              <>
                {t('search.discover')}{' '}
                <span className="gradient-text">{t('search.amazingListings')}</span>
              </>
            )}
          </h1>
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">{listings.length}</span>
              <span>{t('search.listingsFound')}</span>
            </div>
          </div>
        </div>

        <SearchFilters filters={filters} setFilters={setFilters} />

        <main>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-800 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
              </div>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">{t('search.loading')}</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {listings.map((listing, idx) => (
                <div key={listing.id} className="animate-slide-up h-full" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-slide-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('search.noResults')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{t('search.noResultsHint')}</p>
              <button
                onClick={() => setFilters(emptySearchFilters())}
                className="btn-outline"
              >
                {t('search.clearFilters')}
              </button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
