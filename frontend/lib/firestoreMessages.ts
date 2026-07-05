import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { MessageResponse, User } from '@/lib/types'
import { requireDb } from '@/lib/firebase'
import api from '@/lib/api'
import { compareApiDateTime } from '@/lib/dateTime'

const MESSAGES_COLLECTION = 'messages'

/** Stable string used for queries (Firestore equality is type-sensitive). */
export function normalizeBookingKey(bookingId: number | string): string {
  return String(bookingId).trim()
}

function collectBookingIdVariants(bookingId: number | string): Array<number | string> {
  const key = normalizeBookingKey(bookingId)
  const variants: Array<number | string> = [key]
  const numeric = Number(key)
  if (Number.isFinite(numeric) && key === String(numeric)) {
    variants.push(numeric)
  }
  return Array.from(new Set(variants))
}

export function mergeMessageLists(a: MessageResponse[], b: MessageResponse[]): MessageResponse[] {
  const map = new Map<string, MessageResponse>()
  for (const m of [...a, ...b]) {
    map.set(String(m.id), m)
  }
  return Array.from(map.values()).sort((x, y) => compareApiDateTime(x.createdAt, y.createdAt))
}

async function loadFirestoreMessagesOnly(bookingId: number | string): Promise<MessageResponse[]> {
  const key = normalizeBookingKey(bookingId)
  const variants = collectBookingIdVariants(bookingId)

  const snapshots = await Promise.all([
    getDocs(query(collection(requireDb(), MESSAGES_COLLECTION), where('bookingKey', '==', key))),
    ...variants.map((candidate) =>
      getDocs(query(collection(requireDb(), MESSAGES_COLLECTION), where('bookingId', '==', candidate)))
    ),
  ])

  const merged = snapshots.flatMap((snap) => snap.docs.map((entry) => mapMessageDoc(entry.id, entry.data())))
  const unique = merged.filter((message, index, self) => index === self.findIndex((m) => m.id === message.id))
  return unique.sort((a, b) => compareApiDateTime(a.createdAt, b.createdAt))
}

/** Firestore thread + optional Spring `/messages/booking/{id}` when booking id is numeric. */
export async function getMessagesForBookingFromFirestore(bookingId: number | string): Promise<MessageResponse[]> {
  const fromFs = await loadFirestoreMessagesOnly(bookingId)
  const numeric = Number(bookingId)
  if (!Number.isFinite(numeric)) {
    return fromFs
  }
  try {
    const { data } = await api.get<MessageResponse[]>(`/messages/booking/${numeric}`)
    return mergeMessageLists(fromFs, data || [])
  } catch {
    return fromFs
  }
}

export async function sendMessageToFirestore(params: {
  bookingId: number | string
  content: string
  sender: User
  receiverId?: number
  attachmentUrl?: string
  messageType?: 'TEXT' | 'VOICE'
}): Promise<MessageResponse> {
  const bookingKey = normalizeBookingKey(params.bookingId)
  const now = new Date().toISOString()
  const messageType = params.messageType || 'TEXT'

  const payload = {
    bookingKey,
    bookingId: params.bookingId,
    senderId: params.sender.id,
    senderName: params.sender.name,
    senderEmail: params.sender.email,
    receiverId: params.receiverId ?? 0,
    content: params.content,
    attachmentUrl: params.attachmentUrl || '',
    messageType,
    createdAt: now,
    createdAtServer: serverTimestamp(),
  }
  const written = await addDoc(collection(requireDb(), MESSAGES_COLLECTION), payload)
  return {
    id: written.id,
    bookingId: params.bookingId,
    senderId: payload.senderId,
    sender: {
      ...params.sender,
      id: params.sender.id,
    },
    receiverId: payload.receiverId ?? 0,
    content: payload.content,
    attachmentUrl: payload.attachmentUrl || undefined,
    messageType: messageType as 'TEXT' | 'VOICE',
    createdAt: now,
  }
}

/**
 * Live updates for a booking thread. Merges `bookingKey` + legacy `bookingId` shapes.
 */
export function subscribeToMessagesForBooking(
  bookingId: number | string,
  onMessages: (messages: MessageResponse[]) => void,
  onError?: (error: Error) => void
): () => void {
  const key = normalizeBookingKey(bookingId)
  const variants = collectBookingIdVariants(bookingId)
  let timer: ReturnType<typeof setTimeout> | null = null

  const scheduleRefresh = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      getMessagesForBookingFromFirestore(bookingId)
        .then(onMessages)
        .catch((err) => {
          onError?.(err instanceof Error ? err : new Error(String(err)))
        })
    }, 80)
  }

  const unsubs: Unsubscribe[] = []

  const snapErr = (err: Error) => onError?.(err)

  unsubs.push(
    onSnapshot(
      query(collection(requireDb(), MESSAGES_COLLECTION), where('bookingKey', '==', key)),
      scheduleRefresh,
      snapErr
    )
  )

  for (const candidate of variants) {
    unsubs.push(
      onSnapshot(
        query(collection(requireDb(), MESSAGES_COLLECTION), where('bookingId', '==', candidate)),
        scheduleRefresh,
        snapErr
      )
    )
  }

  getMessagesForBookingFromFirestore(bookingId)
    .then(onMessages)
    .catch((err) => onError?.(err instanceof Error ? err : new Error(String(err))))

  const numeric = Number(bookingId)
  const backendPoll =
    Number.isFinite(numeric) && String(numeric) === normalizeBookingKey(bookingId)
      ? setInterval(() => scheduleRefresh(), 12000)
      : null

  return () => {
    if (timer) clearTimeout(timer)
    if (backendPoll) clearInterval(backendPoll)
    unsubs.forEach((u) => u())
  }
}

function mapMessageDoc(id: string, data: Record<string, unknown>): MessageResponse {
  const rawBookingId = data.bookingId
  const keyFromDoc =
    data.bookingKey != null && String(data.bookingKey).trim() !== '' ? String(data.bookingKey).trim() : null

  let bookingId: number | string
  if (keyFromDoc) {
    const asNum = Number(keyFromDoc)
    bookingId = Number.isFinite(asNum) && keyFromDoc === String(asNum) ? asNum : keyFromDoc
  } else {
    const parsed = Number(rawBookingId)
    bookingId = Number.isFinite(parsed) ? parsed : String(rawBookingId ?? '')
  }

  const messageType =
    data.messageType === 'VOICE' || data.messageType === 'TEXT'
      ? (data.messageType as 'TEXT' | 'VOICE')
      : 'TEXT'

  return {
    id,
    bookingId,
    senderId: Number(data.senderId || 0),
    sender: {
      id: Number(data.senderId || 0),
      name: String(data.senderName || 'User'),
      email: String(data.senderEmail || ''),
      role: 'RENTER' as any,
      kycStatus: 'NOT_REQUIRED',
      emailVerified: true,
      phoneVerified: false,
    },
    receiverId: Number(data.receiverId || 0),
    content: String(data.content || ''),
    attachmentUrl: data.attachmentUrl ? String(data.attachmentUrl) : undefined,
    messageType: messageType as 'TEXT' | 'VOICE',
    createdAt: String(data.createdAt || new Date().toISOString()),
  }
}
