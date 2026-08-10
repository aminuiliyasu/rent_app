/** Shared marketing / support constants for Rhentify. */
export const SITE_NAME = 'Rhentify'

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@rhentify.com'

export const LAUNCH_CITY = 'Budapest'
export const LAUNCH_COUNTRY = 'Hungary'
export const LAUNCH_REGION_LABEL = `${LAUNCH_CITY}, ${LAUNCH_COUNTRY}`

export const SITE_TAGLINE = 'Rent what you need. Hire who you trust.'

export const ONBOARDING_DISMISSED_KEY = 'rhentify_onboarding_dismissed'

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/share/1b7FaQSp7j/',
  instagram: 'https://www.instagram.com/rhentify',
  tiktok: 'https://www.tiktok.com/@rhentify',
} as const
