import type { Category } from '@/lib/types'

/** Budapest-focused categories — keep in sync with CategorySeedService. */
export const SEED_CATEGORY_DEFINITIONS: ReadonlyArray<{ name: string; slug: string }> = [
  { name: 'Services', slug: 'services' },
  { name: 'Scooter & Bikes', slug: 'vehicles' },
  { name: 'Tools & DIY', slug: 'tools-equipment' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Spaces', slug: 'apartment' },
  { name: 'Home & Living', slug: 'home-living' },
  { name: 'Pet Lovers', slug: 'pet-lovers' },
  { name: 'Socials', slug: 'socials' },
  { name: 'Other', slug: 'other' },
]

export const ACTIVE_CATEGORY_SLUGS = SEED_CATEGORY_DEFINITIONS.map((c) => c.slug)

/** Retired slugs that should resolve to an active category. */
const LEGACY_CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'parties-events': 'socials',
}

export function resolveCategorySlug(slug: string | null | undefined): string | null {
  if (!slug?.trim()) return null
  const key = slugKey(slug)
  return LEGACY_CATEGORY_SLUG_ALIASES[key] ?? key
}

const CATEGORY_DISPLAY_ORDER = new Map(ACTIVE_CATEGORY_SLUGS.map((slug, index) => [slug, index]))

function slugKey(slug: string | undefined): string {
  return (slug || '').toLowerCase()
}

export function filterAndSortCategories(categories: Category[]): Category[] {
  return categories
    .filter((c) => ACTIVE_CATEGORY_SLUGS.includes(slugKey(c.slug)))
    .sort(
      (a, b) =>
        (CATEGORY_DISPLAY_ORDER.get(slugKey(a.slug)) ?? 99) -
        (CATEGORY_DISPLAY_ORDER.get(slugKey(b.slug)) ?? 99),
    )
}

/**
 * Union of API categories with any seed row missing from the API (slug-only until backend seeds).
 * Returns only active Budapest-focused categories, in display order.
 */
export function mergeCategoriesWithSeed(apiList: Category[]): Category[] {
  const seedBySlug = new Map(SEED_CATEGORY_DEFINITIONS.map((s) => [slugKey(s.slug), s]))
  const fromApi = apiList || []
  const bySlug = new Map<string, Category>()

  for (const c of fromApi) {
    const k = slugKey(c.slug)
    if (!k) continue
    const seed = seedBySlug.get(k)
    bySlug.set(k, seed ? { ...c, name: seed.name } : c)
  }

  for (const seed of SEED_CATEGORY_DEFINITIONS) {
    const k = slugKey(seed.slug)
    if (!bySlug.has(k)) {
      bySlug.set(k, {
        id: 0,
        name: seed.name,
        slug: seed.slug,
      })
    }
  }

  return filterAndSortCategories(Array.from(bySlug.values()))
}

export function categoryHasPersistentId(c: Pick<Category, 'id'>): boolean {
  return typeof c.id === 'number' && c.id > 0
}
