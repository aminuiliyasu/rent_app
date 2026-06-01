'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'

const TRUST_POINTS = [
  'Verified local listings',
  'Secure in-app messaging',
  'No platform fees right now',
] as const

const STATS = [
  { value: 'Minutes', label: 'to book nearby' },
  { value: '100%', label: 'local-first' },
  { value: '$0', label: 'booking fees today' },
] as const

export default function Hero() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-ink-900 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[20%] top-0 h-[70%] w-[60%] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[50%] w-[45%] rounded-full bg-indigo-600/25 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[40%] w-[80%] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/20 via-transparent to-ink-900" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-28 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow opacity-0-start animate-slide-down mb-8">
            Access over ownership
          </p>

          <h1 className="opacity-0-start animate-reveal stagger-1 font-serif text-5xl leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            Rent what you need.
            <br />
            <span className="italic text-accent-light">Hire who you trust.</span>
          </h1>

          <p className="text-balance opacity-0-start animate-slide-up stagger-2 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl">
            Gear, spaces, and skilled people — listed by neighbors, booked in minutes.
            Stop buying things you&apos;ll use once. Start borrowing smarter.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="opacity-0-start animate-slide-up stagger-3 mx-auto mt-12 max-w-2xl"
          >
            <div className="group relative rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 focus-within:bg-white/15 focus-within:ring-accent/40">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex flex-1 items-center">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-5 h-5 w-5 text-ink-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Try: camera, drill, van, photographer…"
                    className="w-full rounded-xl bg-white py-4 pl-14 pr-4 text-base font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none sm:text-lg"
                    aria-label="Search listings"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-accent shrink-0 !rounded-xl sm:!px-8"
                >
                  Search
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Trust chips */}
          <ul className="opacity-0-start animate-fade-in stagger-4 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-white/55">
                <CheckBadgeIcon className="h-4 w-4 text-accent" />
                {point}
              </li>
            ))}
          </ul>

          {/* Secondary CTAs */}
          <div className="opacity-0-start animate-fade-in stagger-4 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/listings/new"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/35 hover:bg-white/10"
            >
              List something you own
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-white/50 underline-offset-4 transition hover:text-white hover:underline"
            >
              See how Rhentify works
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="opacity-0-start animate-slide-up stagger-4 mx-auto mt-20 grid w-full max-w-3xl grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:gap-8 sm:p-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-2xl text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/45 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 flex items-center justify-center gap-2 text-center text-xs text-white/40">
          <ShieldCheckIcon className="h-4 w-4" />
          Built for real neighborhoods — not anonymous marketplaces.
        </p>
      </div>

      {/* Bottom fade into content */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sand-50 to-transparent dark:from-ink-950" />
    </section>
  )
}
