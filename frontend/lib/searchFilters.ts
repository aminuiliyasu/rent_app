export interface SearchFilterState {
  search: string
  district: string
  area: string
  categoryId: number | null
  categorySlug: string | null
  type: string | null
  minPrice: number | null
  maxPrice: number | null
  lat: number | null
  lng: number | null
  radius: number | null
}

export function buildLocationQuery(district: string, area: string): string {
  return [district, area].map((part) => part.trim()).filter(Boolean).join(' ')
}

export const emptySearchFilters = (): SearchFilterState => ({
  search: '',
  district: '',
  area: '',
  categoryId: null,
  categorySlug: null,
  type: null,
  minPrice: null,
  maxPrice: null,
  lat: null,
  lng: null,
  radius: null,
})
