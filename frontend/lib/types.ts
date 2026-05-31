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
  id: number | string
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
  id: string | number
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
  /** ISO 4217 — how to display rates (e.g. USD, EUR, HUF) */
  pricingCurrency?: string
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
  availableDays?: string
  isFeatured?: boolean
  ownerId: number
  ownerName?: string
  imageUrls?: string[]
  primaryImageUrl?: string
  averageRating?: number
  reviewCount?: number
}

export type DeliveryPreference = 'PICKUP' | 'DELIVERY' | 'EITHER'

export interface RentWishPost {
  id: number
  title: string
  description?: string
  location?: string
  district?: string
  city?: string
  country?: string
  authorId: number
  authorName: string
  createdAt: string
  expiresAt: string
  budgetText?: string | null
  deliveryPreference?: DeliveryPreference | null
}

export interface Review {
  id: number
  bookingId: number
  reviewer: User
  reviewee: User
  rating: number
  comment?: string
  isPublished: boolean
  createdAt: string
}

/** GET /users/:id/trust — trust banner + latest mutual-review snippets */
export interface UserTrust {
  averageRatingReceived: number | null
  reviewsReceivedCount: number
  latestReceived: Review | null
  latestGiven: Review | null
}

export interface BookingReviewSummary {
  canSubmitReview: boolean
  awaitingPartnerReview: boolean
  bothReviewsVisible: boolean
  myReview: Review | null
  partnerReview: Review | null
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
  confirmedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  createdAt?: string
  updatedAt?: string
  reviewSummary?: BookingReviewSummary
}

export interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  parentId?: number
}

export interface MessageResponse {
  id: number | string
  bookingId: number | string
  senderId: number | string
  sender?: User
  receiverId: number | string
  receiver?: User
  content: string
  attachmentUrl?: string
  messageType?: string
  readAt?: string
  createdAt: string
  /** STANDARD (default) | LIVE_REQUEST_REPLY (system prompt seeded for a feed-driven thread). */
  messageKind?: string
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
