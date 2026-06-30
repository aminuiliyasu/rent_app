import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  ShieldCheckIcon,
  LockClosedIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  IdentificationIcon,
} from '@heroicons/react/24/solid'

export default function SafetyPage() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Optional identity checks',
      description:
        'Owners and renters can complete KYC when needed. Verified profiles help build trust in the community.',
    },
    {
      icon: LockClosedIcon,
      title: 'In-app messaging',
      description:
        'Coordinate pickup, pricing, and payment details through secure chat — keep conversations on the platform.',
    },
    {
      icon: UserGroupIcon,
      title: 'Human support',
      description:
        'Reach our team by email for account, booking, or safety questions. We respond as quickly as we can.',
    },
    {
      icon: CheckBadgeIcon,
      title: 'Mutual reviews',
      description:
        'After a completed rental, both sides can leave a review — helping the next person decide with confidence.',
    },
  ]

  const depositTypes = [
    {
      icon: BanknotesIcon,
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
      icon: IdentificationIcon,
      title: 'Item deposit',
      summary: 'A physical item held as security until the rental ends.',
      details: [
        'Owners describe what they will hold — for example a national ID card, passport, or driving licence.',
        'This is written on the listing and should be repeated clearly in Messages before the rental starts.',
        'Item deposits are arranged face-to-face between both parties. Rhentify does not store IDs or documents.',
        'Only agree if you are comfortable. Never leave an item you cannot afford to lose without a clear return plan.',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container pb-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
            Safety & <span className="gradient-text">Trust</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your security and peace of mind are our top priorities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {features.map((feature, idx) => (
            <div key={idx} className="card-glass">
              <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              Security <span className="gradient-text">deposits</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Rhentify supports two deposit types so owners can protect valuable gear. Both are optional and set by
              the owner on each listing. Deposits are arranged between renter and owner — always confirm the terms
              in your booking chat before pickup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {depositTypes.map((type) => (
              <div key={type.title} className="card-glass border border-blue-100/80 dark:border-blue-900/40">
                <type.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{type.title}</h3>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4">{type.summary}</p>
                <ul className="space-y-3">
                  {type.details.map((detail) => (
                    <li key={detail.slice(0, 48)} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="card-glass bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/80 dark:border-amber-900/40">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Deposit safety tips</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Read deposit details on the listing before you request to book.</li>
              <li>• Agree cash amount, item held, and return timing in Messages.</li>
              <li>• Inspect the item together at handover and note any existing damage in chat.</li>
              <li>• Return deposits promptly when the rental ends in the same condition agreed.</li>
              <li>• Contact{' '}
                <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  support
                </Link>{' '}
                if something goes wrong — include your booking details.
              </li>
              <li>• See{' '}
                <Link href="/resources/renters" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  renter resources
                </Link>{' '}
                or{' '}
                <Link href="/resources/owners" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  owner resources
                </Link>{' '}
                for more on deposits and handover.
              </li>
            </ul>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
