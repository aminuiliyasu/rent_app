'use client'

import { useEffect, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { mergeCategoriesWithSeed, categoryHasPersistentId } from '@/lib/seedCategories'
import { Category } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizeCategories } from '@/lib/i18n/categoryNames'
import {
  CubeIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  HomeModernIcon,
  HomeIcon,
  TrophyIcon,
  BuildingOffice2Icon,
  BeakerIcon,
  CalendarDaysIcon,
  MusicalNoteIcon,
  PhotoIcon,
  CameraIcon,
  BookOpenIcon,
  SwatchIcon,
  FireIcon,
  HeartIcon,
  GiftTopIcon,
  EllipsisHorizontalCircleIcon,
} from '@heroicons/react/24/solid'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

const SLUG_ICONS: Record<string, IconComponent> = {
  electronics: CameraIcon,
  vehicles: TruckIcon,
  'tools-equipment': WrenchScrewdriverIcon,
  'home-living': GiftTopIcon,
  apartment: HomeIcon,
  services: BuildingOffice2Icon,
  'pet-lovers': HeartIcon,
  socials: SwatchIcon,
  'parties-events': SwatchIcon,
  housing: HomeIcon,
  furniture: HomeModernIcon,
  'professional-services': BuildingOffice2Icon,
  'infant-items': GiftTopIcon,
  'sports-recreation': TrophyIcon,
  'pet-lover': HeartIcon,
  'fashion-costumes': SwatchIcon,
  'fashion-customs': SwatchIcon,
  other: EllipsisHorizontalCircleIcon,
}

function categoryIcon(slug: string, name: string): IconComponent {
  const s = (slug || '').toLowerCase()
  if (SLUG_ICONS[s]) return SLUG_ICONS[s]

  const n = (name || '').toLowerCase()
  if (
    n.includes('electronic') ||
    n.includes('camera') ||
    n.includes('kamera') ||
    n.includes('phone') ||
    n.includes('computer') ||
    n.includes('laptop')
  ) {
    return CameraIcon
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
  if (n.includes('infant') || n.includes('baby') || n.includes('kid') || n.includes('child')) {
    return GiftTopIcon
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
  if (
    n.includes('clothing') ||
    n.includes('fashion') ||
    n.includes('apparel') ||
    n.includes('costume') ||
    n.includes('social')
  ) {
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
  const { locale, t } = useLanguage()
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

  const displayCategories = localizeCategories(categories, locale)

  return (
    <section className="section-container bg-gradient-to-b from-white via-stone-50/50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="heading-display text-5xl md:text-6xl lg:text-7xl mb-4">
            {t('category.browsePrefix')}{' '}
            <span className="gradient-text italic">{t('category.browseHighlight')}</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('category.subtitle')}
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
                  className="card text-center transition-shadow duration-300 animate-slide-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-all duration-300 shadow-lg">
                      <Icon
                        className="h-12 w-12 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                        aria-hidden
                      />
                    </div>
                  </div>

                  <h3 className="font-sans font-bold text-lg md:text-xl text-gray-950 dark:text-white group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors leading-snug tracking-tight px-1">
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
