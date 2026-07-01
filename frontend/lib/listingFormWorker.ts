import { Category, ListingType } from '@/lib/types'
import { categoryHasPersistentId } from '@/lib/seedCategories'

export const SERVICES_CATEGORY_SLUG = 'services'

export const ITEM_TITLE_PLACEHOLDER = 'e.g., Professional camera kit'
export const WORKER_TITLE_PLACEHOLDER = 'e.g., Wedding photographer — Budapest'
export const ITEM_DESCRIPTION_PLACEHOLDER = 'Describe your item, condition, and what is included...'
export const WORKER_DESCRIPTION_PLACEHOLDER =
  'What you offer, experience, tools you bring, and what the renter should expect...'

export function servicesCategoryValue(categories: Category[]): string {
  const services = categories.find((c) => c.slug === SERVICES_CATEGORY_SLUG)
  if (!services) return `slug:${SERVICES_CATEGORY_SLUG}`
  return categoryHasPersistentId(services) ? String(services.id) : `slug:${services.slug}`
}

/** After API categories load, replace slug:… values with numeric ids so the select stays valid. */
export function upgradeCategoryIdIfSeeded(categoryId: string, categories: Category[]): string {
  if (!categoryId.startsWith('slug:')) return categoryId
  const slug = categoryId.slice(5)
  const match = categories.find((c) => c.slug === slug)
  if (match && categoryHasPersistentId(match)) return String(match.id)
  return categoryId
}

export function applyListingTypeDefaults(
  type: ListingType,
  prev: { categoryId: string; workerName: string },
  categories: Category[],
  userName?: string | null,
): Partial<{ categoryId: string; workerName: string }> {
  if (type !== ListingType.WORKER) {
    return {}
  }

  const patch: Partial<{ categoryId: string; workerName: string }> = {
    categoryId: servicesCategoryValue(categories),
  }
  if (!prev.workerName.trim() && userName?.trim()) {
    patch.workerName = userName.trim()
  }
  return patch
}

export function workerCategoriesForSelect(categories: Category[]): Category[] {
  const services = categories.filter((c) => c.slug === SERVICES_CATEGORY_SLUG)
  return services.length > 0 ? services : categories
}
