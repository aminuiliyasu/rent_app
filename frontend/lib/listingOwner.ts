import { Listing, User } from '@/lib/types'

/** Reliable owner check (API may return ids as numbers). */
export function isListingOwner(
  user: Pick<User, 'id'> | null | undefined,
  listing: Pick<Listing, 'ownerId'> | null | undefined,
): boolean {
  if (!user?.id || listing?.ownerId == null) return false
  return Number(user.id) === Number(listing.ownerId)
}
