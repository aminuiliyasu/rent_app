'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Listing } from '@/lib/types'
import ListingCard from '@/components/ListingCard'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { LAUNCH_REGION_LABEL } from '@/lib/site'

export default function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    const loadListings = async () => {
      const parse = (response: { data?: { content?: Listing[] } }) => {
        const content = response.data?.content
        return Array.isArray(content) ? content : []
      }

      const local = await api.get('/listings', { params: { page: 0, size: 8, location: 'Budapest' } })
      let results = parse(local)
      if (results.length === 0) {
        const all = await api.get('/listings', { params: { page: 0, size: 8 } })
        results = parse(all)
      }
      if (!cancelled) setListings(results)
    }

    loadListings()
      .catch(() => {
        if (!cancelled) {
          setListings([])
          setError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="section-container bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <SparklesIcon className="h-5 w-5 mr-2" />
            <span className="text-base md:text-lg font-semibold">Featured near you</span>
          </div>
          <h2 className="heading-display text-5xl md:text-6xl mb-4">
            Listings people are{' '}
            <span className="gradient-text">booking now</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Real inventory from local owners in {LAUNCH_REGION_LABEL} — updated as the community grows.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
            </div>
            <p className="text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400">Loading listings…</p>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-500 mt-2">Waiting for the server if it just started</p>
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {listings.map((listing, idx) => (
                <div key={listing.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/search?location=Budapest"
                className="btn-outline inline-flex items-center gap-2 px-8 py-4 text-xl font-semibold hover:scale-105 transition-transform"
              >
                View all listings in {LAUNCH_REGION_LABEL.split(',')[0]}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16 animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <SparklesIcon className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-2xl text-gray-600 dark:text-gray-400 font-medium">
              {error ? 'Could not load listings right now' : 'No listings in this area yet'}
            </p>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-500 mt-2 mb-6">
              Be the first to post — or browse all categories while the community grows.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/listings/new" className="btn-primary px-8 py-4 text-lg">
                Post the first listing
              </Link>
              <Link href="/search" className="btn-outline px-8 py-4 text-lg">
                Browse all listings
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
