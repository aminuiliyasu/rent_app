'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { toAppListingImageUrl } from '@/lib/listingImageUrl'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingFlowTimeline from '@/components/BookingFlowTimeline'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { Call, CallType, Booking as BookingType, BookingReviewSummary } from '@/lib/types'
import CallModal from '@/components/CallModal'
import {
  bookedListingTitle,
  friendlyBookingStatus,
  formatBookingDateRange,
  normalizeReviewSummary,
  ratingWords,
  timelineStepFromStatus,
} from '@/lib/bookingUi'
import { formatMoneyAmount, getListingCurrencyCode } from '@/lib/listingCurrency'
import { useCurrencyPresentation } from '@/contexts/CurrencyPresentationContext'

function nameInitials(name: string | undefined) {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] || '')).toUpperCase()
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { presentation } = useCurrencyPresentation()
  const [booking, setBooking] = useState<BookingType | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [activeCall, setActiveCall] = useState<Call | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    void fetchBooking()
    void fetchMessages()
    // fetchBooking / fetchMessages are intentionally stable per params.id load
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid re-fetch loops from non-memoized fetch fns
  }, [params.id, authLoading, isAuthenticated, router])

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${params.id}`)
      const data = response.data as BookingType & { review_summary?: unknown }
      const embeddedRaw = data.reviewSummary ?? data.review_summary
      let reviewSummary =
        normalizeReviewSummary(embeddedRaw) ?? (embeddedRaw as BookingReviewSummary | undefined)

      if (data.status === 'COMPLETED') {
        try {
          const rs = await api.get(`/bookings/${params.id}/review-summary`)
          const fromApi =
            normalizeReviewSummary(rs.data) ?? (rs.data as BookingReviewSummary | undefined)
          if (fromApi != null) {
            reviewSummary = fromApi
          }
        } catch (e) {
          console.error('Could not load review summary:', e)
        }
      }

      let hydratedListing = data.listing
      if (
        data.listingId != null &&
        (!hydratedListing || !hydratedListing.title || !hydratedListing.title.trim())
      ) {
        try {
          const listingRes = await api.get(`/listings/${data.listingId}`)
          hydratedListing = listingRes.data
        } catch (e) {
          console.warn('Could not hydrate listing title for booking detail:', e)
        }
      }

      setBooking({
        ...data,
        listing: hydratedListing,
        reviewSummary: reviewSummary ?? undefined,
      })
    } catch (error) {
      console.error('Error fetching booking:', error)
      toast.error('Failed to load booking')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/booking/${params.id}`)
      setMessages(response.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !booking) return

    setSendingMessage(true)
    try {
      await api.post('/messages', {
        bookingId: booking.id,
        receiverId: user?.id === booking.renterId ? booking.ownerId : booking.renterId,
        content: newMessage,
      })
      setNewMessage('')
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const initiateCall = async (callType: CallType) => {
    if (!booking || !user) return

    try {
      const receiverId = user.id === booking.renterId 
        ? booking.ownerId 
        : booking.renterId

      const response = await api.post('/calls/initiate', {
        receiverId: receiverId,
        type: callType,
        bookingId: booking.id
      })

      setActiveCall(response.data)
    } catch (error: any) {
      console.error('Error initiating call:', error)
      toast.error(error.response?.data?.message || 'Failed to initiate call')
    }
  }

  const handleConfirm = async () => {
    if (!booking) return
    try {
      await api.post(`/bookings/${booking.id}/confirm`)
      toast.success('Booking confirmed!')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm booking')
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      await api.post(`/bookings/${booking.id}/cancel`)
      toast.success('Booking cancelled')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const handleStartRental = async () => {
    if (!booking) return
    try {
      await api.post(`/bookings/${booking.id}/start`)
      toast.success('Rental marked as in progress')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update rental')
    }
  }

  const handleCompleteRental = async () => {
    if (!booking) return
    if (!confirm('Mark this rental as complete? You can leave reviews after this.')) return
    try {
      await api.post(`/bookings/${booking.id}/complete`)
      toast.success('Rental completed — you can both leave reviews now')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not complete rental')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return
    setSubmittingReview(true)
    try {
      await api.post(`/bookings/${booking.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      })
      toast.success('Thank you for your feedback!')
      setReviewComment('')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not submit review')
    } finally {
      setSubmittingReview(false)
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

  if (!booking) return null

  const bookingCur = getListingCurrencyCode({
    pricingCurrency: booking.currency ?? booking.listing?.pricingCurrency,
  })
  const fmtBooking = (n: number) => formatMoneyAmount(n, bookingCur, presentation)

  const isOwner = user?.id === booking.ownerId
  const isRenter = user?.id === booking.renterId
  const canApprove = isOwner && booking.status === 'PENDING'
  const canCancel = (isOwner || isRenter) && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
  const canStartRental = isOwner && booking.status === 'CONFIRMED'
  const canCompleteRental =
    isOwner && (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS')

  const partnerName = isOwner
    ? booking.renter?.name ?? 'the renter'
    : booking.owner?.name ?? 'the owner'

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    DISPUTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  }

  const rs = booking.reviewSummary
  const flowStep = timelineStepFromStatus(booking.status)
  const listingImage = toAppListingImageUrl(
    booking.listing?.primaryImageUrl || booking.listing?.imageUrls?.[0],
  )
  const partner = isOwner ? booking.renter : booking.owner
  const partnerEmail = partner?.email ?? ''
  const partnerDisplay = partner?.name ?? '—'
  const bookedItemTitle = bookedListingTitle(booking)

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 pt-16 sm:pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        {/* Hero: role + listing + progress */}
        <div className="mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/60 bg-gradient-to-br from-white to-blue-50/80 shadow-xl shadow-blue-500/5 dark:border-gray-700/50 dark:from-gray-900 dark:to-slate-900/90">
          <div className="grid gap-4 p-4 sm:gap-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide ${statusColors[booking.status] || ''}`}
                >
                  {friendlyBookingStatus(booking.status)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    isOwner
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-300'
                  }`}
                >
                  {isOwner ? 'You are the host' : 'You are renting'}
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                {bookedItemTitle}
              </h1>
              <p className="hidden sm:block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Booked item: <span className="text-gray-700 dark:text-gray-200">{bookedItemTitle}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 sm:line-clamp-none">
                {isOwner
                  ? `${partnerDisplay} wants to rent your item for these dates. Keep everything in one thread below.`
                  : `You’re booking from ${partnerDisplay}. Message them anytime about pickup or details.`}
              </p>
              {(booking.listing?.city || booking.listing?.address) && (
                <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPinIcon className="h-4 w-4 shrink-0 text-blue-500" />
                  {booking.listing?.address || [booking.listing?.city, booking.listing?.state].filter(Boolean).join(', ')}
                </p>
              )}
              <div className="pt-2">
                <BookingFlowTimeline status={booking.status} activeStep={flowStep} />
              </div>
            </div>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[180px] shrink-0 overflow-hidden rounded-xl sm:max-w-[220px] sm:rounded-2xl bg-gray-100 shadow-inner dark:bg-gray-800 md:mx-0 md:max-w-[260px]">
              {listingImage ? (
                <Image src={listingImage} alt="" fill className="object-cover" sizes="260px" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-400">
                  Listing photo
                </div>
              )}
              {booking.listing?.id != null && (
                <Link
                  href={`/listings/${booking.listing.id}`}
                  className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 to-transparent p-3 text-center text-sm font-semibold text-white opacity-0 transition hover:opacity-100"
                >
                  View listing
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="flex flex-col gap-5 sm:gap-6 lg:col-span-2 order-2 lg:order-1">
            <div className="card-glass order-3 lg:order-none">
              <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Dates &amp; price</h2>
              <div className="flex flex-wrap items-center gap-2 text-gray-700 dark:text-gray-300">
                <CalendarIcon className="h-5 w-5 shrink-0 text-blue-500" />
                <span className="font-medium">
                  {formatBookingDateRange(booking.startDate, booking.endDate, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="mt-6 grid gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50/80 p-4 dark:bg-gray-900/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Rental total</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{fmtBooking(booking.totalAmount)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50/80 p-4 dark:bg-gray-900/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {booking.deposit > 0 ? 'With security deposit' : 'Due now'}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {fmtBooking(booking.totalAmount + booking.deposit)}
                  </p>
                  {booking.deposit > 0 && (
                    <p className="mt-1 text-xs text-gray-500">Includes {fmtBooking(booking.deposit)} deposit</p>
                  )}
                </div>
              </div>

              {canApprove && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="btn-primary flex flex-1 items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Approve request
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-outline flex flex-1 items-center justify-center gap-2 border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    Decline
                  </button>
                </div>
              )}

              {canCancel && !canApprove && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline mt-6 w-full border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Cancel this booking
                </button>
              )}
            </div>

            {(canStartRental || canCompleteRental) && (
              <div className="card-glass border border-emerald-200/60 dark:border-emerald-900/40 order-4 lg:order-none">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Host checklist</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {booking.status === 'CONFIRMED'
                    ? 'Optional: mark when handoff happens. When the rental is fully returned or finished, mark complete — then both of you can leave private reviews.'
                    : 'When everything is wrapped up, mark complete to unlock reviews for you and the renter.'}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {canStartRental && (
                    <button type="button" onClick={handleStartRental} className="btn-secondary text-sm">
                      We started the rental
                    </button>
                  )}
                  {canCompleteRental && (
                    <button type="button" onClick={handleCompleteRental} className="btn-primary text-sm">
                      Mark rental complete
                    </button>
                  )}
                </div>
              </div>
            )}

            {isRenter && (booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && (
              <div className="rounded-2xl border border-sky-200/80 bg-sky-50/50 px-5 py-4 dark:border-sky-900/50 dark:bg-sky-950/20 order-5 lg:order-none">
                <p className="text-sm leading-relaxed text-sky-950 dark:text-sky-100">
                  Your host updates progress here. Use <strong>Messages</strong> below to agree on pickup, return time, or ask questions — everything stays on the record.
                </p>
              </div>
            )}

            <div className="card-glass overflow-hidden p-0 lg:hidden order-1 lg:order-none">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
                  {nameInitials(partner?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {isOwner ? 'Your guest' : 'Your host'}
                  </p>
                  <p className="truncate text-base font-bold text-gray-900 dark:text-white">{partnerDisplay}</p>
                </div>
                {partner?.id != null && (
                  <Link
                    href={`/users/${partner.id}`}
                    className="shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                  >
                    Profile
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-gray-200 px-3 py-2 dark:border-gray-700">
                <Link href="#booking-messages" className="btn-primary py-2.5 text-center text-xs">
                  Messages
                </Link>
                <Link href="#booking-reviews" className="btn-secondary py-2.5 text-center text-xs">
                  Reviews
                </Link>
              </div>
            </div>

            {/* Messages first for visibility */}
            <div className="card-glass overflow-hidden p-0 scroll-mt-24 order-2 lg:order-none" id="booking-messages">
              <div className="border-b border-gray-200/80 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 px-4 py-4 sm:px-6 sm:py-5 dark:border-gray-700 dark:from-blue-950/40 dark:to-indigo-950/30">
                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 shrink-0" />
                      <span className="truncate">Messages with {partnerDisplay}</span>
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      One thread for this booking — coordinate pickup, returns, and questions.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Link href="/messages" className="btn-secondary px-2 py-2.5 text-center text-xs sm:text-sm">
                      Inbox
                    </Link>
                    <button
                      type="button"
                      onClick={() => initiateCall(CallType.VIDEO)}
                      className="rounded-xl bg-emerald-500 px-2 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600"
                    >
                      Video
                    </button>
                    <button
                      type="button"
                      onClick={() => initiateCall(CallType.AUDIO)}
                      className="rounded-xl bg-blue-500 px-2 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:bg-blue-600"
                    >
                      Voice
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-4 py-4 sm:px-6 sm:py-5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Quick replies</p>
                <div className="flex flex-wrap gap-2">
                  {['Thanks!', 'On my way', 'Can we adjust pickup time?', 'Returned safely'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setNewMessage(q)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-600"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[40vh] max-h-[55vh] sm:max-h-[28rem] space-y-4 overflow-y-auto overscroll-contain px-4 pb-2 sm:px-6">
                {messages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center dark:border-gray-700 dark:bg-gray-900/30">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">Say hello</p>
                    <p className="mt-1 text-sm text-gray-500">Introduce yourself and confirm details — it helps everyone feel confident.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const mine = msg.senderId === user?.id
                    return (
                      <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[90%] sm:max-w-[75%]">
                          <div className={`mb-1 flex items-center gap-2 px-1 text-xs ${mine ? 'justify-end' : 'justify-start'}`}>
                            <span className={mine ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}>
                              {mine ? 'You' : msg.sender?.name || 'User'}
                            </span>
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-sm ${
                              mine
                                ? 'rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                                : 'rounded-bl-md border border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`mt-2 text-xs ${mine ? 'text-blue-100/90' : 'text-gray-500 dark:text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={sendMessage} className="space-y-3 border-t border-gray-200 bg-gray-50/80 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-gray-700 dark:bg-gray-900/40 sm:px-6 sm:py-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${partnerDisplay}…`}
                    className="input-field flex-1 rounded-2xl border-0 bg-white text-base sm:text-sm dark:bg-gray-800 min-h-[44px]"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="btn-primary rounded-2xl px-6 sm:px-8 min-h-[44px]"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>

            {/* Reviews */}
            <div
              className="scroll-mt-28 overflow-hidden rounded-3xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 shadow-xl shadow-amber-500/10 dark:border-amber-900/40 dark:from-amber-950/30 dark:via-gray-900 dark:to-orange-950/20 order-6 lg:order-none"
              id="booking-reviews"
            >
              <div className="border-b border-amber-200/60 bg-amber-100/40 px-6 py-5 dark:border-amber-900/50 dark:bg-amber-950/30">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                  <StarIcon className="h-8 w-8 text-amber-400" />
                  Mutual reviews
                </h2>
                <p className="mt-1 text-sm text-amber-950/80 dark:text-amber-100/90">
                  Fair for renters and hosts: ratings go live only after both sides share theirs.
                </p>
              </div>
              <div className="space-y-5 p-6 sm:p-8">
                {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && booking.status !== 'DISPUTED' && (
                  <div className="rounded-2xl border border-amber-200/80 bg-white/70 px-4 py-3 dark:border-amber-900/50 dark:bg-gray-900/60">
                    <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                      After the host marks the rental <span className="font-semibold text-amber-800 dark:text-amber-300">complete</span>, you
                      and {partnerName} each rate the experience. Nothing shows on the listing until <strong>both</strong> reviews are in — then
                      they appear together.
                    </p>
                  </div>
                )}

                {booking.status === 'PENDING' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reviews unlock after the host approves and later completes the rental.
                  </p>
                )}

                {(booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You’ll rate each other here once the host marks the rental complete.
                  </p>
                )}

                {booking.status === 'CANCELLED' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled bookings can’t be reviewed.</p>
                )}

                {booking.status === 'DISPUTED' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reviews wait until this dispute is resolved.</p>
                )}

                {booking.status === 'COMPLETED' && !rs && (
                  <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <p className="text-sm text-amber-950 dark:text-amber-100">
                      Review status couldn&apos;t be loaded. Check your connection and try again.
                    </p>
                    <button
                      type="button"
                      onClick={() => void fetchBooking()}
                      className="btn-secondary mt-3 px-4 py-2 text-sm"
                    >
                      Reload reviews
                    </button>
                  </div>
                )}

                {booking.status === 'COMPLETED' && rs && (
                  <>
                    {rs.canSubmitReview && (
                      <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            How was it with {partnerName}?
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {isOwner ? 'Your feedback helps other hosts trust great renters.' : 'Honest ratings keep the community safe.'}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/80 p-6 shadow-inner dark:bg-gray-900/50">
                          <p className="mb-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">Tap the stars</p>
                          <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setReviewRating(n)}
                                className="rounded-xl p-2 transition hover:bg-amber-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                                aria-label={`${n} stars`}
                              >
                                {n <= reviewRating ? (
                                  <StarIcon className="h-11 w-11 text-amber-400 drop-shadow-sm" />
                                ) : (
                                  <StarOutlineIcon className="h-11 w-11 text-gray-300 dark:text-gray-600" />
                                )}
                              </button>
                            ))}
                          </div>
                          <p className="mt-4 text-center text-lg font-semibold text-amber-800 dark:text-amber-200">
                            {ratingWords(reviewRating)} · {reviewRating} of 5
                          </p>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Optional — what should others know? (pickup, communication, condition…)"
                            rows={4}
                            maxLength={2000}
                            className="input-field mt-5 w-full min-h-[110px] resize-y rounded-2xl"
                          />
                          <button type="submit" disabled={submittingReview} className="btn-primary mt-4 w-full sm:w-auto">
                            {submittingReview ? 'Submitting…' : 'Submit private review'}
                          </button>
                        </div>
                      </form>
                    )}

                    {rs.awaitingPartnerReview && rs.myReview && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-4 dark:border-amber-800 dark:bg-amber-950/40">
                        <p className="font-semibold text-amber-950 dark:text-amber-100">Saved — thank you.</p>
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <StarIcon
                              key={n}
                              className={`h-6 w-6 ${n <= rs.myReview!.rating ? 'text-amber-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="mt-3 text-sm text-amber-900 dark:text-amber-200/90">
                          When {partnerName} submits theirs, both reviews appear on the listing together.
                        </p>
                      </div>
                    )}

                    {rs.bothReviewsVisible && rs.myReview && rs.partnerReview && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/70">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">What you shared</p>
                          <div className="mt-2 flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <StarIcon
                                key={n}
                                className={`h-5 w-5 ${n <= rs.myReview!.rating ? 'text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          {rs.myReview.comment && (
                            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{rs.myReview.comment}</p>
                          )}
                        </div>
                        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5 shadow-sm dark:border-blue-900 dark:bg-blue-950/40">
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                            {partnerName}&apos;s notes about you
                          </p>
                          <div className="mt-2 flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <StarIcon
                                key={n}
                                className={`h-5 w-5 ${n <= rs.partnerReview!.rating ? 'text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          {rs.partnerReview.comment && (
                            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{rs.partnerReview.comment}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {!rs.canSubmitReview &&
                      !rs.awaitingPartnerReview &&
                      !rs.bothReviewsVisible &&
                      !rs.myReview && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          If you already submitted, try refreshing. Otherwise reviews open when the booking is completed.
                        </p>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1 order-1 lg:order-2 hidden lg:block">
            <div className="card-glass sticky top-24 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {isOwner ? 'Your guest' : 'Your host'}
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg">
                    {nameInitials(partner?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-gray-900 dark:text-white">{partnerDisplay}</p>
                    {partnerEmail && (
                      <a href={`mailto:${partnerEmail}`} className="truncate text-sm text-blue-600 hover:underline dark:text-blue-400">
                        {partnerEmail}
                      </a>
                    )}
                    {partner?.id != null && (
                      <Link
                        href={`/users/${partner.id}`}
                        className="mt-2 inline-flex text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Profile &amp; reviews →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <Link href="#booking-messages" className="btn-primary block w-full py-3 text-center text-sm">
                Jump to messages
              </Link>
              <Link href="#booking-reviews" className="btn-secondary block w-full py-3 text-center text-sm">
                Jump to reviews
              </Link>
            </div>
          </aside>
        </div>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
      
      {/* Call Modal */}
      {activeCall && (
        <CallModal
          call={activeCall}
          currentUserId={user?.id || 0}
          onEnd={() => setActiveCall(null)}
          onAnswer={() => {
            // Call will be updated via WebSocket
          }}
          onReject={() => setActiveCall(null)}
        />
      )}
    </div>
  )
}
