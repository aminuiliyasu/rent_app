import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { LAUNCH_REGION_LABEL, SITE_NAME, SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `Terms of use for ${SITE_NAME} — the local rental marketplace in ${LAUNCH_REGION_LABEL}.`,
}

type TermsSection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

const SECTIONS: TermsSection[] = [
  {
    title: '1. Acceptance of these terms',
    paragraphs: [
      `These Terms & Conditions ("Terms") govern your access to and use of ${SITE_NAME} ("Rhentify", "we", "us", "our") at rhentify.com and related services.`,
      'By creating an account, browsing listings, posting a listing, sending a booking request, or otherwise using the platform, you agree to these Terms and our Privacy Policy. If you do not agree, do not use Rhentify.',
      'Rhentify is intended for users who can form a binding contract under applicable law. You must provide accurate registration information and keep it up to date.',
    ],
  },
  {
    title: '2. What Rhentify is — and what it is not',
    paragraphs: [
      'Rhentify is an online marketplace that helps people in local communities discover rentals and services, communicate, and arrange bookings.',
      `We are launching in ${LAUNCH_REGION_LABEL} and may expand to other areas over time.`,
      'Rhentify is not a party to rental or service agreements between users. We do not own listed items, employ listed service providers, or guarantee the quality, safety, legality, or availability of any listing.',
      'Unless we state otherwise in writing, Rhentify does not provide insurance, escrow, payment processing for rentals, or legal advice. Users transact with each other at their own discretion.',
    ],
  },
  {
    title: '3. Your account',
    bullets: [
      'You are responsible for safeguarding your login credentials and for all activity under your account.',
      'You must not share your account or impersonate another person.',
      'Notify us promptly at the contact details below if you suspect unauthorized access.',
      'We may suspend or terminate accounts that violate these Terms or pose a risk to other users or the platform.',
    ],
  },
  {
    title: '4. Listings & owner responsibilities',
    paragraphs: [
      'If you post a listing on Rhentify, you represent that you have the right to offer the item or service and that your listing is accurate, lawful, and not misleading.',
    ],
    bullets: [
      'Provide honest descriptions, real photos, correct categories, and pricing in the currency you select (typically HUF in Hungary).',
      'Respond to booking requests and messages in a timely and professional manner.',
      'Honour agreed pickup, delivery, and return arrangements.',
      'Comply with applicable laws — including tax, consumer, and licensing rules that apply to your activity.',
      'Remove or update listings that are no longer available.',
      'You retain responsibility for the item or service you offer. Rhentify does not inspect listings before they go live.',
    ],
  },
  {
    title: '5. Bookings & renter responsibilities',
    paragraphs: [
      'When you request to book a listing, you are asking the owner to accept a rental for the dates you propose. A booking is not confirmed until both sides agree through the platform process.',
    ],
    bullets: [
      'Read the full listing — including price, deposit requirements, and pickup or delivery details — before you book.',
      'Use the in-app booking chat to confirm practical details before handover.',
      'Return rented items on time and in the condition agreed, subject to normal wear.',
      'Pay the owner as agreed. Payment methods and timing are arranged between users unless Rhentify introduces integrated payment features and states otherwise.',
      'Do not use rented items for illegal purposes or in a way that exceeds what the owner permitted.',
    ],
  },
  {
    title: '6. Payments & platform fees',
    paragraphs: [
      'Rental prices are set by owners and displayed on listings. Unless we announce a change, Rhentify may not charge platform fees during early launch periods — any current fee policy will be shown clearly before you complete an action that incurs a fee.',
      'Rhentify is not responsible for payment disputes, chargebacks, or non-payment between users. Resolve payment issues directly where possible, and contact support if you need help documenting a problem.',
    ],
  },
  {
    title: '7. Security deposits',
    paragraphs: [
      'Owners may require security deposits to protect valuable items. Rhentify supports two types, which may be shown on a listing:',
    ],
    bullets: [
      'Cash deposit — a refundable monetary amount in the listing currency (for example HUF), agreed between renter and owner.',
      'Item deposit — a physical item held as security (for example an ID document), described by the owner on the listing.',
      'Deposits are arranged directly between users at pickup or return. Rhentify does not hold, store, or release cash deposits or identity documents on your behalf.',
      'Both parties should confirm deposit amount, item held (if any), timing of payment, and conditions for return in the booking chat before handover.',
      'Only agree to an item deposit if you accept the risk and understand when and how your item will be returned.',
      'See our Safety & Trust page for practical deposit guidance.',
    ],
  },
  {
    title: '8. Rent requests',
    paragraphs: [
      'Renters may publish short-lived "rent request" posts describing something they need. Owners may respond through messaging while a post is visible.',
      'Rent requests are not binding contracts. They are a way to discover interest. Any rental should be documented through a listing and booking where possible so dates and reviews are recorded.',
    ],
  },
  {
    title: '9. Messaging, reviews & conduct',
    bullets: [
      'Keep booking-related communication on Rhentify when you can — it helps resolve disputes and supports community trust.',
      'Be respectful. Harassment, hate speech, threats, spam, and fraud are prohibited.',
      'Reviews must be honest and based on a completed or genuinely attempted transaction. Do not post retaliatory or false reviews.',
      'We may remove content or restrict users that breach community standards, with or without notice where urgent.',
    ],
  },
  {
    title: '10. Prohibited uses',
    paragraphs: ['You may not use Rhentify to:'],
    bullets: [
      'List or rent stolen, counterfeit, unsafe, or illegal items or services.',
      'Mislead other users, scrape the platform without permission, or attempt to bypass our systems.',
      'Collect personal data from users for unrelated marketing or fraud.',
      'Interfere with the security or operation of the website or other users\' accounts.',
      'Use the platform in any way that violates applicable law in Hungary or your local jurisdiction.',
    ],
  },
  {
    title: '11. Content & intellectual property',
    paragraphs: [
      'You grant Rhentify a non-exclusive licence to host, display, and promote content you upload (such as listing photos and descriptions) for the purpose of operating the marketplace.',
      'Rhentify name, logo, and site design are our property. Do not use our branding without permission.',
    ],
  },
  {
    title: '12. Limitation of liability',
    paragraphs: [
      'To the fullest extent permitted by law, Rhentify and its operators are not liable for indirect, incidental, special, or consequential damages arising from your use of the platform or any transaction between users.',
      'We do not warrant uninterrupted or error-free service. The platform is provided "as is" and "as available".',
      'Our total liability for any claim relating to the platform is limited to the greater of (a) the amount you paid to Rhentify in the twelve months before the claim, or (b) one hundred euros (€100), except where law does not allow such a limitation.',
      'Nothing in these Terms excludes liability that cannot be excluded under mandatory consumer or other applicable law.',
    ],
  },
  {
    title: '13. Indemnity',
    paragraphs: [
      'You agree to indemnify and hold Rhentify harmless from claims, losses, and expenses (including reasonable legal fees) arising from your listings, bookings, conduct on the platform, or breach of these Terms — except to the extent caused by our own negligence or wilful misconduct.',
    ],
  },
  {
    title: '14. Termination',
    paragraphs: [
      'You may stop using Rhentify at any time and may request account deletion through support.',
      'We may suspend or terminate access if you breach these Terms or if we reasonably believe continuation poses risk to users or the service.',
    ],
  },
  {
    title: '15. Changes to these Terms',
    paragraphs: [
      'We may update these Terms from time to time. Material changes will be posted on this page with an updated effective date. Continued use after changes take effect constitutes acceptance of the revised Terms.',
    ],
  },
  {
    title: '16. Governing law & contact',
    paragraphs: [
      'These Terms are governed by the laws of Hungary, without regard to conflict-of-law rules. Courts in Budapest shall have exclusive jurisdiction where permitted by mandatory consumer protection rules in your country of residence.',
      `Questions about these Terms: ${SUPPORT_EMAIL} or our Contact page.`,
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
            Terms & <span className="gradient-text">Conditions</span>
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-2">
            Last updated: June 2026
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-500 mb-10 max-w-2xl mx-auto">
            Plain-language terms for using {SITE_NAME} in {LAUNCH_REGION_LABEL}. Also see our{' '}
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Privacy Policy
            </Link>
            ,{' '}
            <Link href="/safety" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Safety & Trust
            </Link>
            , and{' '}
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Contact
            </Link>
            .
          </p>

          <div className="card-glass space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{section.title}</h2>
                {section.paragraphs?.map((p) => (
                  <p key={p.slice(0, 48)} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 last:mb-0">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className={`space-y-2 ${section.paragraphs?.length ? 'mt-3' : ''}`}>
                    {section.bullets.map((item) => (
                      <li key={item.slice(0, 48)} className="flex gap-2 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
