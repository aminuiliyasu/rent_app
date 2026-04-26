export enum UserRole {
  GUEST = 'GUEST',
  RENTER = 'RENTER',
  OWNER = 'OWNER',
  BOTH = 'BOTH',
  ADMIN = 'ADMIN',
}

export enum ListingType {
  ITEM = 'ITEM',
  WORKER = 'WORKER',
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: UserRole
  kycStatus: string
  avatarUrl?: string
  emailVerified: boolean
  phoneVerified: boolean
}

export interface Listing {
  id: number
  type: ListingType
  title: string
  description?: string
  categoryId: number
  categoryName?: string
  priceDay?: number
  priceWeek?: number
  priceMonth?: number
  priceHour?: number
  deposit?: number
  status: ListingStatus
  lat?: number
  lng?: number
  address?: string
  city?: string
  state?: string
  country?: string
  deliveryOption?: string
  deliveryRadius?: number
  workerName?: string
  workerBio?: string
  workerProfession?: string
  serviceArea?: string
  isFeatured?: boolean
  ownerId: number
  ownerName?: string
  imageUrls?: string[]
  primaryImageUrl?: string
  averageRating?: number
  reviewCount?: number
}

export interface Booking {
  id: number
  listingId: number
  listing?: Listing
  renterId: number
  renter?: User
  ownerId?: number
  owner?: User
  startDate: string
  endDate: string
  status: BookingStatus
  totalAmount: number
  deposit: number
  platformFee: number
  currency: string
  paymentId?: string
  confirmedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  parentId?: number
}

export interface MessageResponse {
  id: number
  bookingId: number
  senderId: number
  sender?: User
  receiverId: number
  receiver?: User
  content: string
  attachmentUrl?: string
  readAt?: string
  createdAt: string
}

export enum CallType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export enum CallStatus {
  INITIATED = 'INITIATED',
  RINGING = 'RINGING',
  ANSWERED = 'ANSWERED',
  REJECTED = 'REJECTED',
  MISSED = 'MISSED',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED'
}

export interface Call {
  id: number
  callId: string
  callerId: number
  caller?: User
  receiverId: number
  receiver?: User
  bookingId?: number
  type: CallType
  status: CallStatus
  startedAt?: string
  endedAt?: string
  durationSeconds?: number
  createdAt?: string
}
