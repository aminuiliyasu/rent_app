'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { Listing, ListingType } from '@/lib/types'
import { buildBookingDateRange } from '@/lib/bookingDates'
import { formatMoneyAmount, getListingCurrencyCode } from '@/lib/listingCurrency'
import { toAppListingImageUrl } from '@/lib/listingImageUrl'
import { useCurrencyPresentation } from '@/contexts/CurrencyPresentationContext'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { CalendarIcon, MapPinIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid'

export default function NewBookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { presentation } = useCurrencyPresentation()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dates, setDates] = useState({
    start: searchParams.get('start') || '',
    end: searchParams.get('end') || '',
  })

  const listingId = searchParams.get('listingId')

  const fetchListing = useCallback(async () => {
    try {
      const response = await api.get(`/listings/${listingId}`)
      setListing(response.data)
    } catch (error) {
      console.error('Error fetching listing:', error)
      toast.error('Failed to load listing')
      router.push('/search')
    } finally {
      setLoading(false)
    }
  }, [listingId, router])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (!listingId) {
      toast.error('No listing selected')
      router.push('/search')
      return
    }
    void fetchListing()
  }, [authLoading, isAuthenticated, listingId, router, fetchListing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listing) return

    if (!dates.start || !dates.end) {
      toast.error('Please select both start and end dates')
      return
    }

    let startDate: Date
    let endDate: Date
    try {
      const range = buildBookingDateRange(dates.start, dates.end, {
        type: listing.type,
        priceHour: listing.priceHour,
      })
      startDate = range.start
      endDate = range.end
    } catch {
      toast.error('End date cannot be before start date')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post('/bookings', {
        listingId: Number(listingId),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      
      toast.success('Booking request sent successfully!')
      router.push(`/bookings/${response.data.id}`)
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
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
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Listing not found</h3>
        </div>
        <Footer />
      </div>
    )
  }

  const calculateTotal = () => {
    if (!dates.start || !dates.end || !listing) return 0
    try {
      const { start, end } = buildBookingDateRange(dates.start, dates.end, {
        type: listing.type,
        priceHour: listing.priceHour,
      })
      const ms = end.getTime() - start.getTime()
      if (listing.type === ListingType.WORKER && listing.priceHour != null && listing.priceHour > 0) {
        const hours = Math.max(1, Math.ceil(ms / (1000 * 60 * 60)))
        return hours * listing.priceHour
      }
      if (!listing.priceDay) return 0
      const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)))
      return days * listing.priceDay
    } catch {
      return 0
    }
  }

  const total = calculateTotal()
  const deposit = listing.deposit || 0
  const grandTotal = total + deposit
  const img = toAppListingImageUrl(listing.primaryImageUrl || listing.imageUrls?.[0])
  const listingCur = getListingCurrencyCode(listing)
  const fmtMoney = (n: number) => formatMoneyAmount(n, listingCur, presentation)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 pt-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">New booking</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-3">
          Send a friendly request
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
          Pick your dates, review the estimate, and we&apos;ll notify the host. You&apos;ll message them in one thread for pickup and payment details — nothing cryptic, just a normal rental conversation.
        </p>

        <ol className="mb-10 flex flex-wrap gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">1</span>
            Dates
          </li>
          <li className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 ring-1 ring-gray-200 dark:bg-gray-900/70 dark:ring-gray-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-700 dark:bg-gray-600 dark:text-gray-200">2</span>
            Review
          </li>
          <li className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 ring-1 ring-gray-200 dark:bg-gray-900/70 dark:ring-gray-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-700 dark:bg-gray-600 dark:text-gray-200">3</span>
            Request sent
          </li>
        </ol>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="overflow-hidden rounded-3xl card-glass p-0">
              <div className="grid sm:grid-cols-[140px,1fr] gap-0 sm:gap-6 p-6 sm:p-8">
                <div className="relative mx-auto aspect-square w-full max-w-[140px] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                  {img ? (
                    <Image src={img} alt="" fill className="object-cover" sizes="140px" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400 p-2 text-center">No photo</div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                    {listing.title}
                  </h2>
                  {(listing.city || listing.address) && (
                    <div className="mt-3 flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <MapPinIcon className="h-5 w-5 shrink-0 text-blue-500" />
                      <span>{listing.address || `${listing.city}, ${listing.state}`}</span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 border-t border-gray-200/80 dark:border-gray-700 px-6 sm:px-8 py-6 sm:py-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">When do you need it?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        Start
                      </label>
                      <input
                        type="date"
                        value={dates.start}
                        onChange={(e) => setDates({ ...dates, start: e.target.value })}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">End</label>
                      <input
                        type="date"
                        value={dates.end}
                        onChange={(e) => setDates({ ...dates, end: e.target.value })}
                        className="input-field"
                        min={dates.start || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  {dates.start && dates.end && dates.start === dates.end && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Same-day booking:{' '}
                      {listing.type === ListingType.WORKER && listing.priceHour
                        ? 'we use a 1-hour window for the request (finalize exact time in chat).'
                        : 'we treat it as one full rental day.'}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What happens next</p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex gap-2">
                      <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
                      The host approves or suggests another time.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
                      You chat in <strong className="text-gray-800 dark:text-gray-200">Messages</strong> to align on pickup and payment.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
                      After the rental, you both leave private reviews.
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !dates.start || !dates.end}
                  className="w-full btn-primary py-4 text-lg font-bold"
                >
                  {submitting ? 'Sending request…' : 'Send request to host'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-glass sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Estimate</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                {listing.type === ListingType.WORKER && listing.priceHour
                  ? 'Based on your dates and the hourly rate (same day = at least 1 hour).'
                  : 'Based on your dates and the daily rate (same calendar day counts as one day).'}
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rental</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {fmtMoney(total)}
                  </span>
                </div>
                
                {deposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Security deposit</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {fmtMoney(deposit)}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Approx. total</span>
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {fmtMoney(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-800/60">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <SparklesIcon className="h-4 w-4 inline mr-1 text-blue-500" />
                  Final payment details are worked out in your booking chat so you and the host stay on the same page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
