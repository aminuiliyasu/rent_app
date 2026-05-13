import type { Listing } from '@/lib/types'

/** District/address, city & state, country — for cards and detail. */
export function formatListingLocationLine(listing: Pick<Listing, 'address' | 'city' | 'state' | 'country'>): string | null {
  const cityState = [listing.city?.trim(), listing.state?.trim()].filter(Boolean).join(', ')
  const pieces = [listing.address?.trim(), cityState || null, listing.country?.trim()].filter(
    (x): x is string => Boolean(x)
  )
  const uniq: string[] = []
  const seen = new Set<string>()
  for (const p of pieces) {
    const k = p.toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      uniq.push(p)
    }
  }
  return uniq.length ? uniq.join(' · ') : null
}
