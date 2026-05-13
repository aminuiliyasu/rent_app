'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'
import SearchFilters from '@/components/SearchFilters'
import api from '@/lib/api'
import { Listing } from '@/lib/types'
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface SearchFilterState {
  search: string
  categoryId: number | null
  categorySlug: string | null
  type: string | null
  minPrice: number | null
  maxPrice: number | null
  location: string
  lat: number | null
  lng: number | null
  radius: number | null
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFilterState>(() => {
    const catRaw = searchParams.get('category')
    const parsedCat = catRaw ? Number(catRaw) : NaN
    const categoryId =
      catRaw != null &&
      catRaw !== '' &&
      Number.isFinite(parsedCat) &&
      !Number.isNaN(parsedCat) &&
      parsedCat > 0
        ? parsedCat
        : null
    const slugRaw = searchParams.get('categorySlug')
    const categorySlug =
      categoryId != null
        ? null
        : slugRaw && slugRaw.trim()
          ? slugRaw.trim()
          : null
    return {
      search: searchParams.get('q') || '',
      categoryId,
      categorySlug,
      type: searchParams.get('type') || null,
      minPrice: null,
      maxPrice: null,
      location: searchParams.get('location') || '',
      lat: null,
      lng: null,
      radius: null,
    }
  })

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const keyword = (filters.search || '').trim()
      const place = (filters.location || '').trim()
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

  const headlineQuery = [filters.search, filters.location]
    .map((s) => (s || '').trim())
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
            {headlineQuery ? (
              <>
                Search results for{' '}
                <span className="gradient-text">&quot;{headlineQuery}&quot;</span>
              </>
            ) : (
              <>
                Discover{' '}
                <span className="gradient-text">Amazing Listings</span>
              </>
            )}
          </h1>
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">{listings.length}</span>
              <span>listings found</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <SearchFilters filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                </div>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">Loading amazing listings...</p>
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing, idx) => (
                  <div key={listing.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 animate-slide-up">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                  <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No listings found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search filters</p>
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
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
                  className="btn-outline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
