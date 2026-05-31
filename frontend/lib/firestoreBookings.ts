import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BookingStatus } from '@/lib/types'
import { getListingFromFirestore } from '@/lib/firestoreListings'

export async function createBookingInFirestore(input: {
  listingId: string | number
  renterId: number
  renterName?: string
  renterEmail?: string
  ownerId: number
  ownerName?: string
  listingTitle?: string
  startDate: string
  endDate: string
  totalAmount: number
}): Promise<string> {
  const nowIso = new Date().toISOString()
  const created = await addDoc(collection(db, 'bookings'), {
    ...input,
    status: 'PENDING',
    deposit: 0,
    platformFee: 0,
    currency: 'USD',
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return created.id
}

export interface FirestoreOwnerBooking {
  id: string
  listingId: string | number
  renterId: number
  ownerId: number
  startDate: string
  endDate: string
  status: string
  totalAmount: number
  deposit: number
  platformFee: number
  renterName?: string
  renterEmail?: string
  ownerName?: string
  listingTitle?: string
  currency?: string
  createdAt?: string
}

export async function getOwnerBookingsFromFirestore(ownerId: number): Promise<FirestoreOwnerBooking[]> {
  const bookingsRef = collection(db, 'bookings')
  const q = query(bookingsRef, where('ownerId', '==', ownerId))
  const snapshot = await getDocs(q)
  const mapped = snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data() as Record<string, unknown>
    return mapBookingDoc(docSnapshot.id, data)
  })
  return enrichAndSortBookings(mapped)
}

export async function getRenterBookingsFromFirestore(renterId: number): Promise<FirestoreOwnerBooking[]> {
  const bookingsRef = collection(db, 'bookings')
  const q = query(bookingsRef, where('renterId', '==', renterId))
  const snapshot = await getDocs(q)
  const mapped = snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data() as Record<string, unknown>
    return mapBookingDoc(docSnapshot.id, data)
  })
  return enrichAndSortBookings(mapped)
}

export async function getBookingFromFirestore(bookingId: string): Promise<FirestoreOwnerBooking | null> {
  const bookingDoc = await getDoc(doc(db, 'bookings', bookingId))
  if (!bookingDoc.exists()) {
    return null
  }
  const mapped = mapBookingDoc(bookingDoc.id, bookingDoc.data() as Record<string, unknown>)
  const enriched = await enrichAndSortBookings([mapped])
  return enriched[0] || null
}

export async function updateBookingStatusInFirestore(
  bookingId: string,
  status: BookingStatus | string
): Promise<void> {
  const nowIso = new Date().toISOString()
  await updateDoc(doc(db, 'bookings', bookingId), {
    status,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp(),
  })
}

function mapBookingDoc(id: string, data: Record<string, unknown>): FirestoreOwnerBooking {
  return {
    id,
    listingId: (data.listingId as string | number) ?? '',
    renterId: Number(data.renterId || 0),
    ownerId: Number(data.ownerId || 0),
    startDate: String(data.startDate || ''),
    endDate: String(data.endDate || ''),
    status: String(data.status || 'PENDING'),
    totalAmount: Number(data.totalAmount || 0),
    deposit: Number(data.deposit || 0),
    platformFee: Number(data.platformFee || 0),
    renterName: String(data.renterName || ''),
    renterEmail: String(data.renterEmail || ''),
    ownerName: String(data.ownerName || ''),
    listingTitle: String(data.listingTitle || ''),
    currency: String(data.currency || 'USD'),
    createdAt: String(data.createdAtIso || data.startDate || ''),
  }
}

async function enrichAndSortBookings(bookings: FirestoreOwnerBooking[]): Promise<FirestoreOwnerBooking[]> {
  const enriched = await Promise.all(bookings.map(async (booking) => {
    if (!booking.listingTitle && typeof booking.listingId === 'string') {
      try {
        const listing = await getListingFromFirestore(booking.listingId)
        if (listing?.title) {
          return { ...booking, listingTitle: listing.title }
        }
      } catch {
        // Ignore listing fetch errors and return original booking.
      }
    }
    return booking
  }))

  return enriched.sort((a, b) => {
    const aTime = new Date(a.createdAt || a.startDate).getTime()
    const bTime = new Date(b.createdAt || b.startDate).getTime()
    return bTime - aTime
  })
}
