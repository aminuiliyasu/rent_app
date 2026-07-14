import type { Locale } from '@/lib/i18n/translations'

export interface SafetyFeature {
  title: string
  description: string
}

export interface DepositType {
  title: string
  summary: string
  details: string[]
}

export interface SafetyPageContent {
  pageTitle: string
  pageTitleHighlight: string
  pageSubtitle: string
  features: SafetyFeature[]
  depositsTitle: string
  depositsTitleHighlight: string
  depositsIntro: string
  depositTypes: DepositType[]
  tipsTitle: string
  tips: string[]
  ctaBrowse: string
  ctaList: string
}

const en: SafetyPageContent = {
  pageTitle: 'Safety &',
  pageTitleHighlight: 'Trust',
  pageSubtitle: 'Your security and peace of mind are our top priorities',
  features: [
    {
      title: 'Optional identity checks',
      description:
        'Owners and renters can complete KYC when needed. Verified profiles help build trust in the community.',
    },
    {
      title: 'In-app messaging',
      description:
        'Coordinate pickup, pricing, and payment details through secure chat — keep conversations on the platform.',
    },
    {
      title: 'Human support',
      description:
        'Reach our team by email for account, booking, or safety questions. We respond as quickly as we can.',
    },
    {
      title: 'Mutual reviews',
      description:
        'After a completed rental, both sides can leave a review — helping the next person decide with confidence.',
    },
  ],
  depositsTitle: 'Security',
  depositsTitleHighlight: 'deposits',
  depositsIntro:
    'Rhentify supports two deposit types so owners can protect valuable gear. Both are optional and set by the owner on each listing. Deposits are arranged between renter and owner — always confirm the terms in Messages before handover.',
  depositTypes: [
    {
      title: 'Cash deposit',
      summary: 'A refundable money hold in the listing currency (usually HUF).',
      details: [
        'Owners set a numeric cash deposit when they create a listing — for example 10,000 Ft for a camera or drill.',
        'The amount is shown on the listing so renters know the cost before they book.',
        'Cash deposits are agreed and handled directly between renter and owner at pickup or return — not held by Rhentify.',
        'Confirm the exact amount, when it is paid, and when it is refunded in your booking chat before handover.',
      ],
    },
    {
      title: 'Item deposit',
      summary: 'A physical item held as security until the rental ends.',
      details: [
        'Owners describe what they will hold — for example a national ID card, passport, or driving licence.',
        'This is written on the listing and should be repeated clearly in Messages before the rental starts.',
        'Item deposits are arranged face-to-face between both parties. Rhentify does not store IDs or documents.',
        'Only agree if you are comfortable. Never leave an item you cannot afford to lose without a clear return plan.',
      ],
    },
  ],
  tipsTitle: 'Safety tips for every rental',
  tips: [
    'Meet in a public, well-lit place for first-time handovers when possible.',
    'Keep all agreements in the in-app Messages thread — pickup time, price, deposit, and return plan.',
    'Inspect items together at pickup and note any existing damage in chat.',
    'Only pay deposits you agreed to in writing in Messages — never send money outside the agreed plan.',
    'Report suspicious behaviour to our support team by email.',
  ],
  ctaBrowse: 'Browse listings',
  ctaList: 'List something you own',
}

const hu: SafetyPageContent = {
  pageTitle: 'Biztonság és',
  pageTitleHighlight: 'bizalom',
  pageSubtitle: 'A biztonságod és nyugalmad a legfontosabb számunkra',
  features: [
    {
      title: 'Opcionális személyazonosítás',
      description:
        'Tulajdonosok és bérlők igény szerint KYC-t végezhetnek. Az ellenőrzött profilok erősítik a közösségi bizalmat.',
    },
    {
      title: 'Alkalmazáson belüli üzenetküldés',
      description:
        'Egyeztess átvételt, árat és fizetést biztonságos chatben — tartsd a beszélgetést a platformon.',
    },
    {
      title: 'Emberi ügyfélszolgálat',
      description:
        'Írj nekünk e-mailben fiók-, foglalás- vagy biztonsági kérdésekben. A lehető leggyorsabban válaszolunk.',
    },
    {
      title: 'Kölcsönös értékelések',
      description:
        'Befejezett bérlés után mindkét fél értékelhet — így a következő döntés könnyebb.',
    },
  ],
  depositsTitle: 'Biztonsági',
  depositsTitleHighlight: 'kauciók',
  depositsIntro:
    'A Rhentify két kauciótípust támogat, hogy a tulajdonosok védhessék az értékes holmikat. Mindkettő opcionális, hirdetésenként állítható. A kauciót bérlő és tulajdonos egyezteti — mindig erősítsd meg az Üzenetekben átadás előtt.',
  depositTypes: [
    {
      title: 'Készpénz kaució',
      summary: 'Visszatéríthető pénzösszeg a hirdetés pénznemében (általában HUF).',
      details: [
        'A tulajdonos számot ad meg hirdetés létrehozásakor — pl. 10 000 Ft kamera vagy fúró esetén.',
        'Az összeg látszik a hirdetésen, így a bérlő foglalás előtt tudja.',
        'A készpénz kauciót bérlő és tulajdonos közvetlenül egyezteti átvételnél/visszaadásnál — a Rhentify nem tartja.',
        'Erősítsd meg chatben a pontos összeget, mikor fizeted és mikor jár vissza, átadás előtt.',
      ],
    },
    {
      title: 'Tárgyi kaució',
      summary: 'Fizikai tárgy fedezetként a bérlés végéig.',
      details: [
        'A tulajdonos leírja, mit tart meg — pl. személyi igazolvány, útlevél vagy jogosítvány.',
        'Ez szerepel a hirdetésen, és az Üzenetekben is egyértelműen meg kell ismételni bérlés előtt.',
        'Tárgyi kaució személyesen, a felek között. A Rhentify nem tárol igazolványokat.',
        'Csak akkor vállald, ha kényelmes. Soha ne adj oda olyat, amit kockáztatni nem tudsz, tiszta visszaadási terv nélkül.',
      ],
    },
  ],
  tipsTitle: 'Biztonsági tippek minden bérléshez',
  tips: [
    'Első átadásnál lehetőleg nyilvános, jól megvilágított helyen találkozz.',
    'Minden megállapodást tarts az alkalmazás Üzeneteiben — időpont, ár, kaució, visszaadás.',
    'Átvételnél együtt nézzétek át a tárgyat, és jegyezzétek fel a meglévő sérüléseket chatben.',
    'Csak azt a kauciót fizesd, amit Üzenetben megbeszéltetek — ne utalj a megbeszélt terven kívül.',
    'Gyanús viselkedést jelents e-mailben az ügyfélszolgálatnak.',
  ],
  ctaBrowse: 'Hirdetések böngészése',
  ctaList: 'Add fel, amid van',
}

export function getSafetyContent(locale: Locale): SafetyPageContent {
  return locale === 'hu' ? hu : en
}
