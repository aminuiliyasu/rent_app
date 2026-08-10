'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { CalendarIcon } from '@heroicons/react/24/solid'
import { Booking } from '@/lib/types'
import { bookedListingTitle, formatBookingDateRange, friendlyBookingStatus } from '@/lib/bookingUi'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MyRentingBookingsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { locale, t } = useLanguage()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [listingTitlesById, setListingTitlesById] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get('/bookings/my?size=100')
      const items: Booking[] = response.data.content || []
      const idsToFetch = Array.from(
        new Set(
          items
            .filter((b) => {
              const title = b.listing?.title
              return b.listingId != null && !(title && String(title).trim())
            })
            .map((b) => Number(b.listingId)),
        ),
      )
      const titleMap: Record<number, string> = {}
      if (idsToFetch.length > 0) {
        await Promise.all(
          idsToFetch.map(async (id) => {
            try {
              const res = await api.get(`/listings/${id}`)
              const title = String(res.data?.title ?? '').trim()
              if (title) titleMap[id] = title
            } catch {
              /* ignore per listing */
            }
          }),
        )
      }
      if (Object.keys(titleMap).length > 0) {
        setListingTitlesById(titleMap)
      }
      setBookings(items)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error(t('bookingRent.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    void fetchBookings()
  }, [authLoading, isAuthenticated, router, fetchBookings])

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          {t('bookingRent.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('bookingRent.subtitle')}</p>

        {bookings.length === 0 ? (
          <div className="card-glass text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('bookingRent.emptyTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{t('bookingRent.emptyBody')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card-glass">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {bookedListingTitle(booking, listingTitlesById)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[booking.status] || ''}`}>
                        {friendlyBookingStatus(booking.status, locale)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-5 w-5 text-blue-500" />
                      <span>{formatBookingDateRange(booking.startDate, booking.endDate)}</span>
                    </div>
                  </div>
                  <Link href={`/bookings/${booking.id}`} className="btn-outline shrink-0">
                    {t('bookingRent.viewBooking')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
