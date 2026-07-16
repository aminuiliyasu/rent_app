'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { Listing, Review } from '@/lib/types'
import {
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  SparklesIcon,
  CheckBadgeIcon,
  CubeIcon,
} from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  formatMoneyAmount,
  formatListingCardPrice,
  getListingCurrencyCode,
  stripLegacyPricingAppendix,
} from '@/lib/listingCurrency'
import { useCurrencyPresentation } from '@/contexts/CurrencyPresentationContext'
import { formatListingLocationLine } from '@/lib/listingLocation'
import { formatAvailableDaysLabel } from '@/lib/availableDays'
import { galleryImageUrls } from '@/lib/listingImageUrl'
import { isListingOwner } from '@/lib/listingOwner'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function ListingDetailPage() {
  const params = useParams()
  const { isAuthenticated, user } = useAuth()
  const { locale, t } = useLanguage()
  const { presentation } = useCurrencyPresentation()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [listingReviews, setListingReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' })
  const [selectedImage, setSelectedImage] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const id = typeof params.id === 'string' ? params.id : params.id?.[0]
    if (!id) return

    let cancelled = false
    setLoading(true)

    ;(async () => {
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/listings/${id}/reviews?size=50`).catch(() => ({ data: { content: [] } })),
        ])
        if (cancelled) return
        setListing(listingRes.data)
        setListingReviews(reviewsRes.data?.content || [])
        const d = listingRes.data
        if (
          (d.imageUrls && d.imageUrls.length > 0) ||
          d.primaryImageUrl
        ) {
          setSelectedImage(0)
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
        if (!cancelled) toast.error(t('listingDetail.loadFailed'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [params.id])

  const handleBook = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (!selectedDates.start || !selectedDates.end) {
      toast.error(t('listingDetail.selectDates'))
      return
    }
    router.push(`/bookings/new?listingId=${params.id}&start=${selectedDates.start}&end=${selectedDates.end}`)
  }

  const handleDeleteListing = async () => {
    if (!listing) return
    if (!confirm(t('listingDetail.deleteConfirm', { title: listing.title }))) return

    try {
      setDeleting(true)
      await api.delete(`/listings/${listing.id}`)
      toast.success(t('listingDetail.deleted'))
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.error || t('listingDetail.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <SparklesIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('listingDetail.notFoundTitle')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('listingDetail.notFoundBody')}</p>
        </div>
        <Footer />
      </div>
    )
  }

  const images = galleryImageUrls(listing)

  const currencyCode = getListingCurrencyCode(listing)
  const fmt = (amount?: number | null) => formatMoneyAmount(amount, currencyCode, presentation)
  const cardPrice = formatListingCardPrice(listing, presentation)
  const descriptionDisplay = stripLegacyPricingAppendix(listing.description)
  const locationLine = formatListingLocationLine(listing)
  const availableDaysLabel = formatAvailableDaysLabel(listing.availableDays, locale)
  const isOwner = isListingOwner(user, listing)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isOwner && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              {t('listingDetail.ownerBanner')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/listings/${listing.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
              >
                <PencilSquareIcon className="h-4 w-4" />
                {t('listingDetail.editListing')}
              </Link>
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
                {deleting ? t('listingDetail.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images Gallery */}
            <div className="card-glass overflow-hidden">
              <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[selectedImage]}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
                    <CubeIcon className="h-32 w-32 text-blue-400/80 dark:text-blue-500/50" aria-hidden />
                  </div>
                )}
                
                {/* Featured Badge */}
                {listing.isFeatured && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4" />
                    {t('listingDetail.featured')}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {images.map((url, idx) => (
                    <button
                      key={url + idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? 'border-blue-500 scale-105 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="card-glass">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                    {listing.title}
                  </h1>
                  
                  {/* Rating & Location */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
                    {listing.averageRating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            i < Math.floor(listing.averageRating || 0) ? (
                              <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                            ) : (
                              <StarOutlineIcon key={i} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                            )
                          ))}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{listing.averageRating.toFixed(1)}</span>
                        {listing.reviewCount && (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {t('listingDetail.reviewCount', { count: String(listing.reviewCount) })}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {locationLine && (
                      <div className="flex min-w-0 max-w-full items-start gap-2 text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="h-5 w-5 shrink-0 text-blue-500" aria-hidden />
                        <span className="font-medium leading-snug">{locationLine}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {descriptionDisplay && (
                <div className="prose max-w-none mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('listingDetail.description')}</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg">
                    {descriptionDisplay}
                  </p>
                </div>
              )}

              {/* Worker-specific info */}
              {listing.type === 'WORKER' && (
                <div className="space-y-4 mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
                  {listing.workerProfession && (
                    <div className="flex items-center gap-3">
                      <CheckBadgeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{listing.workerProfession}</p>
                    </div>
                  )}
                  {listing.workerBio && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{listing.workerBio}</p>
                  )}
                  {listing.serviceArea && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {t('listingDetail.serviceArea')}: <span className="font-bold">{listing.serviceArea}</span>
                    </p>
                  )}
                  {availableDaysLabel && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {t('listingDetail.available')}: <span className="font-bold">{availableDaysLabel}</span>
                    </p>
                  )}
                </div>
              )}

              {listing.type !== 'WORKER' && availableDaysLabel && (
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-6">
                  {t('listingDetail.available')}: <span className="font-bold text-gray-800 dark:text-gray-200">{availableDaysLabel}</span>
                </p>
              )}

              {/* Rates */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{t('listingDetail.pricing')}</span>
                  <span className="text-gray-500 dark:text-gray-500"> · {t('listingDetail.pricingIn')} </span>
                  <span className="font-bold tabular-nums text-blue-600 dark:text-blue-400">{currencyCode}</span>
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {listing.priceHour != null && listing.priceHour > 0 && (
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 min-w-0 border border-gray-100 dark:border-gray-700/80">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('listingDetail.rateHourly')}</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white break-words leading-snug">{fmt(listing.priceHour)}</p>
                  </div>
                )}
                {listing.priceDay != null && listing.priceDay > 0 && (
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 min-w-0 border border-gray-100 dark:border-gray-700/80">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('listingDetail.rateDaily')}</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white break-words leading-snug">{fmt(listing.priceDay)}</p>
                  </div>
                )}
                {listing.priceWeek != null && listing.priceWeek > 0 && (
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 min-w-0 border border-gray-100 dark:border-gray-700/80">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('listingDetail.rateWeekly')}</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white break-words leading-snug">{fmt(listing.priceWeek)}</p>
                  </div>
                )}
                {listing.priceMonth != null && listing.priceMonth > 0 && (
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 min-w-0 border border-gray-100 dark:border-gray-700/80">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('listingDetail.rateMonthly')}</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white break-words leading-snug">{fmt(listing.priceMonth)}</p>
                  </div>
                )}
                {listing.deposit != null && listing.deposit > 0 && (
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 min-w-0 border border-amber-200/80 dark:border-amber-800/60">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('listingDetail.deposit')}</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white break-words leading-snug">{fmt(listing.deposit)}</p>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="card-glass">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('listingDetail.reviews')}</h2>
              {listingReviews.length === 0 ? (
                <div className="text-center py-12">
                  <StarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">{t('listingDetail.noReviews')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {t('listingDetail.noReviewsHint')}
                  </p>
                </div>
              ) : (
                <ul className="space-y-6">
                  {listingReviews.map((rev) => (
                    <li
                      key={rev.id}
                      className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/40"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{rev.reviewer?.name || t('listingDetail.reviewerFallback')}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <StarIcon
                              key={n}
                              className={`h-5 w-5 ${n <= rev.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{rev.comment}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-glass sticky top-24 animate-slide-up">
              <div className="mb-8">
                {cardPrice ? (
                  <div className="flex flex-wrap items-baseline gap-2 mb-4">
                    <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                      {cardPrice.formatted}
                    </span>
                    <span className="text-xl text-gray-600 dark:text-gray-400 font-medium">{cardPrice.suffix}</span>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-4">{t('listingDetail.contactPricing')}</p>
                )}
                {listing.priceHour != null && listing.priceHour > 0 && cardPrice?.suffix !== '/hr' && (
                  <div className="text-gray-600 dark:text-gray-400 mb-1 text-sm">
                    <span className="font-semibold">{fmt(listing.priceHour)}</span>{t('listingDetail.perHr')}
                  </div>
                )}
                {listing.priceDay != null && listing.priceDay > 0 && cardPrice?.suffix !== '/day' && (
                  <div className="text-gray-600 dark:text-gray-400 mb-1 text-sm">
                    <span className="font-semibold">{fmt(listing.priceDay)}</span>{t('listingDetail.perDay')}
                  </div>
                )}
                {listing.priceWeek != null && listing.priceWeek > 0 && cardPrice?.suffix !== '/wk' && (
                  <div className="text-gray-600 dark:text-gray-400 mb-1 text-sm">
                    <span className="font-semibold">{fmt(listing.priceWeek)}</span>{t('listingDetail.perWeek')}
                  </div>
                )}
                {listing.priceMonth != null && listing.priceMonth > 0 && cardPrice?.suffix !== '/mo' && (
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-semibold">{fmt(listing.priceMonth)}</span>{t('listingDetail.perMonth')}
                  </div>
                )}
              </div>

              {isOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('listingDetail.ownerSidebar')}{' '}
                    <Link href="/listings/mine" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                      {t('listingDetail.myListingsLink')}
                    </Link>
                    .
                  </p>
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="block w-full btn-primary py-3 text-center font-semibold"
                  >
                    {t('listingDetail.editListing')}
                  </Link>
                  <Link
                    href="/bookings/my-listings"
                    className="block w-full py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {t('listingDetail.viewBookingRequests')}
                  </Link>
                </div>
              ) : (
                <>
              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    {t('listingDetail.startDate')}
                  </label>
                  <input
                    type="date"
                    value={selectedDates.start}
                    onChange={(e) => setSelectedDates({ ...selectedDates, start: e.target.value })}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t('listingDetail.endDate')}
                  </label>
                  <input
                    type="date"
                    value={selectedDates.end}
                    onChange={(e) => setSelectedDates({ ...selectedDates, end: e.target.value })}
                    className="input-field"
                    min={selectedDates.start || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Deposit Info */}
              {listing.deposit != null && listing.deposit > 0 && (
                <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('listingDetail.securityDeposit')}</p>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{fmt(listing.deposit)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{t('listingDetail.depositRefundable')}</p>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={!selectedDates.start || !selectedDates.end}
                className="w-full btn-primary py-4 text-lg font-bold mb-4"
              >
                {t('listingDetail.requestToBook')}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-green-500" />
                  {t('listingDetail.bookHint')}
                </p>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
