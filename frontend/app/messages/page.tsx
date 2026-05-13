'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { MessageResponse, Booking } from '@/lib/types'
import { normalizeReviewSummary, reviewAttentionForInbox } from '@/lib/bookingUi'
import toast from 'react-hot-toast'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  MagnifyingGlassIcon,
  StarIcon as StarIconOutline,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

const POLL_INTERVAL_MS = 8000

function dedupeMessagesById(list: MessageResponse[]): MessageResponse[] {
  const byId = new Map<number, MessageResponse>()
  for (const m of list) {
    if (m && typeof m.id === 'number') byId.set(m.id, m)
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

function initialsOf(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p.charAt(0).toUpperCase()).join('') || '?'
}

function avatarColor(seed: string | number): string {
  const palette = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
  ]
  const s = String(seed)
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return palette[hash % palette.length]
}

function formatBookingRange(start?: string, end?: string): string {
  if (!start || !end) return ''
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function dateSeparatorLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const startOf = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime()
  const diffDays = Math.round((startOf(now) - startOf(d)) / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function MessagesPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [search, setSearch] = useState('')

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const markedReadForRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true)
      const [renterRes, hostRes] = await Promise.all([
        api.get('/bookings/my?page=0&size=50'),
        api.get('/bookings/my-listings?page=0&size=50'),
      ])
      const renterBookings: Booking[] = renterRes.data?.content || []
      const hostBookings: Booking[] = hostRes.data?.content || []

      const map = new Map<number, Booking>()
      for (const b of [...renterBookings, ...hostBookings]) {
        if (b && typeof b.id === 'number') map.set(b.id, b)
      }
      const normalized = Array.from(map.values()).map((b) => {
        const raw = b as unknown as Record<string, unknown>
        const rsRaw = raw.reviewSummary ?? raw.review_summary
        const normalizedSummary = normalizeReviewSummary(rsRaw)
        return normalizedSummary != null ? { ...b, reviewSummary: normalizedSummary } : b
      })
      // Sort so bookings that need YOUR review float to the top.
      const unique = normalized.sort((a, b) => {
        const aNeeds = reviewAttentionForInbox(a.status, a.reviewSummary).needsMyReview ? 0 : 1
        const bNeeds = reviewAttentionForInbox(b.status, b.reviewSummary).needsMyReview ? 0 : 1
        if (aNeeds !== bNeeds) return aNeeds - bNeeds
        const ta = new Date(a.updatedAt || a.createdAt || a.startDate || 0).getTime()
        const tb = new Date(b.updatedAt || b.createdAt || b.startDate || 0).getTime()
        return tb - ta
      })

      setBookings(unique)
      setSelectedBooking((prev) => {
        if (prev && unique.some((b) => b.id === prev.id)) return prev
        return unique[0] || null
      })
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setBookingsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void fetchBookings()
    }
  }, [authLoading, isAuthenticated, fetchBookings])

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  const fetchMessages = useCallback(
    async (bookingId: number, opts?: { quiet?: boolean }) => {
      try {
        const response = await api.get(`/messages/booking/${bookingId}`)
        const incoming: MessageResponse[] = Array.isArray(response.data) ? response.data : []
        setMessages((prev) => dedupeMessagesById([...prev, ...incoming]))
      } catch (error) {
        if (!opts?.quiet) {
          console.error('Error fetching messages:', error)
          toast.error('Failed to load messages')
        }
        return
      }
      if (!markedReadForRef.current.has(bookingId)) {
        markedReadForRef.current.add(bookingId)
        try {
          await api.post(`/messages/booking/${bookingId}/read`)
        } catch (e) {
          console.warn('Mark-as-read failed:', e)
        }
      }
    },
    []
  )

  useEffect(() => {
    setMessages([])
    if (selectedBooking) {
      void fetchMessages(selectedBooking.id)
    }
  }, [selectedBooking, fetchMessages])

  useEffect(() => {
    if (!selectedBooking) return
    const id = selectedBooking.id
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      void fetchMessages(id, { quiet: true })
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [selectedBooking, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const partnerOf = useCallback(
    (booking: Booking | null) => {
      if (!booking || !user) return { name: 'Conversation', id: 0 as number | undefined }
      const isRenter = user.id === booking.renterId
      const name = isRenter
        ? booking.owner?.name || 'Owner'
        : booking.renter?.name || 'Renter'
      const id = isRenter ? booking.ownerId : booking.renterId
      return { name, id }
    },
    [user]
  )

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return bookings
    return bookings.filter((b) => {
      const partner = partnerOf(b).name.toLowerCase()
      const title = (b.listing?.title || '').toLowerCase()
      return partner.includes(q) || title.includes(q) || `booking #${b.id}`.includes(q)
    })
  }, [bookings, search, partnerOf])

  const pendingReviewCount = useMemo(
    () =>
      bookings.filter((b) => reviewAttentionForInbox(b.status, b.reviewSummary).needsMyReview)
        .length,
    [bookings],
  )

  const messageGroups = useMemo(() => {
    const groups: { dateKey: string; label: string; items: MessageResponse[] }[] = []
    for (const m of messages) {
      const d = new Date(m.createdAt)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const last = groups[groups.length - 1]
      if (last && last.dateKey === key) {
        last.items.push(m)
      } else {
        groups.push({ dateKey: key, label: dateSeparatorLabel(m.createdAt), items: [m] })
      }
    }
    return groups
  }, [messages])

  const sendMessage = async () => {
    const text = newMessage.trim()
    if (!text || !selectedBooking || isSending) return
    const bookingId = selectedBooking.id
    setIsSending(true)
    try {
      const response = await api.post('/messages', {
        bookingId,
        content: text,
      })
      const created: MessageResponse | undefined = response.data
      if (created?.id != null) {
        setMessages((prev) => dedupeMessagesById([...prev, created]))
      }
      setNewMessage('')
    } catch (error: unknown) {
      console.error('Error sending message:', error)
      const err = error as { response?: { data?: { message?: string; error?: string } } }
      toast.error(
        err.response?.data?.message || err.response?.data?.error || 'Failed to send message'
      )
    } finally {
      setIsSending(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await sendVoiceNote(audioBlob)
        stream.getTracks().forEach((t) => t.stop())
      }
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const sendVoiceNote = async (audioBlob: Blob) => {
    if (!selectedBooking) return
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, `voice-note-${Date.now()}.webm`)
      const uploadResponse = await api.post('/upload/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (!uploadResponse.data?.url) throw new Error('Upload failed — no URL returned')

      const messageResponse = await api.post('/messages', {
        bookingId: selectedBooking.id,
        content: 'Voice note',
        attachmentUrl: uploadResponse.data.url,
      })
      const created: MessageResponse | undefined = messageResponse.data
      if (created?.id != null) {
        setMessages((prev) => dedupeMessagesById([...prev, created]))
      }
      toast.success('Voice note sent')
    } catch (error: unknown) {
      console.error('Error sending voice note:', error)
      const err = error as { response?: { data?: { error?: string } }; message?: string }
      toast.error(err.response?.data?.error || err.message || 'Failed to send voice note')
    }
  }

  if (authLoading || bookingsLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const selectedPartner = partnerOf(selectedBooking)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Messages
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your booking conversations in one place.
            </p>
          </div>
          {pendingReviewCount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 text-xs font-semibold dark:bg-amber-500/10 dark:border-amber-400/30 dark:text-amber-200">
              <StarIconSolid className="h-4 w-4" />
              {pendingReviewCount} {pendingReviewCount === 1 ? 'review' : 'reviews'} pending from you
            </div>
          )}
        </div>

        {/* Chat shell */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] h-[calc(100vh-14rem)] min-h-[520px]">
            {/* Conversations list */}
            <aside className="flex flex-col border-r border-gray-200 dark:border-gray-800 min-h-0">
              <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search conversations"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredBookings.length > 0 ? (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredBookings.map((booking) => {
                      const partner = partnerOf(booking)
                      const isActive = selectedBooking?.id === booking.id
                      const title = booking.listing?.title || `Booking #${booking.id}`
                      const { needsMyReview, waitingOnPartnerReview } = reviewAttentionForInbox(
                        booking.status,
                        booking.reviewSummary,
                      )
                      return (
                        <li key={booking.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className={`relative w-full text-left px-4 py-3 flex gap-3 items-start transition-colors ${
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                            }`}
                          >
                            {needsMyReview && (
                              <span
                                aria-hidden
                                className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"
                              />
                            )}
                            <div
                              className={`flex-shrink-0 h-10 w-10 rounded-full text-white text-sm font-semibold flex items-center justify-center ${avatarColor(partner.id ?? booking.id)}`}
                            >
                              {initialsOf(partner.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {partner.name}
                                </p>
                                <span
                                  className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                                    booking.status === 'CONFIRMED'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                      : booking.status === 'PENDING'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                  }`}
                                >
                                  {booking.status.toLowerCase()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {title}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                  {formatBookingRange(booking.startDate, booking.endDate)}
                                </p>
                                {needsMyReview && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold dark:bg-amber-500/20 dark:text-amber-200">
                                    <StarIconSolid className="h-3 w-3" />
                                    Needs your review
                                  </span>
                                )}
                                {waitingOnPartnerReview && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-800 px-2 py-0.5 text-[10px] font-bold dark:bg-violet-500/20 dark:text-violet-200">
                                    <StarIconOutline className="h-3 w-3" />
                                    Waiting on them
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {bookings.length === 0 ? 'No conversations yet' : 'No matches'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {bookings.length === 0
                        ? 'Start a booking to begin messaging.'
                        : 'Try a different search.'}
                    </p>
                  </div>
                )}
              </div>
            </aside>

            {/* Conversation pane */}
            <section className="flex flex-col min-h-0">
              {selectedBooking ? (
                <>
                  {/* Conversation header */}
                  <header className="border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 px-5 py-3">
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-full text-white text-sm font-semibold flex items-center justify-center ${avatarColor(selectedPartner.id ?? selectedBooking.id)}`}
                      >
                        {initialsOf(selectedPartner.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {selectedPartner.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {selectedBooking.listing?.title || `Booking #${selectedBooking.id}`}
                        </p>
                      </div>
                      <Link
                        href={`/bookings/${selectedBooking.id}`}
                        className="hidden sm:inline-flex text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View booking
                      </Link>
                    </div>
                    {(() => {
                      const { needsMyReview, waitingOnPartnerReview } = reviewAttentionForInbox(
                        selectedBooking.status,
                        selectedBooking.reviewSummary,
                      )
                      if (needsMyReview) {
                        return (
                          <div className="mx-3 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100">
                            <div className="flex items-start gap-2 min-w-0">
                              <StarIconSolid className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="font-semibold leading-tight">
                                  You haven&apos;t reviewed this booking yet
                                </p>
                                <p className="text-xs text-amber-800/80 dark:text-amber-100/80 mt-0.5">
                                  Rate your experience with {selectedPartner.name}. {''}
                                  {selectedBooking.reviewSummary?.awaitingPartnerReview
                                    ? 'They\u2019re waiting on you.'
                                    : 'Reviews unlock for both of you after you submit.'}
                                </p>
                              </div>
                            </div>
                            <Link
                              href={`/bookings/${selectedBooking.id}#booking-reviews`}
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                            >
                              <StarIconSolid className="h-4 w-4" />
                              Leave review
                            </Link>
                          </div>
                        )
                      }
                      if (waitingOnPartnerReview) {
                        return (
                          <div className="mx-3 mb-3 flex items-start gap-2 rounded-xl border border-violet-300 bg-violet-50 px-3 py-2.5 text-sm text-violet-900 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-violet-100">
                            <StarIconOutline className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">
                                Waiting on {selectedPartner.name}&apos;s review
                              </p>
                              <p className="text-xs text-violet-800/80 dark:text-violet-100/80 mt-0.5">
                                Your review is in. Both reviews appear after they submit theirs.
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </header>

                  {/* Messages */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 bg-gray-50 dark:bg-gray-950/40"
                  >
                    {messageGroups.length > 0 ? (
                      messageGroups.map((group) => (
                        <div key={group.dateKey} className="mb-4">
                          <div className="flex items-center justify-center my-3">
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full px-3 py-1">
                              {group.label}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {group.items.map((message) => {
                              const isMine = message.senderId === user?.id
                              const isVoice =
                                !!message.attachmentUrl &&
                                (message.attachmentUrl.includes('voice') ||
                                  message.content === 'Voice note')
                              const isLiveReply = message.messageKind === 'LIVE_REQUEST_REPLY'
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2 ${
                                      isMine
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                                    }`}
                                  >
                                    {isLiveReply && (
                                      <p
                                        className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${
                                          isMine
                                            ? 'text-blue-100'
                                            : 'text-amber-600 dark:text-amber-400'
                                        }`}
                                      >
                                        live request reply
                                      </p>
                                    )}
                                    {isVoice ? (
                                      <audio
                                        controls
                                        className="max-w-full"
                                        style={{ maxWidth: '260px' }}
                                      >
                                        <source src={message.attachmentUrl} type="audio/webm" />
                                        <source src={message.attachmentUrl} type="audio/mpeg" />
                                        <source src={message.attachmentUrl} type="audio/wav" />
                                        Your browser does not support audio playback.
                                      </audio>
                                    ) : (
                                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {message.content}
                                      </p>
                                    )}
                                    <p
                                      className={`text-[10px] mt-1 text-right ${
                                        isMine
                                          ? 'text-blue-100/80'
                                          : 'text-gray-400 dark:text-gray-500'
                                      }`}
                                    >
                                      {timeLabel(message.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            No messages yet
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Say hi to start the conversation.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Composer */}
                  <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-3">
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onMouseLeave={() => isRecording && stopRecording()}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        title="Hold to record voice note"
                        className={`shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full transition-colors ${
                          isRecording
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <MicrophoneIcon className="h-5 w-5" />
                      </button>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            void sendMessage()
                          }
                        }}
                        placeholder="Type a message"
                        rows={1}
                        disabled={isSending}
                        className="flex-1 resize-none max-h-32 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => void sendMessage()}
                        disabled={!newMessage.trim() || isSending}
                        className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                      >
                        <PaperAirplaneIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {isRecording && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-2 px-1">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        Recording… release to send
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                  <div className="text-center max-w-sm">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select a conversation
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Pick a booking on the left to view its messages.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
