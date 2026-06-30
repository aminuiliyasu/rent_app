export type ResourceIconKey =
  | 'search'
  | 'megaphone'
  | 'book'
  | 'plus'
  | 'dashboard'
  | 'shield'
  | 'star'
  | 'currency'
  | 'camera'
  | 'calendar'
  | 'chat'

export type ResourceQuickStart = {
  iconKey: ResourceIconKey
  title: string
  description: string
  href: string
  cta: string
}

export type ResourceStep = {
  step: string
  title: string
  body: string
}

export type ResourceGuide = {
  id: string
  iconKey: ResourceIconKey
  title: string
  summary: string
  points: readonly string[]
}

export type ResourcePageContent = {
  eyebrow: string
  title: string
  description: string
  stepsTitle: string
  stepsSubtitle: string
  guidesTitle: string
  guidesSubtitle: string
  otherPerspective: {
    label: string
    href: string
    cta: string
  }
  quickStart: ResourceQuickStart[]
  steps: ResourceStep[]
  guides: ResourceGuide[]
}

export type ResourceTheme = 'renter' | 'owner'
