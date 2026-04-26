'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { Listing } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  SparklesIcon,
  UserCircleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

export default function FeedPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [likedListings, setLikedListings] = useState<Set<number>>(new Set())
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchListings(true)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchListings(false)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, loading])

  const fetchListings = async (reset: boolean = false) => {
    if (loading) return
    
    setLoading(true)
    try {
      const currentPage = reset ? 0 : page
      const response = await api.get(`/listings?page=${currentPage}&size=10&status=ACTIVE`)
      const newListings = response.data.content || []
      
      if (reset) {
        setListings(newListings)
        setPage(1)
      } else {
        setListings(prev => [...prev, ...newListings])
        setPage(prev => prev + 1)
      }
      
      setHasMore(!response.data.last)
    } catch (error) {
      console.error('Error fetching listings:', error)
      toast.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = (listingId: number) => {
    setLikedListings(prev => {
      const newSet = new Set(prev)
      if (newSet.has(listingId)) {
        newSet.delete(listingId)
      } else {
        newSet.add(listingId)
      }
      return newSet
    })
  }

  const handleShare = async (listing: Listing) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: `${window.location.origin}/listings/${listing.id}`
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/listings/${listing.id}`)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center animate-slide-down">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-50"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
              Feed
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover amazing items and services
          </p>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {listings.map((listing, idx) => (
            <div
              key={listing.id}
              className="card-glass animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Header - User Info */}
              <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <UserCircleIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {listing.ownerName || 'Anonymous'}
                    </p>
                    {listing.city && listing.state && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {listing.city}, {listing.state}
                      </p>
                    )}
                  </div>
                </div>
                {listing.isFeatured && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold">
                    <SparklesIcon className="h-3 w-3" />
                    Featured
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {listing.primaryImageUrl ? (
                  <Image
                    src={listing.primaryImageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
                    <CubeIcon className="h-24 w-24 text-blue-400/80 dark:text-blue-500/50" aria-hidden />
                  </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ${listing.priceDay?.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">/day</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(listing.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      {likedListings.has(listing.id) ? (
                        <HeartSolidIcon className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                      )}
                    </button>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <ChatBubbleLeftIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    </Link>
                    <button
                      onClick={() => handleShare(listing)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <ShareIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <BookmarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                {/* Likes Count */}
                {likedListings.has(listing.id) && (
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {likedListings.has(listing.id) ? '1' : '0'} like{likedListings.has(listing.id) ? '' : 's'}
                  </p>
                )}

                {/* Title and Description */}
                <div>
                  <Link href={`/listings/${listing.id}`}>
                    <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {listing.title}
                    </h3>
                  </Link>
                  {listing.description && (
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                      {listing.description}
                    </p>
                  )}
                </div>

                {/* Rating */}
                {listing.averageRating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        i < Math.floor(listing.averageRating || 0) ? (
                          <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <StarIcon key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                        )
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {listing.averageRating.toFixed(1)}
                    </span>
                    {listing.reviewCount && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        ({listing.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Category/Type Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  {listing.category && (
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                      {listing.category.name}
                    </span>
                  )}
                  {listing.type === 'WORKER' && listing.workerProfession && (
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                      {listing.workerProfession}
                    </span>
                  )}
                </div>

                {/* View Details Button */}
                <Link
                  href={`/listings/${listing.id}`}
                  className="block w-full text-center btn-primary mt-4"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Loading more...</p>
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="h-4"></div>

          {/* End of feed */}
          {!hasMore && listings.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                You have reached the end of the feed.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && listings.length === 0 && (
            <div className="text-center py-20 animate-slide-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                <SparklesIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No listings yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to post something amazing!
              </p>
              <Link href="/listings/new" className="btn-primary">
                Post a Listing
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
