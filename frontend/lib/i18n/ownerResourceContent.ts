import { LAUNCH_REGION_LABEL } from '@/lib/site'
import type { ResourcePageContent } from '@/lib/resourceContentTypes'
import type { Locale } from '@/lib/i18n/translations'

const en: ResourcePageContent = {
  eyebrow: 'For owners',
  title: 'Owner resources',
  description: `List items or services in ${LAUNCH_REGION_LABEL}, respond to bookings and live rent requests, and grow with reviews.`,
  stepsTitle: 'How hosting works',
  stepsSubtitle: 'From first listing to your first review — the owner side of Rhentify.',
  guidesTitle: 'Owner guides',
  guidesSubtitle: 'Tap a topic to expand.',
  otherPerspective: {
    label: 'Looking to rent instead?',
    href: '/resources/renters',
    cta: 'Renter resources',
  },
  quickStart: [
    {
      iconKey: 'plus',
      title: 'Create your first listing',
      description:
        'Add photos, set rates in HUF, and choose pickup or delivery. Active listings show up in search within minutes.',
      href: '/listings/new',
      cta: 'Post a listing',
    },
    {
      iconKey: 'dashboard',
      title: 'Manage from your dashboard',
      description:
        'Track bookings, reply to messages, and keep your listings up to date — all in one place.',
      href: '/dashboard',
      cta: 'Open dashboard',
    },
    {
      iconKey: 'megaphone',
      title: 'Reply to live rent requests',
      description: `Renters post what they need on the feed. If you have a match in ${LAUNCH_REGION_LABEL.split(',')[0]}, message them while the request is live.`,
      href: '/feed',
      cta: 'Browse rent requests',
    },
  ],
  steps: [
    {
      step: '1',
      title: 'List your item or service',
      body: 'Pick the right category, upload clear photos, and set a daily rate in HUF. Mention pickup area or delivery if you offer it.',
    },
    {
      step: '2',
      title: 'Get a booking request',
      body: 'A renter picks dates and sends a request. You will see it on your dashboard and in Messages — reply quickly to build trust.',
    },
    {
      step: '3',
      title: 'Hand over & coordinate in chat',
      body: 'Confirm time, place, deposit, and payment in the booking thread. Keep the conversation on Rhentify for your records.',
    },
    {
      step: '4',
      title: 'Complete & earn a review',
      body: 'When the rental finishes, mark the booking complete. Both sides can leave a review — good reviews bring the next booking.',
    },
  ],
  guides: [
    {
      id: 'owner-pricing',
      iconKey: 'currency',
      title: 'Pricing your listing in HUF',
      summary: 'Set a daily rate renters understand at a glance.',
      points: [
        'List your main rate as price per day in Hungarian Forint (HUF). Add weekly or monthly rates if you offer longer rentals.',
        'Check similar listings in Budapest for the same category — tools, cameras, and event gear often rent for 2,000–15,000 Ft/day depending on value.',
        'Professional services: use an hourly or daily rate that reflects your time, travel, and equipment.',
        'Be clear about what is included (cables, bags, setup) so renters are not surprised at pickup.',
        'You can adjust pricing anytime from your listing edit page.',
      ],
    },
    {
      id: 'owner-photos',
      iconKey: 'camera',
      title: 'Photos that convert',
      summary: 'Good photos are the fastest way to get booked.',
      points: [
        'Use daylight when you can — near a window or outside. Avoid dark, blurry shots.',
        'Upload at least 3 photos: front, detail, and scale (next to a common object or in context).',
        'Show wear or scratches honestly. Trust beats a perfect photo that disappoints at handover.',
        'For services, include a friendly profile-style photo and any tools or credentials you want to highlight.',
        'Skip watermarks and heavy filters — renters want to see the real item.',
      ],
    },
    {
      id: 'owner-deposits',
      iconKey: 'calendar',
      title: 'Deposits & handover',
      summary: 'Set expectations before the rental starts.',
      points: [
        'Cash deposit: enter a numeric amount in HUF if you want a refundable hold (e.g. 10,000–50,000 Ft for high-value gear).',
        'Item deposit: describe what you hold as security (e.g. ID card, passport) — spell this out in chat too.',
        'Agree pickup location, time window, and who meets whom before the rental date.',
        'For delivery, confirm radius, fee, and whether the renter returns the item or you collect it.',
        'If something feels off, pause and message support before handing over expensive equipment.',
      ],
    },
    {
      id: 'owner-messaging',
      iconKey: 'chat',
      title: 'Messaging & reviews',
      summary: 'Fast, clear replies win repeat renters.',
      points: [
        'Reply within a few hours when possible — especially to new booking requests.',
        'Confirm dates, total period, deposit, and payment method in the booking chat.',
        'After handover, check in once during the rental if it is a long booking.',
        'When the rental ends, mark the booking complete so both of you can leave a review.',
        'Ask politely for a review after a smooth rental — it helps your next listing stand out.',
      ],
    },
  ],
}

const hu: ResourcePageContent = {
  eyebrow: 'Tulajdonosoknak',
  title: 'Tulajdonosi útmutatók',
  description: `Hirdess ${LAUNCH_REGION_LABEL} területén, válaszolj foglalásokra és élő igényekre, és építs értékeléseket.`,
  stepsTitle: 'Hogyan működik a kiadás',
  stepsSubtitle: 'Az első hirdetéstől az első értékelésig — a tulajdonos oldal.',
  guidesTitle: 'Tulajdonosi útmutatók',
  guidesSubtitle: 'Koppints a témára a kibontáshoz.',
  otherPerspective: {
    label: 'Inkább bérelnél?',
    href: '/resources/renters',
    cta: 'Bérlői útmutatók',
  },
  quickStart: [
    {
      iconKey: 'plus',
      title: 'Első hirdetés létrehozása',
      description:
        'Adj hozzá fotókat, HUF árakat, és válaszd az átvételt vagy kiszállítást. Aktív hirdetések perceken belül megjelennek.',
      href: '/listings/new',
      cta: 'Hirdetés feladása',
    },
    {
      iconKey: 'dashboard',
      title: 'Kezelés az irányítópultról',
      description:
        'Kövesd a foglalásokat, válaszolj üzenetekre, és frissítsd a hirdetéseidet — egy helyen.',
      href: '/dashboard',
      cta: 'Irányítópult megnyitása',
    },
    {
      iconKey: 'megaphone',
      title: 'Válasz az élő igényekre',
      description: `A bérlők posztolnak a feeden. Ha van illeszkedő ajánlatod ${LAUNCH_REGION_LABEL.split(',')[0]} területén, írj amíg aktív az igény.`,
      href: '/feed',
      cta: 'Igények böngészése',
    },
  ],
  steps: [
    {
      step: '1',
      title: 'Hirdetés feladása',
      body: 'Válaszd ki a kategóriát, tölts fel tiszta fotókat, és adj meg napi HUF díjat. Jelezd az átvételi területet vagy kiszállítást.',
    },
    {
      step: '2',
      title: 'Foglalási kérelem',
      body: 'A bérlő dátumokat választ és kérelmet küld. Látod az irányítópulton és az Üzenetekben — válaszolj gyorsan a bizalomért.',
    },
    {
      step: '3',
      title: 'Átadás és egyeztetés chatben',
      body: 'Erősítsd meg az időt, helyet, kauciót és fizetést a foglalási szálban. Maradj a Rhentifyen a nyilvántartás miatt.',
    },
    {
      step: '4',
      title: 'Lezárás és értékelés',
      body: 'A bérlés végén jelöld késznek a foglalást. Mindketten értékelhettek — a jó visszajelzések hozzák a következő foglalást.',
    },
  ],
  guides: [
    {
      id: 'owner-pricing',
      iconKey: 'currency',
      title: 'Árazás HUF-ban',
      summary: 'Olyan napi díj, amit a bérlő azonnal ért.',
      points: [
        'A fő díjad legyen napi ár magyar forintban (HUF). Adj meg heti vagy havi árat is, ha hosszabb bérlést kínálsz.',
        'Nézd meg hasonló budapesti hirdetéseket — szerszámok, kamerák, rendezvényfelszerelés gyakran 2 000–15 000 Ft/nap.',
        'Szolgáltatásoknál: óradíj vagy napidíj az idő, utazás és eszközök alapján.',
        'Írd le, mi van benne (kábelek, táska, beállítás), hogy ne legyen meglepetés átadáskor.',
        'Az árat bármikor módosíthatod a hirdetés szerkesztésénél.',
      ],
    },
    {
      id: 'owner-photos',
      iconKey: 'camera',
      title: 'Fotók, amik foglalást hoznak',
      summary: 'A jó fotó a leggyorsabb út a foglaláshoz.',
      points: [
        'Használj természetes fényt — ablak mellett vagy kint. Kerüld a sötét, homályos képeket.',
        'Legalább 3 fotó: elölről, részlet, méretarány (melléktárggyal vagy kontextusban).',
        'Mutasd őszintén a kopást vagy karcolást. A bizalom fontosabb a tökéletes képnél.',
        'Szolgáltatásnál: barátságos profilkép és szerszámok vagy referenciák.',
        'Kerüld a vízjelet és erős szűrőket — a valós tárgy kell.',
      ],
    },
    {
      id: 'owner-deposits',
      iconKey: 'calendar',
      title: 'Kaució és átadás',
      summary: 'Egyértelmű elvárások a bérlés előtt.',
      points: [
        'Pénzbeli kaució: numerikus HUF összeg visszatéríthető letétként (pl. 10 000–50 000 Ft értékesebb cikkeknél).',
        'Tárgyi letét: mit tartasz vissza biztonságként (pl. személyi igazolvány) — írd le chatben is.',
        'Egyezzetek meg átvételi helyen, időben és az találkozó feleken a bérlés napja előtt.',
        'Kiszállításnál: hatósugár, díj, ki hozza vissza a tárgyat.',
        'Ha gyanús a helyzet, állj meg, és írj az ügyfélszolgálatnak drága eszköznél.',
      ],
    },
    {
      id: 'owner-messaging',
      iconKey: 'chat',
      title: 'Üzenetek és értékelések',
      summary: 'Gyors, világos válasz = visszatérő bérlők.',
      points: [
        'Válaszolj néhány órán belül, ha lehet — különösen új foglalási kérelmekre.',
        'Erősítsd meg chatben a dátumokat, időszakot, kauciót és fizetési módot.',
        'Hosszabb bérlésnél egy rövid check-in átadás után segít.',
        'A végén jelöld késznek a foglalást, hogy mindketten értékelhessetek.',
        'Kérj udvariasan értékelést sima bérlés után — ez segít a következő foglalásnál.',
      ],
    },
  ],
}

export function getOwnerResourceContent(locale: Locale): ResourcePageContent {
  return locale === 'hu' ? hu : en
}
