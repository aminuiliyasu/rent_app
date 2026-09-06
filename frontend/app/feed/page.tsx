'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { RentWishPost, Listing, ListingStatus, ListingType, DeliveryPreference, DepositPreference, RentWishRequestType } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import type { TranslationKey } from '@/lib/i18n/translations'
import { formatDistanceToNow } from 'date-fns'
import { enUS, hu as huLocale } from 'date-fns/locale'
import {
  MegaphoneIcon,
  ClockIcon,
  MapPinIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  KeyIcon,
  NoSymbolIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import axios from 'axios'

const BUDGET_MAX_CHARS = 280
const DEPOSIT_NOTE_MAX_CHARS = 120
const TIMING_MAX_CHARS = 120

type RentWishVisibilityHours = 12 | 24
type RequestTypeFilter = 'ALL' | RentWishRequestType

const REQUEST_TYPES = new Set<RentWishRequestType>(['ITEM', 'WORKER'])

const DEPOSIT_BADGE_KEYS: Record<DepositPreference, TranslationKey> = {
  NONE: 'feed.depositBadgeNone',
  CASH: 'feed.depositBadgeCash',
  ITEM: 'feed.depositBadgeItem',
  FLEXIBLE: 'feed.depositBadgeFlexible',
}

const DEPOSIT_VALUES = new Set<DepositPreference>(['NONE', 'CASH', 'ITEM', 'FLEXIBLE'])

function asDepositPreference(raw: unknown): DepositPreference | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const upper = raw.trim().toUpperCase() as DepositPreference
  return DEPOSIT_VALUES.has(upper) ? upper : null
}

type RawRentWishPost = RentWishPost & {
  request_type?: string | null
  timing_note?: string | null
  deposit_preference?: string | null
  deposit_note?: string | null
  delivery_preference?: string | null
  budget_text?: string | null
}

function asRequestType(raw: unknown): RentWishRequestType {
  if (typeof raw !== 'string' || !raw.trim()) return 'ITEM'
  const upper = raw.trim().toUpperCase()
  return REQUEST_TYPES.has(upper as RentWishRequestType) ? (upper as RentWishRequestType) : 'ITEM'
}

function normalizeRentWishPost(raw: RawRentWishPost): RentWishPost {
  return {
    ...raw,
    requestType: asRequestType(raw.requestType ?? raw.request_type),
    timingNote: raw.timingNote ?? raw.timing_note ?? null,
    budgetText: raw.budgetText ?? raw.budget_text ?? null,
    deliveryPreference: (raw.deliveryPreference ?? raw.delivery_preference ?? null) as
      | DeliveryPreference
      | null,
    depositPreference: asDepositPreference(raw.depositPreference ?? raw.deposit_preference),
    depositNote: raw.depositNote ?? raw.deposit_note ?? null,
  }
}

const metaPillClass =
  'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold leading-tight'

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

export default function FeedPage() {
  const { isAuthenticated, user } = useAuth()
  const { t, locale } = useLanguage()
  const router = useRouter()
  const [posts, setPosts] = useState<RentWishPost[]>([])
  const [typeFilter, setTypeFilter] = useState<RequestTypeFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [requestType, setRequestType] = useState<RentWishRequestType>('ITEM')
  const [title, setTitle] = useState('')
  const [timingNote, setTimingNote] = useState('')
  const [description, setDescription] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [budgetText, setBudgetText] = useState('')
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference | ''>('')
  const [depositPreference, setDepositPreference] = useState<DepositPreference | ''>('')
  const [depositNote, setDepositNote] = useState('')
  const [visibilityHours, setVisibilityHours] = useState<RentWishVisibilityHours>(12)

  const [replyTarget, setReplyTarget] = useState<RentWishPost | null>(null)
  const [hostListings, setHostListings] = useState<Listing[]>([])
  const [pickListingId, setPickListingId] = useState('')
  const [listingsLoading, setListingsLoading] = useState(false)
  const [replySending, setReplySending] = useState(false)

  const dateFnsLocale = locale === 'hu' ? huLocale : enUS

  const isWorkerRequest = requestType === 'WORKER'

  const filteredPosts = useMemo(() => {
    if (typeFilter === 'ALL') return posts
    return posts.filter((p) => (p.requestType ?? 'ITEM') === typeFilter)
  }, [posts, typeFilter])

  const typeFilterOptions = useMemo(
    () =>
      [
        { value: 'ALL' as RequestTypeFilter, label: t('feed.filterAll') },
        { value: 'ITEM' as RequestTypeFilter, label: t('feed.filterItems') },
        { value: 'WORKER' as RequestTypeFilter, label: t('feed.filterServices') },
      ],
    [t],
  )

  const requestTypeOptions = useMemo(
    () =>
      [
        { value: 'ITEM' as RentWishRequestType, label: t('feed.typeItem'), icon: CubeIcon },
        { value: 'WORKER' as RentWishRequestType, label: t('feed.typeWorker'), icon: WrenchScrewdriverIcon },
      ],
    [t],
  )

  const visibilityOptions = useMemo(
    () =>
      [
        { value: 12 as RentWishVisibilityHours, label: t('feed.visibility12') },
        { value: 24 as RentWishVisibilityHours, label: t('feed.visibility24') },
      ],
    [t],
  )

  const deliveryOptions = useMemo(
    () =>
      [
        { value: 'PICKUP' as DeliveryPreference, label: t('feed.deliveryPickup'), icon: ShoppingBagIcon },
        { value: 'DELIVERY' as DeliveryPreference, label: t('feed.deliveryDelivery'), icon: TruckIcon },
        { value: 'EITHER' as DeliveryPreference, label: t('feed.deliveryEither'), icon: ChatBubbleLeftRightIcon },
      ],
    [t],
  )

  const depositOptions = useMemo(
    () =>
      [
        { value: 'NONE' as DepositPreference, label: t('feed.depositNone'), icon: NoSymbolIcon },
        { value: 'CASH' as DepositPreference, label: t('feed.depositCash'), icon: BanknotesIcon },
        { value: 'ITEM' as DepositPreference, label: t('feed.depositItem'), icon: KeyIcon },
        { value: 'FLEXIBLE' as DepositPreference, label: t('feed.depositFlexible'), icon: ChatBubbleLeftRightIcon },
      ],
    [t],
  )

  const deliveryLabel = useCallback(
    (pref: DeliveryPreference | null | undefined) => {
      if (!pref) return null
      return deliveryOptions.find((d) => d.value === pref)?.label ?? null
    },
    [deliveryOptions],
  )

  const depositBadgeText = useCallback(
    (pref: DepositPreference, note?: string | null) => {
      const base = t(DEPOSIT_BADGE_KEYS[pref])
      const trimmed = note?.trim()
      if (trimmed && (pref === 'CASH' || pref === 'ITEM')) {
        return `${base} · ${trimmed}`
      }
      return base
    },
    [t],
  )

  const depositIcon = useCallback(
    (pref: DepositPreference | null | undefined) => {
      if (!pref) return BanknotesIcon
      return depositOptions.find((d) => d.value === pref)?.icon ?? BanknotesIcon
    },
    [depositOptions],
  )

  const safeExpiresLabel = useCallback(
    (iso: string | undefined) => {
      if (!iso) return t('feed.expiresSoon')
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return t('feed.expiresSoon')
      return formatDistanceToNow(d, { addSuffix: true, locale: dateFnsLocale })
    },
    [dateFnsLocale, t],
  )

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/rent-requests/posts?page=0&size=50')
      const content = (res.data.content || []) as RawRentWishPost[]
      setPosts(content.map(normalizeRentWishPost))
    } catch {
      toast.error(t('feed.toast.loadFailed'))
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error(t('feed.toast.titleRequired'))
      return
    }
    setSubmitting(true)
    try {
      await api.post('/rent-requests/posts', {
        requestType,
        title: title.trim(),
        timingNote: isWorkerRequest && timingNote.trim() ? timingNote.trim() : undefined,
        description: description.trim() || undefined,
        district: district.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        budgetText: budgetText.trim() || undefined,
        deliveryPreference: !isWorkerRequest && deliveryPreference ? deliveryPreference : undefined,
        depositPreference: !isWorkerRequest && depositPreference ? depositPreference : undefined,
        depositNote:
          !isWorkerRequest &&
          depositNote.trim() &&
          (depositPreference === 'CASH' || depositPreference === 'ITEM')
            ? depositNote.trim()
            : undefined,
        visibilityHours,
      })
      toast.success(t('feed.toast.posted', { hours: String(visibilityHours) }))
      setTitle('')
      setTimingNote('')
      setDescription('')
      setDistrict('')
      setCity('')
      setCountry('')
      setBudgetText('')
      setDeliveryPreference('')
      setDepositPreference('')
      setDepositNote('')
      await loadPosts()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message?: string; errors?: Record<string, string> }
        const firstField = data.errors && Object.values(data.errors)[0]
        toast.error(firstField || data.message || t('feed.toast.postFailed'))
      } else {
        toast.error(t('feed.toast.postFailed'))
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
      const preferredType =
        post.requestType === 'WORKER' ? ListingType.WORKER : ListingType.ITEM
      const matching = active.filter((l) => l.type === preferredType)
      const listings = matching.length > 0 ? matching : active
      setHostListings(listings)
      if (listings.length === 1) setPickListingId(String(listings[0].id))
    } catch {
      toast.error(t('feed.toast.listingsFailed'))
      setHostListings([])
    } finally {
      setListingsLoading(false)
    }
  }

  const submitHostReply = async () => {
    if (!replyTarget || !pickListingId) {
      toast.error(t('feed.toast.pickListing'))
      return
    }
    setReplySending(true)
    try {
      const res = await api.post(`/rent-requests/posts/${replyTarget.id}/conversation`, {
        listingId: Number(pickListingId),
      })
      toast.success(t('feed.toast.conversationOpened'))
      setReplyTarget(null)
      router.push(`/messages?booking=${res.data.id}`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message?: string }
        toast.error(data.message || t('feed.toast.conversationFailed'))
      } else {
        toast.error(t('feed.toast.conversationFailed'))
      }
    } finally {
      setReplySending(false)
    }
  }

  return (
    <div className="page-shell pt-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 animate-slide-down">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
            <span className="gradient-text">{t('feed.pageTitle')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
            {t('feed.subtitleBefore12')}{' '}
            <strong className="text-gray-800 dark:text-gray-200">{t('feed.hours12')}</strong>{' '}
            {t('feed.subtitleOr')}{' '}
            <strong className="text-gray-800 dark:text-gray-200">{t('feed.hours24')}</strong>{' '}
            {t('feed.subtitleAfter24')}
          </p>
        </div>

        {isAuthenticated ? (
          <form
            onSubmit={handleSubmit}
            className="mb-12 p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 shadow-lg backdrop-blur-sm space-y-6"
            noValidate
            aria-label={t('feed.formAria')}
          >
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <MegaphoneIcon className="h-6 w-6 text-blue-500" aria-hidden />
              {isWorkerRequest ? t('feed.postHeadingWorker') : t('feed.postHeadingItem')}
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                {t('feed.typeLabel')} <span className="text-red-500 dark:text-red-400">*</span>
              </span>
              <div role="radiogroup" aria-label={t('feed.typeAria')} className="flex flex-wrap gap-2">
                {requestTypeOptions.map((opt) => {
                  const Icon = opt.icon
                  const active = requestType === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setRequestType(opt.value)
                        if (opt.value === 'WORKER') {
                          setDeliveryPreference('')
                          setDepositPreference('')
                          setDepositNote('')
                        } else {
                          setTimingNote('')
                        }
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white shadow'
                          : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('feed.typeHint')}</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rent-request-title"
                className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                {isWorkerRequest ? t('feed.titleLabelWorker') : t('feed.titleLabelItem')}{' '}
                <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                id="rent-request-title"
                name="title"
                type="text"
                required
                autoComplete="off"
                placeholder={
                  isWorkerRequest ? t('feed.titlePlaceholderWorker') : t('feed.titlePlaceholderItem')
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="rent-request-title-hint"
              />
              <p id="rent-request-title-hint" className="text-xs text-gray-500 dark:text-gray-400">
                {t(isWorkerRequest ? 'feed.titleHintWorker' : 'feed.titleHintItem', {
                  count: String(title.length),
                })}
              </p>
            </div>

            {isWorkerRequest && (
              <div className="space-y-2">
                <label
                  htmlFor="rent-request-timing"
                  className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  {t('feed.timingLabel')}{' '}
                  <span className="font-normal text-gray-500 dark:text-gray-400">{t('feed.optional')}</span>
                </label>
                <input
                  id="rent-request-timing"
                  name="timingNote"
                  type="text"
                  autoComplete="off"
                  placeholder={t('feed.timingPlaceholder')}
                  value={timingNote}
                  onChange={(e) => setTimingNote(e.target.value)}
                  maxLength={TIMING_MAX_CHARS}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-describedby="rent-request-timing-hint"
                />
                <p id="rent-request-timing-hint" className="text-xs text-gray-500 dark:text-gray-400">
                  {t('feed.timingHint', {
                    current: String(timingNote.length),
                    max: String(TIMING_MAX_CHARS),
                  })}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="rent-request-details"
                className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                {t('feed.detailsLabel')}{' '}
                <span className="font-normal text-gray-500 dark:text-gray-400">{t('feed.optional')}</span>
              </label>
              <textarea
                id="rent-request-details"
                name="description"
                placeholder={
                  isWorkerRequest ? t('feed.detailsPlaceholderWorker') : t('feed.detailsPlaceholderItem')
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full min-h-[5.5rem] max-h-60 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                aria-describedby="rent-request-details-hint"
              />
              <p id="rent-request-details-hint" className="text-xs text-gray-500 dark:text-gray-400">
                {t('feed.charCount', { current: String(description.length), max: '2000' })}
              </p>
            </div>

            <div className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <MapPinIcon className="h-5 w-5 text-rose-500" aria-hidden />
                {t('feed.areaLabel')}{' '}
                <span className="font-normal text-gray-500 dark:text-gray-400">{t('feed.optional')}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label htmlFor="rent-request-district" className="sr-only">
                    {t('feed.districtSr')}
                  </label>
                  <input
                    id="rent-request-district"
                    name="district"
                    type="text"
                    autoComplete="address-level3"
                    placeholder={t('feed.districtPlaceholder')}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    maxLength={120}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="rent-request-city" className="sr-only">
                    {t('feed.citySr')}
                  </label>
                  <input
                    id="rent-request-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder={t('feed.cityPlaceholder')}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    maxLength={120}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="rent-request-country" className="sr-only">
                    {t('feed.countrySr')}
                  </label>
                  <input
                    id="rent-request-country"
                    name="country"
                    type="text"
                    autoComplete="country-name"
                    placeholder={t('feed.countryPlaceholder')}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    maxLength={120}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isWorkerRequest ? t('feed.areaHintWorker') : t('feed.areaHint')}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rent-request-budget"
                className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" aria-hidden />
                {t('feed.budgetLabel')}{' '}
                <span className="font-normal text-gray-500 dark:text-gray-400">{t('feed.optional')}</span>
              </label>
              <textarea
                id="rent-request-budget"
                name="budgetText"
                placeholder={
                  isWorkerRequest ? t('feed.budgetPlaceholderWorker') : t('feed.budgetPlaceholder')
                }
                value={budgetText}
                onChange={(e) => setBudgetText(e.target.value)}
                maxLength={BUDGET_MAX_CHARS}
                rows={3}
                className="w-full min-h-[4.5rem] max-h-48 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
                aria-describedby="rent-request-budget-hint"
              />
              <p id="rent-request-budget-hint" className="text-xs text-gray-500 dark:text-gray-400">
                {t(isWorkerRequest ? 'feed.budgetHintWorker' : 'feed.budgetHint', {
                  current: String(budgetText.length),
                  max: String(BUDGET_MAX_CHARS),
                })}
              </p>
            </div>

            {!isWorkerRequest && (
            <>
            <div className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <BanknotesIcon className="h-5 w-5 text-amber-500" aria-hidden />
                {t('feed.depositLabel')}{' '}
                <span className="font-normal text-gray-500 dark:text-gray-400">{t('feed.optional')}</span>
              </span>
              <div
                role="radiogroup"
                aria-label={t('feed.depositAria')}
                className="flex flex-wrap gap-2"
              >
                {depositOptions.map((opt) => {
                  const Icon = opt.icon
                  const active = depositPreference === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        const next = active ? '' : opt.value
                        setDepositPreference(next)
                        if (next !== 'CASH' && next !== 'ITEM') {
                          setDepositNote('')
                        }
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? 'bg-amber-600 border-amber-600 text-white shadow'
                          : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              {(depositPreference === 'CASH' || depositPreference === 'ITEM') && (
                <div className="space-y-1.5">
                  <label htmlFor="rent-request-deposit-note" className="sr-only">
                    {t('feed.depositLabel')}
                  </label>
                  <input
                    id="rent-request-deposit-note"
                    name="depositNote"
                    type="text"
                    placeholder={
                      depositPreference === 'CASH'
                        ? t('feed.depositCashPlaceholder')
                        : t('feed.depositItemPlaceholder')
                    }
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    maxLength={DEPOSIT_NOTE_MAX_CHARS}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    aria-describedby="rent-request-deposit-note-hint"
                  />
                  <p id="rent-request-deposit-note-hint" className="text-xs text-gray-500 dark:text-gray-400">
                    {t('feed.depositNoteHint', {
                      current: String(depositNote.length),
                      max: String(DEPOSIT_NOTE_MAX_CHARS),
                    })}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('feed.depositHint')}</p>
            </div>

            <div className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <TruckIcon className="h-5 w-5 text-indigo-500" aria-hidden />
                {t('feed.deliveryLabel')}{' '}
                <span className="font-normal text-gray-500 dark:text-gray-400">{t('feed.optional')}</span>
              </span>
              <div
                role="radiogroup"
                aria-label={t('feed.deliveryAria')}
                className="flex flex-wrap gap-2"
              >
                {deliveryOptions.map((opt) => {
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
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('feed.deliveryHint')}</p>
            </div>
            </>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
                <ClockIcon className="inline h-4 w-4 mr-1 text-amber-500" aria-hidden />
                {t('feed.visibilityLabel')}
              </label>
              <div
                role="radiogroup"
                aria-label={t('feed.visibilityAria')}
                className="flex flex-wrap gap-2"
              >
                {visibilityOptions.map((opt) => {
                  const active = visibilityHours === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setVisibilityHours(opt.value)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? 'bg-amber-500 border-amber-500 text-white shadow'
                          : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300'
                      }`}
                    >
                      <ClockIcon className="h-4 w-4" aria-hidden />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('feed.visibilityHint')}</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto px-8 py-3 disabled:opacity-60"
            >
              {submitting
                ? t('feed.submitPosting')
                : t('feed.submitPublish', { hours: String(visibilityHours) })}
            </button>
          </form>
        ) : (
          <div className="mb-12 p-6 rounded-2xl bg-gray-100/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('feed.signInPrompt')}</p>
            <Link href="/login" className="btn-primary inline-block px-6 py-2.5">
              {t('nav.login')}
            </Link>
          </div>
        )}

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClockIcon className="h-6 w-6 text-indigo-500" />
              {t('feed.liveRequests')}
            </h2>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('feed.typeAria')}>
              {typeFilterOptions.map((opt) => {
                const active = typeFilter === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTypeFilter(opt.value)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-800 mb-4">
                <div className="animate-spin rounded-full h-7 w-7 border-4 border-white border-t-transparent" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">{t('feed.loading')}</p>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center py-16 text-gray-500 dark:text-gray-400 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              {t('feed.empty')}
            </p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center py-16 text-gray-500 dark:text-gray-400 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              {t('feed.emptyFiltered')}
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredPosts.map((post, idx) => (
                <li
                  key={post.id}
                  className="animate-slide-up p-5 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span
                        className={`${metaPillClass} shrink-0 ${
                          (post.requestType ?? 'ITEM') === 'WORKER'
                            ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200'
                            : 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200'
                        }`}
                      >
                        {(post.requestType ?? 'ITEM') === 'WORKER' ? (
                          <WrenchScrewdriverIcon className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <CubeIcon className="h-3.5 w-3.5 shrink-0" />
                        )}
                        {(post.requestType ?? 'ITEM') === 'WORKER'
                          ? t('feed.badgeWorker')
                          : t('feed.badgeItem')}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{post.title}</h3>
                    </div>
                  </div>
                  {post.timingNote && (
                    <p className="text-sm text-violet-700 dark:text-violet-300 mb-2 flex items-center gap-1.5">
                      <ClockIcon className="h-4 w-4 shrink-0" />
                      {post.timingNote}
                    </p>
                  )}
                  {post.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 whitespace-pre-wrap">{post.description}</p>
                  )}
                  {post.budgetText && (post.requestType ?? 'ITEM') === 'WORKER' && (
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`${metaPillClass} max-w-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300`}
                      >
                        <CurrencyDollarIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="whitespace-pre-wrap break-words font-normal">{post.budgetText}</span>
                      </span>
                    </div>
                  )}
                  {(post.budgetText || post.depositPreference || post.deliveryPreference) &&
                    (post.requestType ?? 'ITEM') === 'ITEM' && (
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {(post.budgetText || post.depositPreference) && (
                        <span className="inline-flex flex-wrap items-center gap-1.5">
                          {post.budgetText && (
                            <span
                              className={`${metaPillClass} max-w-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300`}
                            >
                              <CurrencyDollarIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="whitespace-pre-wrap break-words font-normal">{post.budgetText}</span>
                            </span>
                          )}
                          {post.depositPreference && (
                            <span
                              className={`${metaPillClass} max-w-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200`}
                            >
                              {(() => {
                                const DepIcon = depositIcon(post.depositPreference)
                                return <DepIcon className="h-3.5 w-3.5 shrink-0" />
                              })()}
                              <span className="font-normal whitespace-pre-wrap break-words">
                                {depositBadgeText(post.depositPreference, post.depositNote)}
                              </span>
                            </span>
                          )}
                        </span>
                      )}
                      {post.deliveryPreference && (
                        <span
                          className={`${metaPillClass} bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300`}
                        >
                          {post.deliveryPreference === 'DELIVERY' ? (
                            <TruckIcon className="h-3.5 w-3.5 shrink-0" />
                          ) : post.deliveryPreference === 'PICKUP' ? (
                            <ShoppingBagIcon className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 shrink-0" />
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
                      {t('feed.expires', {
                        hours: String(post.visibilityHours ?? 24),
                        when: safeExpiresLabel(post.expiresAt),
                      })}
                    </span>
                    {isAuthenticated && user && user.id !== post.authorId && (
                      <button
                        type="button"
                        onClick={() => void openReplyModal(post)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 shrink-0" />
                        {t('feed.replyInMessages')}
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
              {t('feed.replyModalTitle')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('feed.replyModalIntro')}{' '}
              <strong className="text-gray-900 dark:text-gray-200">{t('feed.replyModalPrompt')}</strong>{' '}
              {t('feed.replyModalMid')}{' '}
              <span className="font-semibold">{t('feed.replyModalTag')}</span>
              {t('feed.replyModalEnd')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
              {t('feed.replyRequestLabel')}{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{replyTarget.title}</span>
            </p>
            {listingsLoading ? (
              <p className="text-sm text-gray-500">{t('feed.loadingListings')}</p>
            ) : hostListings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4 text-center text-sm">
                <p className="text-gray-600 dark:text-gray-400 mb-3">{t('feed.noListings')}</p>
                <Link href="/listings/new" className="btn-primary inline-block px-4 py-2 text-sm">
                  {t('feed.createListing')}
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="live-reply-listing" className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t('feed.yourListing')}
                </label>
                <select
                  id="live-reply-listing"
                  value={pickListingId}
                  onChange={(e) => setPickListingId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-3 py-2.5 text-sm"
                >
                  <option value="">{t('feed.selectPlaceholder')}</option>
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
                {t('feed.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void submitHostReply()}
                disabled={replySending || listingsLoading || hostListings.length === 0 || !pickListingId}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
              >
                {replySending ? t('feed.opening') : t('feed.openMessages')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
