'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Listing } from '@/lib/types'
import { formatListingCardPrice } from '@/lib/listingCurrency'
import { firstListingImageUrl } from '@/lib/listingImageUrl'
import { useCurrencyPresentation } from '@/contexts/CurrencyPresentationContext'
import { StarIcon, MapPinIcon, CubeIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

export default function FeaturedListings() {
  const { presentation } = useCurrencyPresentation()
  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    api.get('/listings?page=0&size=8')
      .then((response) => setListings(response.data.content || []))
      .catch(() => setListings([]))
  }, [])

  return (
    <section className="section-container bg-white dark:bg-ink-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
            Featured near you
          </p>
          <h2 className="section-title">
            Listings people are <span className="gradient-text">booking now</span>
          </h2>
          <p className="section-subtitle">
            Real inventory from local owners — updated as the community grows.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {listings.map((listing, idx) => {
            const cardPrice = formatListingCardPrice(listing, presentation)
            const cardImageSrc = firstListingImageUrl(listing)
            return (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="listing-card group animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-56 mb-4 rounded-t-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {cardImageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cardImageSrc}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
                    <CubeIcon className="h-16 w-16 text-blue-400/80 dark:text-blue-500/50" aria-hidden />
                  </div>
                )}
                
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Featured badge */}
                {listing.isFeatured && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <StarIcon className="h-3 w-3" aria-hidden />
                    Featured
                  </div>
                )}
                
                {cardPrice && (
                <div className="absolute bottom-3 left-3 max-w-[min(100%,20rem)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-0.5 items-start min-w-0">
                    <span className="text-lg sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 leading-snug break-words">
                      {cardPrice.formatted}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {presentation === 'symbol' && (
                        <>
                          <span className="rounded-md bg-gray-200/80 dark:bg-gray-700/90 px-1.5 py-0.5 text-gray-800 dark:text-gray-100">
                            {cardPrice.currencyCode}
                          </span>
                          <span className="text-gray-400">·</span>
                        </>
                      )}
                      <span>{cardPrice.periodLabel}</span>
                    </div>
                  </div>
                </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-3 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {listing.title}
                </h3>

                {listing.ownerName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                    Listed by{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{listing.ownerName}</span>
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <MapPinIcon className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{listing.city}, {listing.state}</span>
                </div>
                
                {/* Rating */}
                {listing.averageRating ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        i < Math.floor(listing.averageRating || 0) ? (
                          <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ) : (
                          <StarOutlineIcon key={i} className="h-4 w-4 text-gray-300" />
                        )
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{listing.averageRating.toFixed(1)}</span>
                    {listing.reviewCount && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">({listing.reviewCount} reviews)</span>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 dark:text-gray-500">No reviews yet</div>
                )}
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/50 transition-all duration-300 pointer-events-none"></div>
            </Link>
            )
          })}
        </div>
        
        {listings.length === 0 && (
          <div className="text-center py-20 animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <CubeIcon className="h-10 w-10 text-ink-300" />
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">No listings available yet</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Be the first to post a listing!</p>
          </div>
        )}

        {listings.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/search" 
              className="btn-outline inline-flex items-center gap-2 px-8 py-3.5 text-lg font-bold hover:scale-105 transition-transform"
            >
              View All Listings
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
