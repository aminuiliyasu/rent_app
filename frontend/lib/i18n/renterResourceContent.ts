import { LAUNCH_REGION_LABEL } from '@/lib/site'
import type { ResourcePageContent } from '@/lib/resourceContentTypes'
import type { Locale } from '@/lib/i18n/translations'

const en: ResourcePageContent = {
  eyebrow: 'For renters',
  title: 'Renter resources',
  description: `Find gear, spaces, and skilled people in ${LAUNCH_REGION_LABEL} — browse listings, post what you need, and book with confidence.`,
  stepsTitle: 'How renting works',
  stepsSubtitle: 'From search to review — your path on Rhentify.',
  guidesTitle: 'Renter guides',
  guidesSubtitle: 'Tap a topic to expand.',
  otherPerspective: {
    label: 'Listing something to earn?',
    href: '/resources/owners',
    cta: 'Owner resources',
  },
  quickStart: [
    {
      iconKey: 'search',
      title: 'Browse listings',
      description: `Search gear, spaces, and local pros in ${LAUNCH_REGION_LABEL}. Filter by category and location.`,
      href: '/search?location=Budapest',
      cta: 'Browse listings',
    },
    {
      iconKey: 'megaphone',
      title: 'Post a rent request',
      description:
        'Need something specific? Post what you are looking for — choose 12 or 24 hours and owners can reply.',
      href: '/feed',
      cta: 'Post a request',
    },
    {
      iconKey: 'book',
      title: 'How renting works',
      description: 'Search, pick dates, message the owner, and leave a review when the rental is complete.',
      href: '/how-it-works',
      cta: 'See the full flow',
    },
  ],
  steps: [
    {
      step: '1',
      title: 'Search & compare',
      body: 'Browse by category or location in Budapest. Check photos, daily rates in HUF, and pickup or delivery options.',
    },
    {
      step: '2',
      title: 'Request your dates',
      body: 'Pick start and end dates on the listing page and send a booking request. The owner gets notified in Messages.',
    },
    {
      step: '3',
      title: 'Coordinate in chat',
      body: 'Confirm pickup time, place, deposit, and payment in the booking thread. Keep the conversation on Rhentify.',
    },
    {
      step: '4',
      title: 'Return & review',
      body: 'Hand the item back as agreed. After the rental is marked complete, leave a review to help the next renter.',
    },
  ],
  guides: [
    {
      id: 'renter-find',
      iconKey: 'search',
      title: 'Finding the right listing',
      summary: 'What to look for before you book.',
      points: [
        'Use category filters and Budapest as your location to see what is nearby.',
        'Read the full description — check what is included, condition notes, and pickup area.',
        'Compare daily rates in HUF. Some listings also show weekly or hourly prices.',
        'Look at the owner profile and any reviews if available.',
        'Message the owner first if you are unsure about fit, dates, or delivery.',
      ],
    },
    {
      id: 'renter-request',
      iconKey: 'megaphone',
      title: 'Posting a rent request',
      summary: 'When you cannot find what you need in search.',
      points: [
        'Go to Rent requests and describe what you need, when, and roughly where in Budapest.',
        'Choose 12 or 24 hours visibility — your post disappears after that unless you publish again.',
        'Owners with a match can message you. Reply quickly while your request is still live.',
        'Be specific: item type, dates, budget in HUF if you have one, and pickup vs delivery.',
        'Once you find an owner, move to a listing or booking so dates and reviews are tracked properly.',
      ],
    },
    {
      id: 'renter-pickup',
      iconKey: 'shield',
      title: 'Before pickup & during the rental',
      summary: 'Stay safe and clear on expectations.',
      points: [
        'Confirm pickup location, time, and who you are meeting before the rental day.',
        'Ask about deposits in chat — cash amount in HUF or any ID held as security.',
        'Inspect the item at handover. Note any existing damage in the message thread.',
        'Keep payment and coordination in the booking chat when possible.',
        'See our Safety & Trust page for more on messaging and reviews.',
      ],
    },
    {
      id: 'renter-review',
      iconKey: 'star',
      title: 'After your rental',
      summary: 'Close the loop fairly.',
      points: [
        'Return the item on time and in the condition you agreed.',
        'If there is a problem, message the owner first — most issues are fixable with clear communication.',
        'Leave an honest review after the booking is marked complete.',
        'Need help with a dispute? Contact support with your booking details.',
      ],
    },
  ],
}

const hu: ResourcePageContent = {
  eyebrow: 'Bérlőknek',
  title: 'Bérlői útmutatók',
  description: `Felszerelés, helyek és szakemberek ${LAUNCH_REGION_LABEL} területén — böngéssz, írd meg mit keresel, és foglalj bizalommal.`,
  stepsTitle: 'Hogyan működik a bérlés',
  stepsSubtitle: 'Kereséstől az értékelésig — a bérlő útja a Rhentifyen.',
  guidesTitle: 'Bérlői útmutatók',
  guidesSubtitle: 'Koppints a témára a kibontáshoz.',
  otherPerspective: {
    label: 'Hirdetnél valamit a keresetért?',
    href: '/resources/owners',
    cta: 'Tulajdonosi útmutatók',
  },
  quickStart: [
    {
      iconKey: 'search',
      title: 'Hirdetések böngészése',
      description: `Keress felszerelést, helyeket és szakembereket itt: ${LAUNCH_REGION_LABEL}. Szűrj kategória és hely szerint.`,
      href: '/search?location=Budapest',
      cta: 'Hirdetések böngészése',
    },
    {
      iconKey: 'megaphone',
      title: 'Bérleti igény közzététele',
      description:
        'Valami specifikus kell? Írd le mit keresel — 12 vagy 24 órára — és a tulajdonosok válaszolhatnak.',
      href: '/feed',
      cta: 'Igény közzététele',
    },
    {
      iconKey: 'book',
      title: 'Hogyan működik a bérlés',
      description: 'Keresés, dátumok, üzenet a tulajdonosnak, majd értékelés a bérlés végén.',
      href: '/how-it-works',
      cta: 'Teljes folyamat',
    },
  ],
  steps: [
    {
      step: '1',
      title: 'Keresés és összehasonlítás',
      body: 'Böngéssz kategória vagy budapesti hely szerint. Nézd meg a fotókat, a napi HUF árat és az átvételi lehetőségeket.',
    },
    {
      step: '2',
      title: 'Dátumok kérése',
      body: 'Válaszd ki a kezdő és záró dátumot a hirdetésen, és küldj foglalási kérelmet. A tulajdonos értesítést kap az Üzenetekben.',
    },
    {
      step: '3',
      title: 'Egyeztetés chatben',
      body: 'Erősítsd meg az átvétel idejét, helyét, a kauciót és a fizetést a foglalási beszélgetésben. Maradj a Rhentifyen.',
    },
    {
      step: '4',
      title: 'Visszaadás és értékelés',
      body: 'Add vissza a tárgyat a megbeszéltek szerint. Ha a bérlés lezárult, hagyj értékelést a következő bérlőnek.',
    },
  ],
  guides: [
    {
      id: 'renter-find',
      iconKey: 'search',
      title: 'A megfelelő hirdetés megtalálása',
      summary: 'Mire figyelj foglalás előtt.',
      points: [
        'Használj kategória- és budapesti helyszűrőt a közeli ajánlatokhoz.',
        'Olvasd el a teljes leírást — mi van benne, állapot, átvételi terület.',
        'Hasonlítsd össze a napi HUF árakat. Egyes hirdetéseknél van heti vagy óradíj is.',
        'Nézd meg a tulajdonos profilját és az értékeléseket, ha vannak.',
        'Írj előbb a tulajdonosnak, ha bizonytalan vagy a illeszkedésben, dátumokban vagy szállításban.',
      ],
    },
    {
      id: 'renter-request',
      iconKey: 'megaphone',
      title: 'Bérleti igény közzététele',
      summary: 'Ha a keresésben nem találod meg, amit kell.',
      points: [
        'Menj a Bérleti igényekhez, és írd le mit, mikor és hol keresel Budapesten.',
        'Válassz 12 vagy 24 órás láthatóságot — utána a poszt eltűnik, hacsak újra nem teszed közzé.',
        'Illeszkedő tulajdonosok üzenhetnek. Válaszolj gyorsan, amíg az igény aktív.',
        'Légy konkrét: tárgy, dátumok, HUF költségkeret, átvétel vagy kiszállítás.',
        'Ha megvan a megállapodás, lépj tovább hirdetésre vagy foglalásra az nyomon követéshez.',
      ],
    },
    {
      id: 'renter-pickup',
      iconKey: 'shield',
      title: 'Átvétel előtt és a bérlés alatt',
      summary: 'Biztonságos és egyértelmű elvárások.',
      points: [
        'Erősítsd meg az átvétel helyét, idejét és azt, kivel találkozol.',
        'Kérdezd chatben a kauciót — HUF összeg vagy letétbe vett igazolvány.',
        'Ellenőrizd a tárgyat átadáskor. Rögzítsd a meglévő sérüléseket üzenetben.',
        'A fizetést és egyeztetést tartsd a foglalási chatben, ha lehet.',
        'További tippek a Biztonság és bizalom oldalon.',
      ],
    },
    {
      id: 'renter-review',
      iconKey: 'star',
      title: 'A bérlés után',
      summary: 'Tisztességes lezárás.',
      points: [
        'Add vissza időben, a megbeszélt állapotban.',
        'Probléma esetén először írj a tulajdonosnak — sok minden tisztázható.',
        'Hagyj őszinte értékelést, miután a foglalás lezárult.',
        'Vitában segít az ügyfélszolgálat — küldd el a foglalás adatait.',
      ],
    },
  ],
}

export function getRenterResourceContent(locale: Locale): ResourcePageContent {
  return locale === 'hu' ? hu : en
}
