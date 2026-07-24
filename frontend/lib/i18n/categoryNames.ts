import type { Category } from '@/lib/types'
import type { Locale } from '@/lib/i18n/translations'

const CATEGORY_NAMES_EN: Record<string, string> = {
  'tools-equipment': 'Tools & DIY',
  electronics: 'Camera & electronics',
  'home-living': 'Baby equipment',
  apartment: 'Spaces',
  services: 'Services',
  vehicles: 'Scooter & Bikes',
  'pet-lovers': 'Pet Lovers',
  socials: 'Fashion & Costumes',
  'parties-events': 'Fashion & Costumes',
  other: 'Other',
}

const CATEGORY_NAMES_HU: Record<string, string> = {
  'tools-equipment': 'Szerszámok és barkács',
  electronics: 'Kamera és elektronika',
  'home-living': 'Baba felszerelés',
  apartment: 'Helyiségek',
  services: 'Szolgáltatások',
  vehicles: 'Rollerek és biciklik',
  'pet-lovers': 'Állatbarát',
  socials: 'Divat és jelmezek',
  'parties-events': 'Divat és jelmezek',
  other: 'Egyéb',
}

/** Pre-rename English/HU labels still seen on older API payloads or caches. */
const LEGACY_CATEGORY_NAMES: Record<string, string> = {
  'Home & Living': 'home-living',
  'Otthon és lakás': 'home-living',
  Socials: 'socials',
  Socialok: 'socials',
  'Parties&Events': 'socials',
  Electronics: 'electronics',
  Elektronika: 'electronics',
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
  for (const [slug, huName] of Object.entries(CATEGORY_NAMES_HU)) {
    if (huName === normalized) {
      return getCategoryDisplayName(slug, locale, name)
    }
  }
  const legacySlug = LEGACY_CATEGORY_NAMES[normalized]
  if (legacySlug) {
    return getCategoryDisplayName(legacySlug, locale, name)
  }
  if (normalized === 'Professional Services') {
    return getCategoryDisplayName('services', locale, name)
  }
  return name
}
