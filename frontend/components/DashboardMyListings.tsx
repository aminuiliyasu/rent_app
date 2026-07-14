'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
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
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

type DashboardMyListingsProps = {
  onCountChange?: (count: number) => void
}

export default function DashboardMyListings({ onCountChange }: DashboardMyListingsProps) {
  const { presentation } = useCurrencyPresentation()
  const { locale, t } = useLanguage()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<Listing['id'] | null>(null)

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/listings/my?size=100')
      const items: Listing[] = res.data.content || []
      setListings(items)
      onCountChange?.(items.length)
    } catch {
      toast.error(t('listings.loadFailed'))
      setListings([])
      onCountChange?.(0)
    } finally {
      setLoading(false)
    }
  }, [onCountChange, t])

  useEffect(() => {
    void fetchListings()
  }, [fetchListings])

  const handleDelete = async (listing: Listing) => {
    if (!confirm(t('listings.deleteConfirm', { title: listing.title }))) return
    try {
      setDeletingId(listing.id)
      await api.delete(`/listings/${listing.id}`)
      toast.success(t('listings.deleted'))
      setListings((prev) => {
        const next = prev.filter((l) => l.id !== listing.id)
        onCountChange?.(next.length)
        return next
      })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } } }
      toast.error(err.response?.data?.message || err.response?.data?.error || t('listings.deleteFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  const statusClass = (status: string) => {
    if (status === 'ACTIVE') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    }
    if (status === 'DRAFT') {
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
  }

  const statusLabel = (status: string) => {
    if (status === 'ACTIVE') return t('listings.statusActive')
    if (status === 'DRAFT') return t('listings.statusDraft')
    return status
  }

  return (
    <div className="card-glass animate-slide-up h-full" style={{ animationDelay: '0.5s' }}>
      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <RectangleStackIcon className="h-6 w-6 text-green-500" />
          {t('listings.myListings')}
        </h2>
        <Link
          href="/listings/new"
          className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1 group shrink-0"
        >
          <PlusIcon className="h-4 w-4" />
          {t('listings.newListing')}
        </Link>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        Edit photos, pricing, and availability — or remove listings you no longer offer.
      </p>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <RectangleStackIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">{t('listings.noListings')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 mb-6">
            Post gear, a space, or a service to start getting bookings.
          </p>
          <Link href="/listings/new" className="btn-primary inline-flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            {t('listings.createFirst')}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {listings.slice(0, 8).map((listing) => {
              const rateLine = formatListingCardPrice(listing, presentation)
              return (
                <div
                  key={listing.id}
                  className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex flex-col gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{listing.title}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass(listing.status)}`}>
                          {statusLabel(listing.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {localizeCategoryName(listing.categoryName, locale)}
                        {listing.city ? ` · ${listing.city}` : ''}
                        {rateLine ? ` · ${rateLine.formatted}${rateLine.suffix}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800"
                      >
                        <EyeIcon className="h-4 w-4" />
                        {t('common.view')}
                      </Link>
                      <Link
                        href={`/listings/${listing.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        {t('common.edit')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(listing)}
                        disabled={deletingId === listing.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                        {deletingId === listing.id ? t('common.loading') : t('common.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {listings.length > 8 && (
            <div className="mt-4 text-center">
              <Link
                href="/listings/mine"
                className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline inline-flex items-center gap-1"
              >
                {t('listings.viewAll', { count: String(listings.length) })}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
