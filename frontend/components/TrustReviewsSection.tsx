'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Review, UserTrust } from '@/lib/types'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'

function normalizeTrust(raw: unknown): UserTrust | null {
  if (raw == null || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const avgRaw = o.averageRatingReceived ?? o.average_rating_received
  const countRaw = o.reviewsReceivedCount ?? o.reviews_received_count
  return {
    averageRatingReceived: typeof avgRaw === 'number' ? avgRaw : avgRaw != null ? Number(avgRaw) : null,
    reviewsReceivedCount: Number(countRaw ?? 0),
    latestReceived: (o.latestReceived ?? o.latest_received) as Review | null,
    latestGiven: (o.latestGiven ?? o.latest_given) as Review | null,
  }
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        n <= rating ? (
          <StarIcon key={n} className="h-5 w-5 text-amber-400" />
        ) : (
          <StarOutlineIcon key={n} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
        )
      )}
    </div>
  )
}

function ReviewSnippet({
  title,
  subtitle,
  review,
  emptyLabel,
  mode,
}: {
  title: string
  subtitle: string
  review: Review | null
  emptyLabel: string
  mode: 'about-them' | 'by-them'
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/60">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
      {review ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {mode === 'about-them'
                ? review.reviewer?.name ?? 'Member'
                : `Rated ${review.reviewee?.name ?? 'member'}`}
            </span>
            <StarRow rating={review.rating} />
          </div>
          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">&ldquo;{review.comment}&rdquo;</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{emptyLabel}</p>
      )}
    </div>
  )
}

export default function TrustReviewsSection({
  userId,
  variant = 'public',
}: {
  userId: number
  variant?: 'self' | 'public'
}) {
  const [trust, setTrust] = useState<UserTrust | null>(null)
  const [received, setReceived] = useState<Review[]>([])
  const [given, setGiven] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [tRes, recRes, givRes] = await Promise.all([
          api.get(`/users/${userId}/trust`).catch(() => ({ data: null })),
          api.get(`/users/${userId}/reviews?page=0&size=40`).catch(() => ({ data: { content: [] } })),
          api.get(`/users/${userId}/reviews/given?page=0&size=40`).catch(() => ({ data: { content: [] } })),
        ])
        if (cancelled) return
        setTrust(normalizeTrust(tRes.data))
        const rc = recRes.data?.content as Review[] | undefined
        const gv = givRes.data?.content as Review[] | undefined
        setReceived(Array.isArray(rc) ? rc : [])
        setGiven(Array.isArray(gv) ? gv : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const intro =
    variant === 'self'
      ? 'After a rental, you and the other person each leave a review. When both are in, they go public — here’s what others see on your profile.'
      : 'Reviews publish only after both sides submit on a completed rental — that keeps things fair and builds trust.'

  if (loading) {
    return (
      <div className="card mt-10 py-16 text-center text-gray-500 dark:text-gray-400">Loading reputation…</div>
    )
  }

  const avg = trust?.averageRatingReceived
  const count = trust?.reviewsReceivedCount ?? 0

  return (
    <div className="card mt-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Reputation &amp; reviews</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">{intro}</p>

      {(avg != null || count > 0) && (
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 to-teal-50/80 p-5 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-teal-950/30">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) =>
              avg != null && n <= Math.round(avg) ? (
                <StarIcon key={n} className="h-8 w-8 text-amber-400" />
              ) : (
                <StarOutlineIcon key={n} className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              )
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {avg != null ? `${avg.toFixed(1)} / 5` : '—'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              From {count} verified peer review{count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Latest activity</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Most recent published feedback in each direction — useful for a quick trust check.
      </p>
      <div className="grid gap-4 md:grid-cols-2 mb-10">
        <ReviewSnippet
          mode="about-them"
          title="About them"
          subtitle="What renters or hosts said about this person."
          review={trust?.latestReceived ?? null}
          emptyLabel="Nothing published yet, or waiting for both reviews on a booking."
        />
        <ReviewSnippet
          mode="by-them"
          title="Their feedback"
          subtitle="What they recently shared about others after completed rentals."
          review={trust?.latestGiven ?? null}
          emptyLabel="They haven’t posted a published review yet."
        />
      </div>

      <div className="border-t border-gray-200 pt-8 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">All reviews about them</h3>
        {received.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 py-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center text-sm">
            No public reviews yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {received.map((rev) => (
              <li
                key={rev.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{rev.reviewer?.name ?? 'Member'}</span>
                  <StarRow rating={rev.rating} />
                </div>
                {rev.comment && <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{rev.comment}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-gray-200 pt-8 mt-8 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reviews they&apos;ve shared</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Shows how they rate others — visible once both sides have submitted on each booking.
        </p>
        {given.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 py-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center text-sm">
            No published reviews written yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {given.map((rev) => (
              <li
                key={rev.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    For <span className="font-semibold text-gray-900 dark:text-white">{rev.reviewee?.name ?? 'member'}</span>
                  </span>
                  <StarRow rating={rev.rating} />
                </div>
                {rev.comment && <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{rev.comment}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
