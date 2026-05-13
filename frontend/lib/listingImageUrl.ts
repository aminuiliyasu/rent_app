import type { Listing } from '@/lib/types'

/** Accept Spring JSON whether camelCase or snake_case slipped through */
function rawPrimary(listing: unknown): string | undefined {
  if (!listing || typeof listing !== 'object') return undefined
  const o = listing as Record<string, unknown>
  const p = o.primaryImageUrl ?? o.primary_image_url
  return typeof p === 'string' && p.trim() ? p.trim() : undefined
}

function rawImageUrls(listing: unknown): string[] {
  if (!listing || typeof listing !== 'object') return []
  const o = listing as Record<string, unknown>
  const camel = o.imageUrls
  const snake = o.image_urls
  const arr = Array.isArray(camel) ? camel : Array.isArray(snake) ? snake : []
  return arr.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
}

function shouldStripHostForUploads(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
  return false
}

/**
 * Rewrites backend upload URLs to same-origin `/uploads/...` so the Next.js dev server
 * can proxy them (see `next.config.js` rewrites). Full HTTPS URLs (e.g. S3) stay unchanged.
 */
export function toAppListingImageUrl(url: string | null | undefined): string | null {
  if (url == null || url === '') return null
  const trimmed = url.trim()
  if (trimmed.startsWith('/uploads/')) return trimmed

  try {
    const u = new URL(trimmed)
    if (u.pathname.startsWith('/uploads/')) {
      // Typical local Spring (another port) or LAN dev — use Next `/uploads` rewrite on :3000
      const useRelative =
        shouldStripHostForUploads(u.hostname) || u.port === '8080'
      if (useRelative) {
        return `${u.pathname}${u.search}${u.hash}`
      }
    }
  } catch {
    /* ignore invalid URLs */
  }

  return trimmed
}

export function firstListingImageUrl(
  listing: Pick<Listing, 'primaryImageUrl' | 'imageUrls'>
): string | null {
  const primary = rawPrimary(listing)
  const urls = rawImageUrls(listing)
  const raw = primary ?? (urls.length > 0 ? urls[0] : undefined)
  return toAppListingImageUrl(raw ?? null)
}

export function galleryImageUrls(listing: Pick<Listing, 'primaryImageUrl' | 'imageUrls'>): string[] {
  const urls = rawImageUrls(listing)
  const primary = rawPrimary(listing)
  const raw =
    urls.length > 0 ? urls : primary ? [primary] : []
  const normalized = raw
    .map((u) => toAppListingImageUrl(u))
    .filter((x): x is string => Boolean(x))
  return Array.from(new Set(normalized))
}
