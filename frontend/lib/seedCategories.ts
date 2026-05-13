import type { Category } from '@/lib/types'

/** Matches backend DataInitializer — kept in sync for UI when DB is missing rows. */
export const SEED_CATEGORY_DEFINITIONS: ReadonlyArray<{ name: string; slug: string }> = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Vehicles', slug: 'vehicles' },
  { name: 'Tools & Equipment', slug: 'tools-equipment' },
  { name: 'Furniture', slug: 'furniture' },
  { name: 'Sports & Recreation', slug: 'sports-recreation' },
  { name: 'Professional Services', slug: 'professional-services' },
  { name: 'Housing', slug: 'housing' },
  { name: 'Infant Items', slug: 'infant-items' },
  { name: 'Pet Lover', slug: 'pet-lover' },
  { name: 'Fashion&costumes', slug: 'fashion-costumes' },
  { name: 'Other', slug: 'other' },
]

function slugKey(slug: string | undefined): string {
  return (slug || '').toLowerCase()
}

/**
 * Union of API categories with any seed row missing from the API (slug-only until backend seeds).
 * Sorted by name for dropdowns.
 */
export function mergeCategoriesWithSeed(apiList: Category[]): Category[] {
  const fromApi = apiList || []
  const bySlug = new Map<string, Category>()
  for (const c of fromApi) {
    const k = slugKey(c.slug)
    if (k) bySlug.set(k, c)
  }

  const merged: Category[] = [...fromApi]
  for (const seed of SEED_CATEGORY_DEFINITIONS) {
    const k = slugKey(seed.slug)
    if (!bySlug.has(k)) {
      merged.push({
        id: 0,
        name: seed.name,
        slug: seed.slug,
      })
    }
  }

  merged.sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }),
  )
  return merged
}

export function categoryHasPersistentId(c: Pick<Category, 'id'>): boolean {
  return typeof c.id === 'number' && c.id > 0
}
