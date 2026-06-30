import type { Locale } from '@/lib/i18n/translations'
import { SEED_CATEGORY_DEFINITIONS } from '@/lib/seedCategories'

export interface AboutCategoryEntry {
  slug: string
  title: string
  summary: string
  examples: string[]
}

const en: Record<string, Omit<AboutCategoryEntry, 'slug'>> = {
  'tools-equipment': {
    title: 'Tools & DIY',
    summary: 'Power tools, hand tools, and equipment for home projects and repairs.',
    examples: ['Drills and drivers', 'Ladders and scaffolding', 'Pressure washers', 'Tile cutters', 'Tool kits'],
  },
  electronics: {
    title: 'Electronics',
    summary: 'Gadgets and gear for work, travel, events, or short-term use.',
    examples: ['Cameras and lenses', 'Laptops and tablets', 'Projectors and screens', 'Speakers and mics', 'Gaming consoles'],
  },
  'home-living': {
    title: 'Home & Living',
    summary: 'Furniture, baby items, appliances, and everyday items for your home.',
    examples: ['Sofas, tables, and beds', 'Baby strollers and cribs', 'Vacuum cleaners and air purifiers', 'Kitchen appliances', 'Garage and storage items'],
  },
  apartment: {
    title: 'Spaces',
    summary: 'Rentable rooms, corners, and spots — not full long-term leases.',
    examples: ['Desk or studio space', 'Storage rooms', 'Parking spots', 'Workshop corners', 'Pop-up or short-term use areas'],
  },
  services: {
    title: 'Professional Services',
    summary: 'Skilled people you can book by the hour or for a fixed job.',
    examples: ['Photographers and videographers', 'Cleaners and organizers', 'Tutors and coaches', 'Handymen and technicians', 'Musicians and DJs'],
  },
  vehicles: {
    title: 'Scooter & Bikes',
    summary: 'Light transport for getting around the city.',
    examples: ['E-scooters', 'City and road bikes', 'E-bikes', 'Bike trailers', 'Helmets and locks'],
  },
  'pet-lovers': {
    title: 'Pet Lovers',
    summary: 'For dog lovers, cat lovers, and pet owners — gear you can borrow instead of buying.',
    examples: ['Dog carriers and leashes', 'Cat carriers and travel crates', 'Pet strollers', 'Grooming tools', 'Beds, bowls, and outdoor gear'],
  },
  socials: {
    title: 'Socials',
    summary: 'Everything for gatherings, celebrations, and social events.',
    examples: ['Party speakers and lighting', 'Costumes and props', 'Tables, chairs, and decor', 'Photo booth gear', 'Event games and extras'],
  },
  other: {
    title: 'Other',
    summary: 'Listings that do not fit elsewhere — still welcome on Rhentify.',
    examples: ['Unique one-off items', 'Seasonal gear', 'Hobby equipment', 'Anything safe and legal to rent locally'],
  },
}

const hu: Record<string, Omit<AboutCategoryEntry, 'slug'>> = {
  'tools-equipment': {
    title: 'Szerszámok és barkács',
    summary: 'Elektromos és kézi szerszámok barkácsoláshoz, felújításhoz, DIY-hoz.',
    examples: ['Fúrók és csavarbehajtók', 'Létrák', 'Magasnyomású mosók', 'Csempevágók', 'Szerszámkészletek'],
  },
  electronics: {
    title: 'Elektronika',
    summary: 'Eszerűk munkához, utazáshoz, eseményekhez vagy rövid távú használatra.',
    examples: ['Kamerák és objektívek', 'Laptopok és tabletek', 'Projektorok', 'Hangszórók és mikrofonok', 'Játékkonzolok'],
  },
  'home-living': {
    title: 'Otthon és lakás',
    summary: 'Bútor, baba holmi, háztartási gépek és mindennapi otthoni cikkek.',
    examples: ['Kanapék, asztalok, ágyak', 'Babakocsik és bölcsők', 'Porszívók és légtisztítók', 'Konyhai gépek', 'Garázs- és tárolócikkek'],
  },
  apartment: {
    title: 'Helyiségek',
    summary: 'Bérelhető helyek, sarkok, parkolók — nem hosszú távú bérleti szerződések.',
    examples: ['Asztal vagy stúdiósarok', 'Tárolók', 'Parkolóhelyek', 'Műhelysarok', 'Rövid távú vagy pop-up terek'],
  },
  services: {
    title: 'Szakmai szolgáltatások',
    summary: 'Szakemberek óradíjra vagy meghatározott munkára foglalhatók.',
    examples: ['Fotósok és videósok', 'Takarítók', 'Magántanárok és coachok', 'Szerelők', 'Zenészek és DJ-k'],
  },
  vehicles: {
    title: 'Rollerek és biciklik',
    summary: 'Könnyű közlekedés a városban.',
    examples: ['E-rollerek', 'Városi és trekking biciklik', 'E-biciklik', 'Utánfutók', 'Sisakok és lakatok'],
  },
  'pet-lovers': {
    title: 'Állatbarát',
    summary: 'Kutyásoknak, macskásoknak és állattartóknak — felszerelés bérlésre vásárlás helyett.',
    examples: ['Kutya hordozók és pórázok', 'Macska hordozók és ketrecek', 'Kutyabuggik', 'Ápoló eszközök', 'Fekhelyek, tálak, kinti felszerelés'],
  },
  socials: {
    title: 'Socialok',
    summary: 'Bulik, ünnepségek és közösségi események felszerelése.',
    examples: ['Hangosítás és fények', 'Jelmezek és kellékek', 'Asztalok, székek, dekor', 'Fotóbox', 'Játékok és extrák'],
  },
  other: {
    title: 'Egyéb',
    summary: 'Ami máshova nem illik — nálunk is szívesen látjuk.',
    examples: ['Egyedi, egyszeri cikkek', 'Szezonális holmik', 'Hobbi felszerelés', 'Bármi biztonságos és legális helyi bérlésre'],
  },
}

export function getAboutCategoryGuide(locale: Locale): AboutCategoryEntry[] {
  const map = locale === 'hu' ? hu : en
  return SEED_CATEGORY_DEFINITIONS.map(({ slug }) => {
    const entry = map[slug]
    return {
      slug,
      title: entry?.title ?? slug,
      summary: entry?.summary ?? '',
      examples: entry?.examples ?? [],
    }
  })
}

export const aboutCategoryGuideIntro = {
  en: {
    heading: 'What you can list',
    subheading:
      'Rhentify uses focused categories so renters find the right gear, spaces, and people quickly. When you post a listing, pick the category that best matches what you offer.',
  },
  hu: {
    heading: 'Mit adhatsz fel',
    subheading:
      'A Rhentify célzott kategóriákat használ, hogy a bérlők gyorsan megtalálják a megfelelő holmit, helyet vagy embert. Hirdetés feladásakor válaszd a legjobban illő kategóriát.',
  },
} as const
