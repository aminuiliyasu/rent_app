import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { Listing, ListingStatus, ListingType } from '@/lib/types'
import { requireDb } from '@/lib/firebase'

type ListingInput = {
  type: ListingType
  title: string
  description?: string
  categoryId: number
  categoryName?: string
  priceDay?: number | null
  priceWeek?: number | null
  priceMonth?: number | null
  priceHour?: number | null
  deposit?: number | null
  address?: string
  city?: string
  state?: string
  country?: string
  deliveryOption?: string
  deliveryRadius?: number | null
  workerName?: string
  workerBio?: string
  workerProfession?: string
  serviceArea?: string
  imageUrls?: string[]
  ownerId?: number
  ownerName?: string
}

const LISTINGS_COLLECTION = 'listings'

export async function createListingInFirestore(input: ListingInput): Promise<string> {
  const created = await addDoc(collection(requireDb(), LISTINGS_COLLECTION), {
    ...input,
    status: ListingStatus.ACTIVE,
    isFeatured: false,
    imageUrls: input.imageUrls || [],
    primaryImageUrl: input.imageUrls?.[0] || null,
    averageRating: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return created.id
}

export async function getActiveListingsFromFirestore(max = 20): Promise<Listing[]> {
  const q = query(
    collection(requireDb(), LISTINGS_COLLECTION),
    where('status', '==', ListingStatus.ACTIVE),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((entry) => mapListingDoc(entry.id, entry.data()))
}

export async function getFilteredListingsFromFirestore(filters: {
  search?: string
  categoryId?: number | null
  type?: string | null
  minPrice?: number | null
  maxPrice?: number | null
}): Promise<Listing[]> {
  const listings = await getActiveListingsFromFirestore(200)
  return listings.filter((listing) => {
    const query = (filters.search || '').trim().toLowerCase()
    const matchesSearch =
      !query ||
      listing.title.toLowerCase().includes(query) ||
      (listing.description || '').toLowerCase().includes(query) ||
      (listing.city || '').toLowerCase().includes(query) ||
      (listing.state || '').toLowerCase().includes(query)

    const matchesCategory = !filters.categoryId || listing.categoryId === filters.categoryId
    const matchesType = !filters.type || listing.type === filters.type

    const dayPrice = listing.priceDay ?? 0
    const matchesMin = !filters.minPrice || dayPrice >= filters.minPrice
    const matchesMax = !filters.maxPrice || dayPrice <= filters.maxPrice

    return matchesSearch && matchesCategory && matchesType && matchesMin && matchesMax
  })
}

export async function getListingFromFirestore(id: string): Promise<Listing | null> {
  const listingDoc = await getDoc(doc(requireDb(), LISTINGS_COLLECTION, id))
  if (!listingDoc.exists()) {
    return null
  }
  return mapListingDoc(listingDoc.id, listingDoc.data())
}

function mapListingDoc(id: string, data: any): Listing {
  return {
    id,
    type: data.type || ListingType.ITEM,
    title: data.title || 'Untitled Listing',
    description: data.description || '',
    categoryId: Number(data.categoryId || 0),
    categoryName: data.categoryName || '',
    priceDay: toNumberOrUndefined(data.priceDay),
    priceWeek: toNumberOrUndefined(data.priceWeek),
    priceMonth: toNumberOrUndefined(data.priceMonth),
    priceHour: toNumberOrUndefined(data.priceHour),
    deposit: toNumberOrUndefined(data.deposit),
    status: data.status || ListingStatus.ACTIVE,
    lat: toNumberOrUndefined(data.lat),
    lng: toNumberOrUndefined(data.lng),
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    country: data.country || '',
    deliveryOption: data.deliveryOption || '',
    deliveryRadius: toNumberOrUndefined(data.deliveryRadius),
    workerName: data.workerName || '',
    workerBio: data.workerBio || '',
    workerProfession: data.workerProfession || '',
    serviceArea: data.serviceArea || '',
    isFeatured: Boolean(data.isFeatured),
    ownerId: Number(data.ownerId || 0),
    ownerName: data.ownerName || 'Anonymous',
    imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
    primaryImageUrl: data.primaryImageUrl || '',
    averageRating: toNumberOrUndefined(data.averageRating),
    reviewCount: toNumberOrUndefined(data.reviewCount),
  }
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
