/**
 * Listing prices use ISO 4217 codes; amounts are stored as numbers in that currency.
 */

export type CurrencyPresentation = 'iso' | 'symbol'

export const DEFAULT_LISTING_CURRENCY = 'HUF'

export const LISTING_CURRENCY_OPTIONS: { code: string; label: string }[] = [
  { code: 'HUF', label: 'Hungarian Forint (HUF)' },
  { code: 'USD', label: 'US Dollar (USD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'GBP', label: 'British Pound (GBP)' },
  { code: 'NGN', label: 'Nigerian Naira (NGN)' },
]

export function getListingCurrencyCode(listing: { pricingCurrency?: string | null }): string {
  const c = listing.pricingCurrency?.trim().toUpperCase()
  return c && c.length === 3 ? c : DEFAULT_LISTING_CURRENCY
}

/**
 * @param presentation `iso` = show ISO 4217 in the string (e.g. "HUF 3,000.00", "USD 25.00");
 *   `symbol` = locale symbol (e.g. Ft, $).
 */
export function formatMoneyAmount(
  amount: number | undefined | null,
  currencyCode: string | undefined,
  presentation: CurrencyPresentation = 'iso'
): string {
  if (amount == null || Number.isNaN(amount)) return '—'
  const code = (currencyCode || DEFAULT_LISTING_CURRENCY).toUpperCase()
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      currencyDisplay: presentation === 'iso' ? 'code' : 'symbol',
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${code} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }
}

function suffixToPeriodLabel(suffix: string): string {
  switch (suffix) {
    case '/day':
      return 'per day'
    case '/hr':
      return 'per hour'
    case '/wk':
      return 'per week'
    case '/mo':
      return 'per month'
    default:
      return suffix.replace(/^\//, '')
  }
}

export type ListingCardPrice = {
  formatted: string
  suffix: string
  periodLabel: string
  currencyCode: string
}

/** Primary rate shown on cards: prefers daily, then hourly, week, month. */
export function formatListingCardPrice(
  listing: {
    pricingCurrency?: string | null
    priceDay?: number | null
    priceHour?: number | null
    priceWeek?: number | null
    priceMonth?: number | null
  },
  presentation: CurrencyPresentation = 'iso'
): ListingCardPrice | null {
  const c = getListingCurrencyCode(listing)
  if (listing.priceDay != null && listing.priceDay > 0) {
    const suffix = '/day'
    return {
      formatted: formatMoneyAmount(listing.priceDay, c, presentation),
      suffix,
      periodLabel: suffixToPeriodLabel(suffix),
      currencyCode: c,
    }
  }
  if (listing.priceHour != null && listing.priceHour > 0) {
    const suffix = '/hr'
    return {
      formatted: formatMoneyAmount(listing.priceHour, c, presentation),
      suffix,
      periodLabel: suffixToPeriodLabel(suffix),
      currencyCode: c,
    }
  }
  if (listing.priceWeek != null && listing.priceWeek > 0) {
    const suffix = '/wk'
    return {
      formatted: formatMoneyAmount(listing.priceWeek, c, presentation),
      suffix,
      periodLabel: suffixToPeriodLabel(suffix),
      currencyCode: c,
    }
  }
  if (listing.priceMonth != null && listing.priceMonth > 0) {
    const suffix = '/mo'
    return {
      formatted: formatMoneyAmount(listing.priceMonth, c, presentation),
      suffix,
      periodLabel: suffixToPeriodLabel(suffix),
      currencyCode: c,
    }
  }
  return null
}

/** Removes legacy appended pricing appendix from listing descriptions (display-only). */
export function stripLegacyPricingAppendix(description: string | undefined | null): string {
  if (!description) return ''
  let s = description
  s = s.replace(/\r\n/g, '\n')
  const marker = '\n\n[Pricing as entered]'
  const idx = s.indexOf(marker)
  if (idx >= 0) {
    s = s.slice(0, idx)
  }
  return s.trimEnd()
}
