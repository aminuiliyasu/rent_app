'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Booking } from '@/lib/types'
import toast from 'react-hot-toast'
import { bookedListingTitle, formatBookingDateRange, friendlyBookingStatus } from '@/lib/bookingUi'
import DashboardOnboarding from '@/components/DashboardOnboarding'
import DashboardMyListings from '@/components/DashboardMyListings'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  CalendarDaysIcon, 
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  SparklesIcon,
  RectangleStackIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline'

interface DashboardStats {
  activeBookings: number
  totalBookings: number
  myListings: number
  activeListings: number
  unreadMessages: number
}

type HostBooking = Booking & {
  renter?: { name?: string }
}

function bookingStatusClass(status: string): string {
  if (status === 'CONFIRMED') return 'bg-gradient-to-r from-green-400 to-green-500 text-white'
  if (status === 'PENDING') return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
  return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
}

async function hydrateListingTitles(bookings: Booking[]): Promise<Record<number, string>> {
  const idsToFetch = Array.from(
    new Set(
      bookings
        .filter((b) => {
          const title = b.listing?.title
          return b.listingId != null && !(title && String(title).trim())
        })
        .map((b) => Number(b.listingId)),
    ),
  )
  const titleMap: Record<number, string> = {}
  if (idsToFetch.length === 0) return titleMap

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
  return titleMap
}

export default function DashboardPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const { locale, t } = useLanguage()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [rentingBookings, setRentingBookings] = useState<Booking[]>([])
  const [hostingBookings, setHostingBookings] = useState<HostBooking[]>([])
  const [pendingHostingCount, setPendingHostingCount] = useState(0)
  const [listingTitlesById, setListingTitlesById] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('rhentify_welcome') === '1') {
      sessionStorage.removeItem('rhentify_welcome')
      setShowWelcome(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [statsResponse, rentingResponse, hostingResponse] = await Promise.all([
        api.get('/users/dashboard/stats'),
        api.get('/bookings/my?page=0&size=5'),
        api.get('/bookings/my-listings?page=0&size=100'),
      ])

      setStats(statsResponse.data)

      const renting: Booking[] = rentingResponse.data.content || []
      const allHosting: HostBooking[] = hostingResponse.data.content || []
      const titleMap = await hydrateListingTitles([...renting, ...allHosting.slice(0, 5)])

      if (Object.keys(titleMap).length > 0) {
        setListingTitlesById(titleMap)
      }
      setRentingBookings(renting)
      setHostingBookings(allHosting.slice(0, 5))
      setPendingHostingCount(allHosting.filter((b) => b.status === 'PENDING').length)
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      toast.error(t('dashboard.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
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

  if (!isAuthenticated) {
    return null
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

  const statCards = [
    {
      title: t('dashboard.activeBookings'),
      value: stats?.activeBookings || 0,
      icon: CalendarDaysIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
    },
    {
      title: t('dashboard.unreadMessages'),
      value: stats?.unreadMessages || 0,
      icon: ChatBubbleLeftRightIcon,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-100 to-pink-200 dark:from-purple-900/30 dark:to-pink-800/30',
    },
    {
      title: t('dashboard.myListings'),
      value: stats?.myListings || 0,
      icon: RectangleStackIcon,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30',
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
                {t('dashboard.welcome')}{' '}
                <span className="gradient-text">{user?.name}!</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>
        </div>
        
        <DashboardOnboarding
          showWelcome={showWelcome}
          hasListings={(stats?.myListings || 0) > 0}
          hasBookings={(stats?.totalBookings || 0) > 0}
        />

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

        {/* Renting + Hosting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card-glass animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-1 gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
                {t('dashboard.renting')}
              </h2>
              <Link
                href="/bookings/my"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group shrink-0"
              >
                {t('dashboard.viewAll')}
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t('dashboard.rentingSubtitle')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {t('dashboard.reviewsHint')}
            </p>
            {rentingBookings.length > 0 ? (
              <div className="space-y-4">
                {rentingBookings.map((booking) => (
                  <Link
                    href={`/bookings/${booking.id}#booking-reviews`}
                    key={booking.id}
                    className="block p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white mb-1 truncate">
                          {bookedListingTitle(booking, listingTitlesById)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatBookingDateRange(booking.startDate, booking.endDate)}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 ${bookingStatusClass(booking.status)}`}>
                        {friendlyBookingStatus(booking.status, locale)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDaysIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">{t('dashboard.noBookings')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{t('dashboard.noBookingsHint')}</p>
              </div>
            )}
          </div>

          <div className="card-glass animate-slide-up" style={{ animationDelay: '0.45s' }}>
            <div className="flex items-center justify-between mb-1 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HomeModernIcon className="h-6 w-6 text-indigo-500" />
                  {t('dashboard.hosting')}
                </h2>
                {pendingHostingCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white shrink-0">
                    {t('dashboard.pendingRequests', { count: String(pendingHostingCount) })}
                  </span>
                )}
              </div>
              <Link
                href="/bookings/my-listings"
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group shrink-0"
              >
                {t('dashboard.viewAll')}
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {t('dashboard.hostingSubtitle')}
            </p>
            {hostingBookings.length > 0 ? (
              <div className="space-y-4">
                {hostingBookings.map((booking) => (
                  <Link
                    href={`/bookings/${booking.id}`}
                    key={booking.id}
                    className="block p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white mb-1 truncate">
                          {bookedListingTitle(booking, listingTitlesById)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {booking.renter?.name
                            ? `${booking.renter.name} · ${formatBookingDateRange(booking.startDate, booking.endDate)}`
                            : formatBookingDateRange(booking.startDate, booking.endDate)}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 ${bookingStatusClass(booking.status)}`}>
                        {friendlyBookingStatus(booking.status, locale)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HomeModernIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">{t('dashboard.noHosting')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{t('dashboard.noHostingHint')}</p>
              </div>
            )}
          </div>
        </div>

        <DashboardMyListings />
      </div>
      <Footer />
    </div>
  )
}
