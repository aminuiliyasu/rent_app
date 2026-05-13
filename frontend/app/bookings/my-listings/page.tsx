'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { formatMoneyAmount, getListingCurrencyCode } from '@/lib/listingCurrency'
import { useCurrencyPresentation } from '@/contexts/CurrencyPresentationContext'
import { formatBookingDateRange } from '@/lib/bookingUi'

interface Booking {
  id: number
  listingId: number
  renterId: number
  ownerId: number
  startDate: string
  endDate: string
  status: string
  totalAmount: number
  deposit: number
  platformFee: number
  currency?: string
  renter: { id: number; name: string; email: string }
  listing?: { title: string; pricingCurrency?: string }
}

export default function MyListingBookingsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { presentation } = useCurrencyPresentation()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get('/bookings/my-listings?size=100')
      setBookings(response.data.content || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    void fetchBookings()
  }, [authLoading, isAuthenticated, router, fetchBookings])

  const handleConfirm = async (bookingId: number) => {
    try {
      await api.post(`/bookings/${bookingId}/confirm`)
      toast.success('Booking confirmed!')
      fetchBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm booking')
    }
  }

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      await api.post(`/bookings/${bookingId}/cancel`)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
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

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
          Bookings for My Listings
        </h1>

        {bookings.length === 0 ? (
          <div className="card-glass text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              When users book your listings, they&apos;ll appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const cur = getListingCurrencyCode({
                pricingCurrency: booking.currency ?? booking.listing?.pricingCurrency,
              })
              const fmt = (n: number) => formatMoneyAmount(n, cur, presentation)
              return (
              <div key={booking.id} className="card-glass">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {booking.listing?.title || `Listing #${booking.listingId}`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[booking.status] || ''}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        <span>
                          {formatBookingDateRange(booking.startDate, booking.endDate)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Renter</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {booking.renter.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {fmt(booking.totalAmount + booking.deposit)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="btn-outline flex items-center gap-2"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        View & Chat
                      </Link>
                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleConfirm(booking.id)}
                            className="btn-primary flex items-center gap-2"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="btn-outline text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <XCircleIcon className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
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
