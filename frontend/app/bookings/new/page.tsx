'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { Listing } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { CalendarIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/solid'

export default function NewBookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dates, setDates] = useState({
    start: searchParams.get('start') || '',
    end: searchParams.get('end') || '',
  })

  const listingId = searchParams.get('listingId')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (!listingId) {
      toast.error('No listing selected')
      router.push('/search')
      return
    }
    fetchListing()
  }, [listingId, isAuthenticated])

  const fetchListing = async () => {
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dates.start || !dates.end) {
      toast.error('Please select both start and end dates')
      return
    }

    const startDate = new Date(dates.start)
    const endDate = new Date(dates.end)

    if (endDate <= startDate) {
      toast.error('End date must be after start date')
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
    if (!dates.start || !dates.end || !listing.priceDay) return 0
    const start = new Date(dates.start)
    const end = new Date(dates.end)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1
    return days * listing.priceDay
  }

  const total = calculateTotal()
  const deposit = listing.deposit || 0
  const platformFee = total * 0.12
  const grandTotal = total + deposit + platformFee

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
          Request to Book
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="card-glass">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {listing.title}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-blue-500" />
                      Start Date
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
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
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

                {(listing.city || listing.address) && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="h-5 w-5 text-blue-500" />
                    <span>{listing.address || `${listing.city}, ${listing.state}`}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !dates.start || !dates.end}
                  className="w-full btn-primary py-4 text-lg font-bold"
                >
                  {submitting ? 'Submitting...' : 'Request to Book'}
                </button>
              </form>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="card-glass sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Price Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rental Fee</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${total.toFixed(2)}
                  </span>
                </div>
                
                {deposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Security Deposit</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ${deposit.toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee (12%)</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${platformFee.toFixed(2)}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <SparklesIcon className="h-4 w-4 inline mr-1 text-blue-500" />
                  You won't be charged until the owner confirms your booking
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
