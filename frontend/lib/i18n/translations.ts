export type Locale = 'en' | 'hu'

export type TranslationKey = keyof typeof en

const en = {
  // Navbar
  'nav.browse': 'Browse',
  'nav.rentRequests': 'Request',
  'nav.postListing': 'Post Listing',
  'nav.dashboard': 'Dashboard',
  'nav.messages': 'Messages',
  'nav.profile': 'Profile',
  'nav.login': 'Login',
  'nav.signUp': 'Sign Up',
  'nav.logout': 'Logout',
  'nav.toggleTheme': 'Toggle theme',
  'nav.language': 'Language',

  // Footer
  'footer.tagline': 'Rent what you need. Hire who you trust.',
  'footer.subtitle': 'The local marketplace for gear, spaces, and skilled people — now live in Budapest.',
  'footer.contactSupport': 'Contact support →',
  'footer.followUs': 'Follow us',
  'footer.forRenters': 'For Renters',
  'footer.browseListings': 'Browse Listings',
  'footer.howItWorks': 'How It Works',
  'footer.safetyTrust': 'Safety & Trust',
  'footer.renterResources': 'Renter resources',
  'footer.forOwners': 'For Owners',
  'footer.postAListing': 'Post a Listing',
  'footer.ownerResources': 'Owner resources',
  'footer.company': 'Company',
  'footer.aboutUs': 'About Us',
  'footer.contact': 'Contact',
  'footer.termsConditions': 'Terms & Conditions',
  'footer.privacyPolicy': 'Privacy Policy',
  'footer.rightsReserved': 'All rights reserved.',
  'footer.terms': 'Terms',
  'footer.privacy': 'Privacy',
  'footer.cookies': 'Cookies',

  // Hero
  'hero.nowLive': 'Now live in {region}',
  'hero.eyebrow': 'Access over ownership',
  'hero.titleLine1': 'Rent what you need.',
  'hero.titleLine2': 'Hire who you trust.',
  'hero.subtitle':
    'Why buy when you can borrow? Earn from what you already own. Items, spaces, and skills from your community — booked in minutes.',
  'hero.searchPlaceholder': 'Try: camera, drill, van, photographer…',
  'hero.searchAria': 'Search listings',
  'hero.searchButton': 'Search',
  'hero.trust1': 'Verified local listings',
  'hero.trust2': 'Secure in-app messaging',
  'hero.trust3': 'No platform fees',
  'hero.listCta': 'List something you own',
  'hero.howCta': 'See how Rhentify works',
  'hero.stat1Value': 'Minutes',
  'hero.stat1Label': 'to book nearby',
  'hero.stat2Value': '100%',
  'hero.stat2Label': 'local-first',
  'hero.stat3Value': '0 Ft',
  'hero.stat3Label': 'platform fee',

  // How it works
  'howItWorks.titlePrefix': 'How it',
  'howItWorks.titleHighlight': 'works',
  'howItWorks.subtitle': 'Four simple steps to rent or earn in {region}',
  'howItWorks.feeNote': 'No platform fees — agree details in chat, then book.',
  'howItWorks.forRenters': 'For renters',
  'howItWorks.forOwners': 'For owners',
  'howItWorks.step1Title': 'Search locally',
  'howItWorks.step1Desc':
    'Browse gear, spaces, and services near you — filter by category, district, or what you need.',
  'howItWorks.step2Title': 'Message & book',
  'howItWorks.step2Desc':
    'Ask questions in the app, agree dates and price, then confirm the booking together.',
  'howItWorks.step3Title': 'Meet or pick up',
  'howItWorks.step3Desc':
    'Collect the item, use the space, or welcome your service provider at the agreed time.',
  'howItWorks.step4Title': 'Review & repeat',
  'howItWorks.step4Desc':
    'Leave feedback after the rental — it helps the community and your next booking.',
  'howItWorks.owner1Title': 'List in minutes',
  'howItWorks.owner1Desc': 'Post gear, a space, or a service with photos, rates, and availability.',
  'howItWorks.owner2Title': 'Get requests',
  'howItWorks.owner2Desc': 'Renters find your listing, message you, and book when it suits you.',
  'howItWorks.owner3Title': 'Hand over & earn',
  'howItWorks.owner3Desc': 'Arrange pickup or a visit — payment terms stay between you and the renter.',
  'howItWorks.owner4Title': 'Build trust',
  'howItWorks.owner4Desc': 'Good reviews bring repeat bookings and a stronger local reputation.',
  'howItWorks.browseCta': 'Browse listings',
  'howItWorks.listCta': 'List something you own',
  'howItWorks.safetyLink': 'Safety & trust tips',

  // Profile — language
  'profile.myProfile': 'My Profile',
  'profile.languageTitle': 'Platform language',
  'profile.languageDesc':
    'Choose how navigation, footer, home, categories, and resource guides are shown. More pages will follow in Hungarian over time.',
  'profile.english': 'English',
  'profile.englishHint': 'Default — full coverage in Phase 1',
  'profile.hungarian': 'Magyar',
  'profile.hungarianHint': 'Hungarian — navigation, footer, home, categories & resources',
  'profile.languageChanged': 'Language updated',

  // Profile — existing (partial Phase 1)
  'profile.saveChanges': 'Save Changes',
  'profile.saving': 'Saving...',
  'profile.cancel': 'Cancel',
  'common.yes': 'Yes',
  'common.no': 'No',

  // Categories
  'category.browsePrefix': 'Browse by',
  'category.browseHighlight': 'Category',
  'category.subtitle':
    'Focused categories for renting in Budapest — tools, tech, home, pets, socials, and more.',
  'category.label': 'Category',
  'category.all': 'All categories',

  // Search
  'search.itemLabel': 'Item or service',
  'search.itemPlaceholder': 'Camera, drill, photographer…',
  'search.districtLabel': 'District',
  'search.districtPlaceholder': 'e.g. 9th district',
  'search.areaLabel': 'Area',
  'search.areaPlaceholder': 'e.g. Budapest, Hungary',
  'search.locationLabel': 'District or area',
  'search.locationPlaceholder': 'e.g. 9th district, Budapest, Hungary',
  'search.submit': 'Search',
  'search.browseCategories': 'Browse categories',
  'search.allCategories': 'All',

  'filters.title': 'Filters',
  'filters.active': '{count} active',
  'filters.toggleHide': 'Hide filters',
  'filters.toggleShow': 'Show filters',
  'filters.type': 'Listing type',
  'filters.allTypes': 'All types',
  'filters.items': 'Items',
  'filters.workers': 'Services & people',
  'filters.priceRange': 'Price per day',
  'filters.min': 'Min',
  'filters.max': 'Max',
  'filters.resetRefinements': 'Clear refinements',
  'filters.resetAll': 'Clear all filters',

  // Resources hub
  'resources.hubTitle': 'Resources',
  'resources.hubSubtitle':
    'Separate guides for renters and owners in {region}. Choose the path that fits you.',
  'resources.renterTitle': 'Renter resources',
  'resources.renterDesc':
    'Browse listings, post rent requests, book dates, stay safe at pickup, and leave reviews.',
  'resources.renterCta': 'Open renter guides',
  'resources.ownerTitle': 'Owner resources',
  'resources.ownerDesc':
    'Create listings, price in HUF, reply to bookings and rent requests, and earn strong reviews.',
  'resources.ownerCta': 'Open owner guides',

  // Resource guide shell
  'resources.quickStart': 'Quick start',
  'resources.needHelp': 'Need more help?',
  'resources.needHelpDesc': 'Safety tips, support, and community updates.',
  'resources.safetyTrust': 'Safety & Trust',
  'resources.contactSupport': 'Contact support',
  'resources.followRhentify': 'Follow Rhentify',
} as const

const hu: Record<TranslationKey, string> = {
  'nav.browse': 'Böngészés',
  'nav.rentRequests': 'Kérés',
  'nav.postListing': 'Hirdetés feladása',
  'nav.dashboard': 'Irányítópult',
  'nav.messages': 'Üzenetek',
  'nav.profile': 'Profil',
  'nav.login': 'Bejelentkezés',
  'nav.signUp': 'Regisztráció',
  'nav.logout': 'Kijelentkezés',
  'nav.toggleTheme': 'Téma váltása',
  'nav.language': 'Nyelv',

  'footer.tagline': 'Bérelj, amire szükséged van. Bízz abban, kit felveszel.',
  'footer.subtitle':
    'Helyi piactér felszerelésre, helyekre és szakemberekre — most Budapesten elérhető.',
  'footer.contactSupport': 'Ügyfélszolgálat →',
  'footer.followUs': 'Kövess minket',
  'footer.forRenters': 'Bérlőknek',
  'footer.browseListings': 'Hirdetések böngészése',
  'footer.howItWorks': 'Hogyan működik',
  'footer.safetyTrust': 'Biztonság és bizalom',
  'footer.renterResources': 'Bérlői útmutatók',
  'footer.forOwners': 'Tulajdonosoknak',
  'footer.postAListing': 'Hirdetés feladása',
  'footer.ownerResources': 'Tulajdonosi útmutatók',
  'footer.company': 'Cég',
  'footer.aboutUs': 'Rólunk',
  'footer.contact': 'Kapcsolat',
  'footer.termsConditions': 'Általános szerződési feltételek',
  'footer.privacyPolicy': 'Adatvédelmi irányelvek',
  'footer.rightsReserved': 'Minden jog fenntartva.',
  'footer.terms': 'Feltételek',
  'footer.privacy': 'Adatvédelem',
  'footer.cookies': 'Sütik',

  'hero.nowLive': 'Most elérhető: {region}',
  'hero.eyebrow': 'Hozzáférés a tulajdonlás helyett',
  'hero.titleLine1': 'Bérelj, amire szükséged van.',
  'hero.titleLine2': 'Bízz abban, kit felveszel.',
  'hero.subtitle':
    'Miért vennéd meg, ha bérelhetsz? Keress azzal, amid már megvan. Tárgyak, helyek és szolgáltatások a közösségedtől — percek alatt foglalható.',
  'hero.searchPlaceholder': 'Pl.: kamera, fúró, furgon, fotós…',
  'hero.searchAria': 'Hirdetések keresése',
  'hero.searchButton': 'Keresés',
  'hero.trust1': 'Ellenőrzött helyi hirdetések',
  'hero.trust2': 'Biztonságos alkalmazáson belüli üzenetküldés',
  'hero.trust3': 'Nincs platformdíj',
  'hero.listCta': 'Add fel, amid van',
  'hero.howCta': 'Így működik a Rhentify',
  'hero.stat1Value': 'Percek',
  'hero.stat1Label': 'a közeli foglaláshoz',
  'hero.stat2Value': '100%',
  'hero.stat2Label': 'helyi fókusz',
  'hero.stat3Value': '0 Ft',
  'hero.stat3Label': 'platformdíj',

  'howItWorks.titlePrefix': 'Hogyan',
  'howItWorks.titleHighlight': 'működik',
  'howItWorks.subtitle': 'Négy egyszerű lépés bérléshez vagy keresethez itt: {region}',
  'howItWorks.feeNote': 'Nincs platformdíj — egyeztess üzenetben, aztán foglalj.',
  'howItWorks.forRenters': 'Bérlőknek',
  'howItWorks.forOwners': 'Tulajdonosoknak',
  'howItWorks.step1Title': 'Keress helyben',
  'howItWorks.step1Desc':
    'Böngéssz felszerelés, helyiség és szolgáltatás hirdetéseket — szűrj kategória vagy kerület szerint.',
  'howItWorks.step2Title': 'Írj és foglalj',
  'howItWorks.step2Desc':
    'Kérdezz az alkalmazásban, egyezz meg időpontban és árban, majd erősítsd meg a foglalást.',
  'howItWorks.step3Title': 'Találkozz vagy vedd át',
  'howItWorks.step3Desc':
    'Vedd át a tárgyat, használd a helyet, vagy fogadd a szolgáltatót a megbeszélt időben.',
  'howItWorks.step4Title': 'Értékelj és térj vissza',
  'howItWorks.step4Desc':
    'Ossz meg visszajelzést a bérlés után — ez segít a közösségnek és a következő foglalásnak.',
  'howItWorks.owner1Title': 'Add fel percek alatt',
  'howItWorks.owner1Desc': 'Tárgy, hely vagy szolgáltatás — fotók, árak és elérhetőség.',
  'howItWorks.owner2Title': 'Kapj megkereséseket',
  'howItWorks.owner2Desc': 'A bérlők megtalálnak, üzennek, és foglalnak, ha neked is megfelel.',
  'howItWorks.owner3Title': 'Add át és keress',
  'howItWorks.owner3Desc': 'Egyeztess átvételt vagy látogatást — a fizetés köztetek marad.',
  'howItWorks.owner4Title': 'Építs bizalmat',
  'howItWorks.owner4Desc': 'A jó értékelések ismétlődő foglalásokat és erős helyi hírnevet hoznak.',
  'howItWorks.browseCta': 'Hirdetések böngészése',
  'howItWorks.listCta': 'Add fel, amid van',
  'howItWorks.safetyLink': 'Biztonság és bizalom',

  'profile.myProfile': 'Profilom',
  'profile.languageTitle': 'Platform nyelve',
  'profile.languageDesc':
    'Válaszd ki a navigáció, lábléc, kezdőlap, kategóriák és útmutatók nyelvét. További oldalak magyarul hamarosan.',
  'profile.english': 'English',
  'profile.englishHint': 'Alapértelmezett — teljes Phase 1 lefedettség',
  'profile.hungarian': 'Magyar',
  'profile.hungarianHint': 'Magyar — navigáció, lábléc, kezdőlap, kategóriák és útmutatók',
  'profile.languageChanged': 'Nyelv frissítve',

  'profile.saveChanges': 'Mentés',
  'profile.saving': 'Mentés…',
  'profile.cancel': 'Mégse',
  'common.yes': 'Igen',
  'common.no': 'Nem',

  'category.browsePrefix': 'Böngészés',
  'category.browseHighlight': 'kategória szerint',
  'category.subtitle':
    'Budapesti bérléshez — szerszámok, tech, otthon, állatok, socialok és még sok más.',
  'category.label': 'Kategória',
  'category.all': 'Minden kategória',

  'search.itemLabel': 'Tárgy vagy szolgáltatás',
  'search.itemPlaceholder': 'Kamera, fúró, fotós…',
  'search.districtLabel': 'Kerület',
  'search.districtPlaceholder': 'pl. IX. kerület',
  'search.areaLabel': 'Terület',
  'search.areaPlaceholder': 'pl. Budapest, Magyarország',
  'search.locationLabel': 'Kerület vagy terület',
  'search.locationPlaceholder': 'pl. IX. kerület, Budapest',
  'search.submit': 'Keresés',
  'search.browseCategories': 'Kategóriák',
  'search.allCategories': 'Mind',

  'filters.title': 'Szűrők',
  'filters.active': '{count} aktív',
  'filters.toggleHide': 'Szűrők elrejtése',
  'filters.toggleShow': 'Szűrők megjelenítése',
  'filters.type': 'Hirdetés típusa',
  'filters.allTypes': 'Minden típus',
  'filters.items': 'Tárgyak',
  'filters.workers': 'Szolgáltatások és személyek',
  'filters.priceRange': 'Napi ár',
  'filters.min': 'Min',
  'filters.max': 'Max',
  'filters.resetRefinements': 'Szűkítés törlése',
  'filters.resetAll': 'Minden szűrő törlése',

  'resources.hubTitle': 'Útmutatók',
  'resources.hubSubtitle':
    'Külön útmutatók bérlőknek és tulajdonosoknak — {region}. Válaszd a neked való utat.',
  'resources.renterTitle': 'Bérlői útmutatók',
  'resources.renterDesc':
    'Hirdetések böngészése, igény posztolása, foglalás, biztonságos átvétel és értékelés.',
  'resources.renterCta': 'Bérlői útmutatók megnyitása',
  'resources.ownerTitle': 'Tulajdonosi útmutatók',
  'resources.ownerDesc':
    'Hirdetés létrehozása, HUF árazás, foglalásokra és igényekre válasz, erős értékelések.',
  'resources.ownerCta': 'Tulajdonosi útmutatók megnyitása',

  'resources.quickStart': 'Gyors kezdés',
  'resources.needHelp': 'További segítség?',
  'resources.needHelpDesc': 'Biztonsági tippek, ügyfélszolgálat és közösségi hírek.',
  'resources.safetyTrust': 'Biztonság és bizalom',
  'resources.contactSupport': 'Ügyfélszolgálat',
  'resources.followRhentify': 'Kövess minket',
}

export const translations = { en, hu } as const

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string>,
): string {
  let text = translations[locale][key] ?? translations.en[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v)
    }
  }
  return text
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  hu: 'HU',
}

export const LOCALE_STORAGE_KEY = 'rhentify-locale'
