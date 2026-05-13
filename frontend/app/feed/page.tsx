'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { RentWishPost, Listing, ListingStatus, DeliveryPreference } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import {
  MegaphoneIcon,
  ClockIcon,
  MapPinIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import axios from 'axios'

const BUDGET_MAX_CHARS = 280

const DELIVERY_OPTIONS: { value: DeliveryPreference; label: string; icon: typeof TruckIcon }[] = [
  { value: 'PICKUP', label: 'Pickup', icon: ShoppingBagIcon },
  { value: 'DELIVERY', label: 'Delivery', icon: TruckIcon },
  { value: 'EITHER', label: 'Either works', icon: ChatBubbleLeftRightIcon },
]

function deliveryLabel(pref: DeliveryPreference | null | undefined): string | null {
  if (!pref) return null
  return DELIVERY_OPTIONS.find((d) => d.value === pref)?.label ?? null
}

/** Joins district · city · country, removing duplicates and empty parts. Falls back to legacy `location`. */
function formatPostLocation(post: RentWishPost): string | null {
  const parts = [post.district, post.city, post.country]
    .map((p) => (p ? p.trim() : ''))
    .filter((p): p is string => Boolean(p))
  if (parts.length === 0) {
    const legacy = post.location?.trim()
    return legacy && legacy.length > 0 ? legacy : null
  }
  const seen = new Set<string>()
  const dedup: string[] = []
  for (const part of parts) {
    const k = part.toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      dedup.push(part)
    }
  }
  return dedup.join(', ')
}

function safeExpiresLabel(iso: string | undefined) {
  if (!iso) return 'soon'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'soon'
  return formatDistanceToNow(d, { addSuffix: true })
}

export default function FeedPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<RentWishPost[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [budgetText, setBudgetText] = useState('')
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference | ''>('')

  const [replyTarget, setReplyTarget] = useState<RentWishPost | null>(null)
  const [hostListings, setHostListings] = useState<Listing[]>([])
  const [pickListingId, setPickListingId] = useState('')
  const [listingsLoading, setListingsLoading] = useState(false)
  const [replySending, setReplySending] = useState(false)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/rent-requests/posts?page=0&size=50')
      setPosts(res.data.content || [])
    } catch {
      toast.error('Could not load rent requests')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Add a short title for what you want to rent')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/rent-requests/posts', {
        title: title.trim(),
        description: description.trim() || undefined,
        district: district.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        budgetText: budgetText.trim() || undefined,
        deliveryPreference: deliveryPreference || undefined,
      })
      toast.success('Posted — visible for 24 hours')
      setTitle('')
      setDescription('')
      setDistrict('')
      setCity('')
      setCountry('')
      setBudgetText('')
      setDeliveryPreference('')
      await loadPosts()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message?: string; errors?: Record<string, string> }
        const firstField = data.errors && Object.values(data.errors)[0]
        toast.error(firstField || data.message || 'Could not post — try signing in again')
      } else {
        toast.error('Could not post — try signing in again')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const openReplyModal = async (post: RentWishPost) => {
    setReplyTarget(post)
    setPickListingId('')
    setListingsLoading(true)
    try {
      const res = await api.get('/listings/my?page=0&size=100')
      const content: Listing[] = res.data?.content || []
      const active = content.filter((l) => l.status === ListingStatus.ACTIVE)
      setHostListings(active)
      if (active.length === 1) setPickListingId(String(active[0].id))
    } catch {
      toast.error('Could not load your listings')
      setHostListings([])
    } finally {
      setListingsLoading(false)
    }
  }

  const submitHostReply = async () => {
    if (!replyTarget || !pickListingId) {
      toast.error('Choose one of your listings to reply with')
      return
    }
    setReplySending(true)
    try {
      const res = await api.post(`/rent-requests/posts/${replyTarget.id}/conversation`, {
        listingId: Number(pickListingId),
      })
      toast.success('Messages opened — “request posted” was added for the renter')
      setReplyTarget(null)
      router.push(`/messages?booking=${res.data.id}`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message?: string }
        toast.error(data.message || 'Could not start conversation')
      } else {
        toast.error('Could not start conversation')
      }
    } finally {
      setReplySending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 animate-slide-down">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
            <span className="gradient-text">Rent requests</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
            See what people are looking to rent right now. Each post stays live for{' '}
            <strong className="text-gray-800 dark:text-gray-200">24 hours</strong>, then it disappears from rent requests.
          </p>
        </div>

        {isAuthenticated ? (
          <form
            onSubmit={handleSubmit}
            className="mb-12 p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 shadow-lg backdrop-blur-sm space-y-6"
            noValidate
            aria-label="Create a rent request"
          >
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <MegaphoneIcon className="h-6 w-6 text-blue-500" aria-hidden />
              Post what you&apos;d like to rent
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rent-request-title"
                className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                What do you need? <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                id="rent-request-title"
                name="title"
                type="text"
                required
                autoComplete="off"
                placeholder="e.g DSlr camera for a weekend shoot or plumber for this evening"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="rent-request-title-hint"
              />
              <p id="rent-request-title-hint" className="text-xs text-gray-500 dark:text-gray-400">
                Short name of the item or service you want to rent ({title.length}/200)
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rent-request-details"
                className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                Details <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
              </label>
              <textarea
                id="rent-request-details"
                name="description"
                placeholder="How long you need it, condition, brand, or any other requirements…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full min-h-[5.5rem] max-h-60 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                aria-describedby="rent-request-details-hint"
              />
              <p id="rent-request-details-hint" className="text-xs text-gray-500 dark:text-gray-400">
                {description.length}/2000 characters
              </p>
            </div>

            <div className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <MapPinIcon className="h-5 w-5 text-rose-500" aria-hidden />
                Area <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label htmlFor="rent-request-district" className="sr-only">
                    District or neighbourhood
                  </label>
                  <input
                    id="rent-request-district"
                    name="district"
                    type="text"
                    autoComplete="address-level3"
                    placeholder="District / neighbourhood"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    maxLength={120}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="rent-request-city" className="sr-only">
                    City
                  </label>
                  <input
                    id="rent-request-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    maxLength={120}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="rent-request-country" className="sr-only">
                    Country
                  </label>
                  <input
                    id="rent-request-country"
                    name="country"
                    type="text"
                    autoComplete="country-name"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    maxLength={120}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Helps nearby hosts notice your request. Fill any combination of district, city or country.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rent-request-budget"
                className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" aria-hidden />
                Budget <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
              </label>
              <textarea
                id="rent-request-budget"
                name="budgetText"
                placeholder="Price, currency and total period of time / duration"
                value={budgetText}
                onChange={(e) => setBudgetText(e.target.value)}
                maxLength={BUDGET_MAX_CHARS}
                rows={3}
                className="w-full min-h-[4.5rem] max-h-48 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
                aria-describedby="rent-request-budget-hint"
              />
              <p id="rent-request-budget-hint" className="text-xs text-gray-500 dark:text-gray-400">
                Write your budget in plain words — e.g. &quot;80 USD total for 3 days&quot;. ({budgetText.length}/{BUDGET_MAX_CHARS})
              </p>
            </div>

            <div className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <TruckIcon className="h-5 w-5 text-indigo-500" aria-hidden />
                Delivery or pickup <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
              </span>
              <div
                role="radiogroup"
                aria-label="Delivery preference"
                className="flex flex-wrap gap-2"
              >
                {DELIVERY_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const active = deliveryPreference === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        setDeliveryPreference(active ? '' : opt.value)
                      }
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                          : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tap again to clear. Choose &quot;Either works&quot; if you&apos;re flexible.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto px-8 py-3 disabled:opacity-60"
            >
              {submitting ? 'Posting…' : 'Publish (24h)'}
            </button>
          </form>
        ) : (
          <div className="mb-12 p-6 rounded-2xl bg-gray-100/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Sign in to post what you&apos;re looking to rent.
            </p>
            <Link href="/login" className="btn-primary inline-block px-6 py-2.5">
              Login
            </Link>
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-indigo-500" />
            Live requests
          </h2>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mb-4">
                <div className="animate-spin rounded-full h-7 w-7 border-4 border-white border-t-transparent" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading rent requests…</p>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center py-16 text-gray-500 dark:text-gray-400 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              No active requests in the last 24 hours. Be the first to post.
            </p>
          ) : (
            <ul className="space-y-4">
              {posts.map((post, idx) => (
                <li
                  key={post.id}
                  className="animate-slide-up p-5 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{post.title}</h3>
                  </div>
                  {post.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 whitespace-pre-wrap">{post.description}</p>
                  )}
                  {(post.budgetText || post.deliveryPreference) && (
                    <div className="flex flex-wrap items-start gap-2 mb-3">
                      {post.budgetText && (
                        <span className="inline-flex items-center gap-1.5 max-w-full rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-xs font-semibold">
                          <CurrencyDollarIcon className="h-4 w-4 shrink-0" />
                          <span className="whitespace-pre-wrap break-words font-normal">{post.budgetText}</span>
                        </span>
                      )}
                      {post.deliveryPreference && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 text-xs font-semibold">
                          {post.deliveryPreference === 'DELIVERY' ? (
                            <TruckIcon className="h-4 w-4" />
                          ) : post.deliveryPreference === 'PICKUP' ? (
                            <ShoppingBagIcon className="h-4 w-4" />
                          ) : (
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          )}
                          {deliveryLabel(post.deliveryPreference)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <UserCircleIcon className="h-5 w-5 shrink-0" />
                      {post.authorName}
                    </span>
                    {(() => {
                      const loc = formatPostLocation(post)
                      return loc ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon className="h-5 w-5 shrink-0" />
                          {loc}
                        </span>
                      ) : null
                    })()}
                    <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                      <ClockIcon className="h-5 w-5 shrink-0" />
                      Expires {safeExpiresLabel(post.expiresAt)}
                    </span>
                    {isAuthenticated && user && user.id !== post.authorId && (
                      <button
                        type="button"
                        onClick={() => void openReplyModal(post)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 shrink-0" />
                        Reply in Messages
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {replyTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="live-reply-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-6 space-y-4">
            <h2 id="live-reply-title" className="text-lg font-bold text-gray-900 dark:text-white">
              Reply to live request
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We&apos;ll open your Messages thread with{' '}
              <strong className="text-gray-900 dark:text-gray-200">request posted</strong> — the fixed prompt the
              renter sees (tagged <span className="font-semibold">live request reply</span>). You won&apos;t type a
              message here; you can continue in Messages after.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
              Request: <span className="font-medium text-gray-700 dark:text-gray-300">{replyTarget.title}</span>
            </p>
            {listingsLoading ? (
              <p className="text-sm text-gray-500">Loading your listings…</p>
            ) : hostListings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4 text-center text-sm">
                <p className="text-gray-600 dark:text-gray-400 mb-3">You need an active listing to reply.</p>
                <Link href="/listings/new" className="btn-primary inline-block px-4 py-2 text-sm">
                  Create a listing
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="live-reply-listing" className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Your listing
                </label>
                <select
                  id="live-reply-listing"
                  value={pickListingId}
                  onChange={(e) => setPickListingId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2.5 text-sm"
                >
                  <option value="">Select…</option>
                  {hostListings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-wrap gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                disabled={replySending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitHostReply()}
                disabled={replySending || listingsLoading || hostListings.length === 0 || !pickListingId}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
              >
                {replySending ? 'Opening…' : 'Open Messages'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
