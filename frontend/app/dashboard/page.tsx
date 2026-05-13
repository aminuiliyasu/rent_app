'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Listing, Booking } from '@/lib/types'
import { formatListingCardPrice } from '@/lib/listingCurrency'
import { useCurrencyPresentation } from '@/contexts/CurrencyPresentationContext'
import toast from 'react-hot-toast'
import { bookedListingTitle, formatBookingDateRange } from '@/lib/bookingUi'
import { 
  CalendarDaysIcon, 
  RectangleStackIcon, 
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

interface DashboardStats {
  activeBookings: number
  totalBookings: number
  myListings: number
  activeListings: number
  unreadMessages: number
}

export default function DashboardPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const { presentation } = useCurrencyPresentation()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [listingTitlesById, setListingTitlesById] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const statsResponse = await api.get('/users/dashboard/stats')
      setStats(statsResponse.data)
      
      const listingsResponse = await api.get('/listings/my?page=0&size=5')
      setMyListings(listingsResponse.data.content || [])
      
      const bookingsResponse = await api.get('/bookings/my?page=0&size=5')
      const recent: Booking[] = bookingsResponse.data.content || []
      const idsToFetch = Array.from(
        new Set(
          recent
            .filter((b) => {
              const t = b.listing?.title
              return b.listingId != null && !(t && String(t).trim())
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
        setListingTitlesById((prev) => ({ ...prev, ...titleMap }))
      }
      setRecentBookings(recent)
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading || !isAuthenticated) {
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

  const hasCreatedListings = (stats?.myListings || 0) > 0

  const statCards = [
    {
      title: 'Active Bookings',
      value: stats?.activeBookings || 0,
      icon: CalendarDaysIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
    },
    ...(hasCreatedListings
      ? [
          {
            title: 'My Listings',
            value: stats?.myListings || 0,
            icon: RectangleStackIcon,
            gradient: 'from-green-500 to-green-600',
            bgGradient: 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30',
          },
        ]
      : []),
    {
      title: 'Unread Messages',
      value: stats?.unreadMessages || 0,
      icon: ChatBubbleLeftRightIcon,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header */}
        <div className="mb-12 animate-slide-down">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-50"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                Welcome back,{' '}
                <span className="gradient-text">{user?.name}!</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
                Here&apos;s what&apos;s happening with your account
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((stat, idx) => (
            <div 
              key={stat.title}
              className="card-glass group hover:scale-105 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className={`text-4xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgGradient} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-8 w-8 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="card-glass animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
                Recent Bookings
              </h2>
              <div className="flex gap-3">
                <Link 
                  href="/bookings/my-listings" 
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
                >
                  My Listing Bookings
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Open a booking — the <strong className="text-gray-700 dark:text-gray-300">Reviews</strong> section explains mutual ratings (after the host marks the rental complete).
            </p>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <Link
                    href={`/bookings/${booking.id}#booking-reviews`}
                    key={booking.id} 
                    className="block p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">
                          {bookedListingTitle(booking, listingTitlesById)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatBookingDateRange(booking.startDate, booking.endDate)}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                        booking.status === 'CONFIRMED' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                        booking.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                        'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDaysIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No bookings yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Start browsing to make your first booking!</p>
              </div>
            )}
          </div>
          
          {/* My Listings */}
          <div className="card-glass animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <RectangleStackIcon className="h-6 w-6 text-green-500" />
                My Listings
              </h2>
              <Link 
                href="/listings/new" 
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Create new
              </Link>
            </div>
            {myListings.length > 0 ? (
              <div className="space-y-4">
                {myListings.map((listing) => {
                  const rateLine = formatListingCardPrice(listing, presentation)
                  return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="block p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {listing.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {listing.categoryName}
                          {rateLine ? (
                            <>
                              {' '}
                              •{' '}
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {rateLine.formatted}
                                {rateLine.suffix}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-500"> • Rates on request</span>
                          )}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                        listing.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                        listing.status === 'DRAFT' ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                        'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                  </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <RectangleStackIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">No listings yet</p>
                <Link href="/listings/new" className="btn-primary inline-flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Create Your First Listing
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
