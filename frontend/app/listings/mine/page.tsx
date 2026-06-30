'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Listing } from '@/lib/types'
import { formatListingCardPrice } from '@/lib/listingCurrency'
import { useCurrencyPresentation } from '@/contexts/CurrencyPresentationContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizeCategoryName } from '@/lib/i18n/categoryNames'
import toast from 'react-hot-toast'
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  RectangleStackIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

export default function MyListingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { presentation } = useCurrencyPresentation()
  const { locale } = useLanguage()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/listings/my?size=100')
      setListings(res.data.content || [])
    } catch {
      toast.error('Failed to load your listings')
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    void fetchListings()
  }, [authLoading, isAuthenticated, router, fetchListings])

  const handleDelete = async (listing: Listing) => {
    if (!confirm(`Delete "${listing.title}"? This cannot be undone.`)) return
    try {
      setDeletingId(listing.id)
      await api.delete(`/listings/${listing.id}`)
      toast.success('Listing deleted')
      setListings((prev) => prev.filter((l) => l.id !== listing.id))
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } } }
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to delete listing')
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <RectangleStackIcon className="h-9 w-9 text-green-500" />
              My listings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Edit details, update photos, or remove listings you no longer offer.
            </p>
          </div>
          <Link href="/listings/new" className="btn-primary inline-flex items-center gap-2 px-5 py-3 shrink-0">
            <PlusIcon className="h-5 w-5" />
            New listing
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto" />
          </div>
        ) : listings.length === 0 ? (
          <div className="card-glass text-center py-16">
            <RectangleStackIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">No listings yet</p>
            <Link href="/listings/new" className="btn-primary inline-flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const rateLine = formatListingCardPrice(listing, presentation)
              return (
                <div
                  key={listing.id}
                  className="card-glass p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {listing.title}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          listing.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : listing.status === 'DRAFT'
                              ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {localizeCategoryName(listing.categoryName, locale)}
                      {listing.city ? ` · ${listing.city}` : ''}
                      {rateLine ? ` · ${rateLine.formatted}${rateLine.suffix}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View
                    </Link>
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(listing)}
                      disabled={deletingId === listing.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      {deletingId === listing.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
