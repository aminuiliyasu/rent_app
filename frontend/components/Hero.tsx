'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { LAUNCH_REGION_LABEL } from '@/lib/site'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Hero() {
  const router = useRouter()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    const location = locationQuery.trim()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (location) params.set('location', location)
    const query = params.toString()
    router.push(query ? `/search?${query}` : '/search')
  }

  const trustItems = [t('hero.trust1'), t('hero.trust2'), t('hero.trust3')]
  const stats = [
    { value: t('hero.stat1Value'), label: t('hero.stat1Label') },
    { value: t('hero.stat2Value'), label: t('hero.stat2Label') },
    { value: t('hero.stat3Value'), label: t('hero.stat3Label') },
  ]

  return (
    <div className="relative min-h-[88vh] flex items-center overflow-hidden bg-primary-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(54,165,250,0.18),_transparent_55%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(100%,48rem)] h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-700/60 bg-stone-900/40 text-stone-300 text-base md:text-lg mb-8">
            <MapPinIcon className="h-5 w-5 text-accent-light shrink-0" />
            {t('hero.nowLive', { region: LAUNCH_REGION_LABEL })}
          </div>

          <p className="text-sm md:text-base uppercase tracking-[0.22em] text-stone-400 mb-5 font-medium">{t('hero.eyebrow')}</p>

          <h1 className="font-serif font-semibold text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] text-white mb-6 leading-[1.08]">
            <Link
              href="/search?type=ITEM"
              className="rounded-sm underline-offset-[0.18em] decoration-white/35 transition-[text-decoration-color] hover:underline hover:decoration-white/75 focus-visible:underline focus-visible:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label={t('hero.titleLine1Aria')}
            >
              {t('hero.titleLine1')}
            </Link>
            <Link
              href="/search?type=WORKER"
              className="mt-2 block rounded-sm text-amber-300 font-semibold underline-offset-[0.18em] decoration-amber-300/50 transition-[text-decoration-color] hover:underline hover:decoration-amber-200 focus-visible:underline focus-visible:decoration-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
              aria-label={t('hero.titleLine2Aria')}
            >
              {t('hero.titleLine2')}
            </Link>
          </h1>

          <p className="text-xl md:text-2xl text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
            {t('hero.subtitle')}
          </p>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/15">
              <div className="flex-1 relative min-w-0">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-stone-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.itemPlaceholder')}
                  aria-label={t('search.itemLabel')}
                  className="w-full pl-14 pr-4 py-4 text-gray-900 rounded-lg focus:outline-none text-lg md:text-xl font-normal bg-transparent"
                />
              </div>
              <div className="sm:w-52 shrink-0">
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder={t('search.locationPlaceholder')}
                  aria-label={t('search.locationLabel')}
                  className="w-full px-4 py-4 text-gray-900 rounded-lg focus:outline-none text-base md:text-lg font-normal bg-stone-50 border border-stone-200/80"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-900 text-white text-lg font-semibold px-8 py-4 rounded-xl transition-colors shrink-0"
              >
                {t('search.submit')}
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </form>

          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-base md:text-lg text-stone-300 mb-10">
            {trustItems.map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-accent shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/listings/new"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-white text-white text-lg font-semibold hover:bg-white hover:text-primary-900 transition-colors"
            >
              {t('hero.listCta')}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="text-stone-300 hover:text-stone-200 text-lg font-medium transition-colors underline-offset-4 hover:underline"
            >
              {t('hero.howCta')}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-14 pt-10 border-t border-stone-800">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl md:text-3xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-stone-400 mt-2 font-sans">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
