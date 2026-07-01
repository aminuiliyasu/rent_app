import api from '@/lib/api'
import { parsePriceWithCurrency } from '@/lib/parsePriceInput'
import { DEFAULT_LISTING_CURRENCY, getListingCurrencyCode } from '@/lib/listingCurrency'
import { Listing, ListingType } from '@/lib/types'
import toast from 'react-hot-toast'

export interface ListingFormData {
  type: ListingType
  title: string
  description: string
  categoryId: string
  priceDay: string
  priceWeek: string
  priceMonth: string
  priceHour: string
  cashDeposit: string
  itemDeposit: string
  address: string
  city: string
  state: string
  country: string
  deliveryOption: string
  deliveryRadius: string
  workerName: string
  workerBio: string
  workerProfession: string
  serviceArea: string
  availableDays: string
  pricingCurrency: string
}

export function emptyListingFormData(): ListingFormData {
  return {
    type: ListingType.ITEM,
    title: '',
    description: '',
    categoryId: '',
    priceDay: '',
    priceWeek: '',
    priceMonth: '',
    priceHour: '',
    cashDeposit: '',
    itemDeposit: '',
    address: '',
    city: '',
    state: '',
    country: '',
    deliveryOption: 'PICKUP_ONLY',
    deliveryRadius: '',
    workerName: '',
    workerBio: '',
    workerProfession: '',
    serviceArea: '',
    availableDays: '',
    pricingCurrency: DEFAULT_LISTING_CURRENCY,
  }
}

export function listingToFormData(listing: Listing): ListingFormData {
  return {
    type: listing.type,
    title: listing.title,
    description: listing.description ?? '',
    categoryId: String(listing.categoryId),
    priceDay: listing.priceDay != null ? String(listing.priceDay) : '',
    priceWeek: listing.priceWeek != null ? String(listing.priceWeek) : '',
    priceMonth: listing.priceMonth != null ? String(listing.priceMonth) : '',
    priceHour: listing.priceHour != null ? String(listing.priceHour) : '',
    cashDeposit: listing.deposit != null ? String(listing.deposit) : '',
    itemDeposit: '',
    address: listing.address ?? '',
    city: listing.city ?? '',
    state: listing.state ?? '',
    country: listing.country ?? '',
    deliveryOption: listing.deliveryOption ?? 'PICKUP_ONLY',
    deliveryRadius: listing.deliveryRadius != null ? String(listing.deliveryRadius) : '',
    workerName: listing.workerName ?? '',
    workerBio: listing.workerBio ?? '',
    workerProfession: listing.workerProfession ?? '',
    serviceArea: listing.serviceArea ?? '',
    availableDays: listing.availableDays ?? '',
    pricingCurrency: getListingCurrencyCode(listing),
  }
}

export async function buildListingPayload(
  formData: ListingFormData,
  selectedImages: string[],
): Promise<Record<string, unknown> | null> {
  const rawCashDeposit = formData.cashDeposit.trim()
  const parsedCashDeposit = rawCashDeposit ? Number(rawCashDeposit) : null
  const hasNumericCashDeposit = parsedCashDeposit !== null && Number.isFinite(parsedCashDeposit)
  const cashDepositNote = rawCashDeposit && !hasNumericCashDeposit ? rawCashDeposit : null
  const itemDepositNote = formData.itemDeposit.trim() || null
  const depositNotes = [
    cashDepositNote ? `Cash deposit note: ${cashDepositNote}` : null,
    itemDepositNote ? `Item deposit: ${itemDepositNote}` : null,
  ].filter(Boolean)
  const descriptionWithDepositNote = depositNotes.length
    ? `${formData.description || ''}${formData.description ? '\n\n' : ''}${depositNotes.join('\n')}`
    : formData.description

  const selectedCur = formData.pricingCurrency.trim().toUpperCase() || DEFAULT_LISTING_CURRENCY

  const embeddedCurrencyClashes = (label: string, raw: string) => {
    const t = raw.trim()
    const m = t.match(/^([A-Za-z]{3})\s+/)
    if (m && m[1].toUpperCase() !== selectedCur) {
      toast.error(
        `${label}: remove "${m[1].toUpperCase()}" from the field — enter amounts in ${selectedCur} only, or change the listing currency above.`,
      )
      return false
    }
    return true
  }

  const parsedHour = parsePriceWithCurrency(formData.priceHour)
  const parsedDay = parsePriceWithCurrency(formData.priceDay)
  const parsedWeek = parsePriceWithCurrency(formData.priceWeek)
  const parsedMonth = parsePriceWithCurrency(formData.priceMonth)

  const requireParsed = (label: string, raw: string, parsed: { amount: number | null }) => {
    if (!raw.trim()) return true
    if (parsed.amount === null) {
      toast.error(`${label}: enter a number (e.g. 25 or 19.99) in ${selectedCur}`)
      return false
    }
    return true
  }

  if (
    !embeddedCurrencyClashes('Hourly rate', formData.priceHour) ||
    !embeddedCurrencyClashes('Daily rate', formData.priceDay) ||
    !embeddedCurrencyClashes('Weekly rate', formData.priceWeek) ||
    !embeddedCurrencyClashes('Monthly rate', formData.priceMonth) ||
    !requireParsed('Hourly rate', formData.priceHour, parsedHour) ||
    !requireParsed('Daily rate', formData.priceDay, parsedDay) ||
    !requireParsed('Weekly rate', formData.priceWeek, parsedWeek) ||
    !requireParsed('Monthly rate', formData.priceMonth, parsedMonth)
  ) {
    return null
  }

  if (formData.type === ListingType.WORKER) {
    if (!formData.workerProfession?.trim()) {
      toast.error('Please enter your profession')
      return null
    }
    if (parsedHour.amount == null) {
      toast.error('Please enter an hourly rate for your service')
      return null
    }
  }

  const catVal = formData.categoryId
  if (!catVal) {
    toast.error('Please select a category')
    return null
  }

  let resolvedCategoryId: number
  if (catVal.startsWith('slug:')) {
    const slug = catVal.slice(5)
    try {
      const res = await api.get(`/categories/by-slug/${encodeURIComponent(slug)}`)
      resolvedCategoryId = res.data.id
    } catch {
      toast.error(
        'This category is not available in the database yet. Restart the Spring Boot server so categories can be seeded, then try again.',
      )
      return null
    }
  } else {
    resolvedCategoryId = Number(catVal)
    if (!Number.isFinite(resolvedCategoryId) || resolvedCategoryId <= 0) {
      toast.error('Invalid category')
      return null
    }
  }

  return {
    ...formData,
    description: descriptionWithDepositNote,
    categoryId: resolvedCategoryId,
    priceHour: parsedHour.amount,
    priceDay: parsedDay.amount,
    priceWeek: parsedWeek.amount,
    priceMonth: parsedMonth.amount,
    deposit: hasNumericCashDeposit ? parsedCashDeposit : null,
    pricingCurrency: selectedCur,
    deliveryRadius: formData.deliveryRadius ? Number(formData.deliveryRadius) : null,
    availableDays: formData.availableDays || null,
    imageUrls: selectedImages,
  }
}
