'use client'

import { useEffect, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { mergeCategoriesWithSeed, categoryHasPersistentId } from '@/lib/seedCategories'
import { Category } from '@/lib/types'
import {
  CubeIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  HomeModernIcon,
  HomeIcon,
  TrophyIcon,
  BuildingOffice2Icon,
  BeakerIcon,
  CalendarDaysIcon,
  UserIcon,
  MusicalNoteIcon,
  PhotoIcon,
  BookOpenIcon,
  SwatchIcon,
  FireIcon,
  HeartIcon,
  GiftTopIcon,
  EllipsisHorizontalCircleIcon,
} from '@heroicons/react/24/solid'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

const SLUG_ICONS: Record<string, IconComponent> = {
  electronics: DevicePhoneMobileIcon,
  vehicles: TruckIcon,
  'tools-equipment': WrenchScrewdriverIcon,
  furniture: HomeModernIcon,
  housing: HomeIcon,
  'sports-recreation': TrophyIcon,
  'professional-services': BuildingOffice2Icon,
  'infant-items': GiftTopIcon,
  'medical-equipment': BeakerIcon,
  'event-supplies': CalendarDaysIcon,
  'pet-lover': HeartIcon,
  'fashion-costumes': SwatchIcon,
  'fashion-customs': SwatchIcon,
  other: EllipsisHorizontalCircleIcon,
}

function categoryIcon(slug: string, name: string): IconComponent {
  const s = (slug || '').toLowerCase()
  if (SLUG_ICONS[s]) return SLUG_ICONS[s]

  const n = (name || '').toLowerCase()
  if (n.includes('electronic') || n.includes('phone') || n.includes('computer') || n.includes('laptop')) {
    return DevicePhoneMobileIcon
  }
  if (n.includes('vehicle') || n.includes('car') || n.includes('bike') || n.includes('motorcycle')) {
    return TruckIcon
  }
  if (n.includes('tool') || n.includes('equipment') || n.includes('machine')) {
    return WrenchScrewdriverIcon
  }
  if (n.includes('housing') && !n.includes('furniture')) {
    return HomeIcon
  }
  if (n.includes('furniture') || n.includes('chair') || n.includes('table') || n.includes('sofa')) {
    return HomeModernIcon
  }
  if (n.includes('sport') || n.includes('recreation') || n.includes('fitness') || n.includes('gym')) {
    return TrophyIcon
  }
  if (n.includes('service') || n.includes('worker') || n.includes('professional') || n.includes('contractor')) {
    return BuildingOffice2Icon
  }
  if (n.includes('medical') || n.includes('health') || n.includes('hospital')) {
    return BeakerIcon
  }
  if (n.includes('event') || n.includes('party') || n.includes('celebration')) {
    return CalendarDaysIcon
  }
  if (n.includes('infant')) {
    return GiftTopIcon
  }
  if (n.includes('baby') || n.includes('kid') || n.includes('child')) {
    return UserIcon
  }
  if (n.includes('music') || n.includes('instrument')) {
    return MusicalNoteIcon
  }
  if (n.includes('camera') || n.includes('photo') || n.includes('video')) {
    return PhotoIcon
  }
  if (n.includes('book') || n.includes('library')) {
    return BookOpenIcon
  }
  if (n.includes('clothing') || n.includes('fashion') || n.includes('apparel') || n.includes('costume')) {
    return SwatchIcon
  }
  if (n.includes('kitchen') || n.includes('cooking') || n.includes('appliance')) {
    return FireIcon
  }
  if (n.includes('pet') || n.includes('animal')) {
    return HeartIcon
  }
  return CubeIcon
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>(() => mergeCategoriesWithSeed([]))

  useEffect(() => {
    api
      .get('/categories')
      .then((response) => {
        setCategories(mergeCategoriesWithSeed(response.data || []))
      })
      .catch(() => {
        setCategories(mergeCategoriesWithSeed([]))
      })
  }, [])

  const displayCategories = categories

  return (
    <section className="section-container bg-sand-50 dark:bg-ink-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
            Categories
          </p>
          <h2 className="section-title">
            Everything worth <span className="gradient-text">borrowing</span>
          </h2>
          <p className="section-subtitle">
            From weekend projects to once-in-a-lifetime events — find it nearby.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayCategories.map((category, idx) => {
            const Icon = categoryIcon(category.slug || '', category.name || '')
            return (
              <Link
                key={category.slug || category.id}
                href={
                  categoryHasPersistentId(category)
                    ? `/search?category=${category.id}`
                    : `/search?categorySlug=${encodeURIComponent(category.slug)}`
                }
                className="group relative"
              >
                <div
                  className="card text-center hover:scale-105 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-2xl border border-ink-100 bg-sand-100 transition-all duration-300 group-hover:border-accent group-hover:bg-accent-muted dark:border-ink-700 dark:bg-ink-800">
                      <Icon
                        className="h-12 w-12 text-ink-700 transition-transform duration-300 group-hover:scale-110 dark:text-ink-200"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                        aria-hidden
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-ink-900 transition-colors group-hover:text-accent-dark dark:text-white">
                    {category.name}
                  </h3>

                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
