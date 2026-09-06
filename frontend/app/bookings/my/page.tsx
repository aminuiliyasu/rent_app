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
import type { Locale } from '@/lib/i18n/translations'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
}

function asBookingList(data: unknown): Booking[] {
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: Booking[] }).content
  }
  return []
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
        const res = await api.get(`/listings/${id}`, { timeout: 8_000, skipRetry: true })
        const title = String(res.data?.title ?? '').trim()
        if (title) titleMap[id] = title
      } catch {
        /* ignore per listing */
      }
    }),
  )
  return titleMap
}

function BookingCard({
  booking,
  listingTitlesById,
  locale,
  viewLabel,
}: {
  booking: Booking
  listingTitlesById: Record<number, string>
  locale: Locale
  viewLabel: string
}) {
  return (
    <div className="card-glass">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {bookedListingTitle(booking, listingTitlesById)}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${STATUS_COLORS[booking.status] || ''}`}>
              {friendlyBookingStatus(booking.status, locale)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-5 w-5 text-blue-500 shrink-0" />
            <span>{formatBookingDateRange(booking.startDate, booking.endDate)}</span>
          </div>
        </div>
        <Link href={`/bookings/${booking.id}`} className="btn-outline shrink-0">
          {viewLabel}
        </Link>
      </div>
    </div>
  )
}

function BookingColumn({
  title,
  subtitle,
  emptyTitle,
  emptyBody,
  errorText,
  loading,
  error,
  bookings,
  listingTitlesById,
  locale,
  viewLabel,
}: {
  title: string
  subtitle: string
  emptyTitle: string
  emptyBody: string
  errorText: string
  loading: boolean
  error: boolean
  bookings: Booking[]
  listingTitlesById: Record<number, string>
  locale: Locale
  viewLabel: string
}) {
  return (
    <section className="min-w-0">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{subtitle}</p>

      {loading ? (
        <div className="card-glass text-center py-10 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-800">
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
          </div>
        </div>
      ) : error ? (
        <div className="card-glass text-center py-10 px-4">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{errorText}</h3>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card-glass text-center py-10 px-4">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{emptyTitle}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{emptyBody}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              listingTitlesById={listingTitlesById}
              locale={locale}
              viewLabel={viewLabel}
            />
          ))}
        </div>
      )}
    </section>
  )
}

type ColumnState = {
  bookings: Booking[]
  error: boolean
  loaded: boolean
}

const LIST_REQUEST = { timeout: 15_000, skipRetry: true } as const
const emptyColumn: ColumnState = { bookings: [], error: false, loaded: false }

export default function MyRentingBookingsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { locale, t } = useLanguage()
  const [renting, setRenting] = useState<ColumnState>(emptyColumn)
  const [lending, setLending] = useState<ColumnState>(emptyColumn)
  const [listingTitlesById, setListingTitlesById] = useState<Record<number, string>>({})
  const [canFetch, setCanFetch] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setCanFetch(true)
      return
    }
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
      return
    }
    const id = window.setTimeout(() => {
      if (localStorage.getItem('accessToken')) setCanFetch(true)
    }, 3_000)
    return () => window.clearTimeout(id)
  }, [authLoading, isAuthenticated, router])

  const fetchBookings = useCallback(async () => {
    const loadOne = async (url: string, failKey: 'bookingRent.loadFailed' | 'bookingLend.loadFailed') => {
      try {
        const res = await api.get(url, LIST_REQUEST)
        return { bookings: asBookingList(res.data), error: false, loaded: true } satisfies ColumnState
      } catch (error) {
        console.error(`Error fetching ${url}:`, error)
        toast.error(t(failKey))
        return { bookings: [], error: true, loaded: true } satisfies ColumnState
      }
    }

    const rentingPromise = loadOne('/bookings/my?size=100', 'bookingRent.loadFailed').then((state) => {
      setRenting(state)
      return state
    })
    const lendingPromise = loadOne('/bookings/my-listings?size=100', 'bookingLend.loadFailed').then((state) => {
      setLending(state)
      return state
    })

    const [rentingState, lendingState] = await Promise.all([rentingPromise, lendingPromise])

    try {
      const titleMap = await hydrateListingTitles([...rentingState.bookings, ...lendingState.bookings])
      if (Object.keys(titleMap).length > 0) {
        setListingTitlesById(titleMap)
      }
    } catch {
      /* titles are optional */
    }
  }, [t])

  useEffect(() => {
    if (!canFetch) return
    void fetchBookings()
  }, [canFetch, fetchBookings])

  if (!canFetch) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-800">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const viewLabel = t('bookingRent.viewBooking')

  return (
    <div className="page-shell pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          {t('bookingHub.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">{t('bookingHub.subtitle')}</p>

        <div className="flex flex-col gap-12">
          <BookingColumn
            title={t('bookingLend.title')}
            subtitle={t('bookingLend.subtitle')}
            emptyTitle={t('bookingLend.emptyTitle')}
            emptyBody={t('bookingLend.emptyBody')}
            errorText={t('bookingLend.loadFailed')}
            loading={!lending.loaded}
            error={lending.error}
            bookings={lending.bookings}
            listingTitlesById={listingTitlesById}
            locale={locale}
            viewLabel={viewLabel}
          />
          <BookingColumn
            title={t('bookingRent.title')}
            subtitle={t('bookingRent.subtitle')}
            emptyTitle={t('bookingRent.emptyTitle')}
            emptyBody={t('bookingRent.emptyBody')}
            errorText={t('bookingRent.loadFailed')}
            loading={!renting.loaded}
            error={renting.error}
            bookings={renting.bookings}
            listingTitlesById={listingTitlesById}
            locale={locale}
            viewLabel={viewLabel}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}
