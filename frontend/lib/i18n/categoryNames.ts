import type { Category } from '@/lib/types'
import type { Locale } from '@/lib/i18n/translations'

const CATEGORY_NAMES_EN: Record<string, string> = {
  'tools-equipment': 'Tools & DIY',
  electronics: 'Electronics',
  'home-living': 'Home & Living',
  apartment: 'Spaces',
  services: 'Services',
  vehicles: 'Scooter & Bikes',
  'pet-lovers': 'Pet Lovers',
  socials: 'Socials',
  'parties-events': 'Socials',
  other: 'Other',
}

const CATEGORY_NAMES_HU: Record<string, string> = {
  'tools-equipment': 'Szerszámok és barkács',
  electronics: 'Elektronika',
  'home-living': 'Otthon és lakás',
  apartment: 'Helyiségek',
  services: 'Szolgáltatások',
  vehicles: 'Rollerek és biciklik',
  'pet-lovers': 'Állatbarát',
  socials: 'Socialok',
  'parties-events': 'Socialok',
  other: 'Egyéb',
}

function slugKey(slug: string | undefined): string {
  return (slug || '').toLowerCase()
}

export function getCategoryDisplayName(
  slug: string | undefined,
  locale: Locale,
  fallback = '',
): string {
  const key = slugKey(slug)
  const map = locale === 'hu' ? CATEGORY_NAMES_HU : CATEGORY_NAMES_EN
  return map[key] ?? fallback ?? key
}

export function localizeCategories(categories: Category[], locale: Locale): Category[] {
  return categories.map((c) => ({
    ...c,
    name: getCategoryDisplayName(c.slug, locale, c.name),
  }))
}

/** Localize API categoryName when slug is unavailable (e.g. listing cards). */
export function localizeCategoryName(name: string | undefined, locale: Locale): string {
  if (!name?.trim()) return ''
  const normalized = name.trim()
  for (const [slug, enName] of Object.entries(CATEGORY_NAMES_EN)) {
    if (enName === normalized) {
      return getCategoryDisplayName(slug, locale, name)
    }
  }
  if (normalized === 'Parties&Events') {
    return getCategoryDisplayName('socials', locale, name)
  }
  if (normalized === 'Professional Services') {
    return getCategoryDisplayName('services', locale, name)
  }
  return name
}
