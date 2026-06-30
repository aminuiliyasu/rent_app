import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { LAUNCH_REGION_LABEL, SITE_NAME, SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_NAME} collects, uses, and protects your personal data.`,
}

type PrivacySection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

const SECTIONS: PrivacySection[] = [
  {
    title: '1. Who we are',
    paragraphs: [
      `${SITE_NAME} ("Rhentify", "we", "us", "our") operates an online rental marketplace focused on ${LAUNCH_REGION_LABEL}.`,
      'For privacy questions or to exercise your rights, contact us at ' + SUPPORT_EMAIL + ' or through our Contact page.',
      'When we process personal data about users in the European Economic Area (including Hungary), we do so as the data controller for platform operations described in this policy.',
    ],
  },
  {
    title: '2. Information we collect',
    paragraphs: ['We collect information in these ways:'],
    bullets: [
      'Account details you provide — such as your name, email address, optional phone number, and password (stored in hashed form, never in plain text).',
      'Profile information — such as an avatar photo and account role (renter, owner, or both).',
      'Listing content — descriptions, photos, prices, categories, location details (address, city, and map coordinates where you add them), and availability you publish as an owner.',
      'Booking information — dates, status, messages linked to a booking, and reviews you submit after a rental.',
      'Communications — text messages, voice-note attachments, and call activity (voice or video) connected to bookings or rent-request conversations.',
      'Rent-request posts — short descriptions you publish when looking for an item or service.',
      'Sign-in with Google — if you choose Google login, we receive basic profile information from Google (such as your name and email) and store a Google account identifier to link your account.',
      'Support and security data — such as password-reset tokens, server logs, and technical information needed to keep the service secure and reliable.',
    ],
  },
  {
    title: '3. Information collected automatically',
    bullets: [
      'Authentication tokens stored in your browser (local storage) so you stay signed in, plus preferences such as language, theme, and display currency.',
      'Standard technical data when you use the site — such as IP address, browser type, device information, and pages visited — in server logs and for security.',
      'We do not use third-party advertising or analytics trackers on the core marketplace experience at launch. If we add analytics later, we will update this policy.',
    ],
  },
  {
    title: '4. How we use your information',
    bullets: [
      'Create and manage your account and authenticate you securely.',
      'Display listings, process booking requests, and enable messaging between renters and owners.',
      'Show your public profile name, reviews, and listing content to other users as part of the marketplace.',
      'Send service emails such as password-reset instructions when you request them.',
      'Moderate content, prevent fraud and abuse, and enforce our Terms & Conditions.',
      'Improve, maintain, and troubleshoot the platform.',
      'Comply with legal obligations and respond to lawful requests.',
    ],
    paragraphs: [
      'Rhentify is a marketplace connecting users directly. Unless we clearly announce integrated payment features, rental payments are arranged between users — we do not process card or bank payments for rentals on your behalf during early launch.',
    ],
  },
  {
    title: '5. Legal bases (EEA / UK users)',
    paragraphs: ['Where GDPR applies, we rely on these legal bases:'],
    bullets: [
      'Performance of a contract — to provide the account, listings, bookings, and messaging you use.',
      'Legitimate interests — to secure the platform, prevent misuse, and improve our services, balanced against your rights.',
      'Consent — where required, such as optional marketing if we introduce it in the future.',
      'Legal obligation — where we must retain or disclose information under applicable law.',
    ],
  },
  {
    title: '6. How we share information',
    paragraphs: [
      'We do not sell your personal information. We share information only as described below.',
      'If we introduce payment processors (such as Stripe or Paystack) for platform fees or integrated checkout, they will receive the payment data needed to complete those transactions, and we will update this policy before those features go live.',
    ],
    bullets: [
      'With other users — your display name, listings, reviews, and booking-related messages are visible to the people you interact with on Rhentify, as needed for the marketplace to work.',
      'With service providers — trusted vendors who help us operate the platform, such as hosting providers, email delivery for password resets, and file storage for uploaded photos and voice notes. They may access data only to perform services for us and must protect it.',
      'With Google — if you sign in with Google, Google\'s own privacy policy applies to information they collect when you use their sign-in service.',
      'For legal reasons — if required by law, court order, or to protect the rights, safety, and security of Rhentify, our users, or others.',
      'Business transfers — if Rhentify is involved in a merger, acquisition, or asset sale, personal data may transfer as part of that transaction, subject to this policy.',
    ],
  },
  {
    title: '7. International transfers',
    paragraphs: [
      'Our primary launch region is Hungary. Some service providers may process data in countries outside the European Economic Area. Where required, we use appropriate safeguards (such as standard contractual clauses) for those transfers.',
    ],
  },
  {
    title: '8. Data retention',
    bullets: [
      'We keep account and marketplace data while your account is active and as needed to provide the service.',
      'Booking messages and reviews may be retained after a rental ends so users can reference past transactions and trust signals.',
      'Server logs and security records are kept for a limited period appropriate for troubleshooting and abuse prevention.',
      'When you request account deletion, we delete or anonymise personal data unless we must retain certain records for legal, tax, dispute, or security reasons.',
    ],
  },
  {
    title: '9. Data security',
    paragraphs: [
      'We use technical and organisational measures designed to protect personal information, including password hashing, access controls, and secure connections (HTTPS) in production.',
      'No method of transmission or storage is completely secure. Please use a strong password and keep your login details confidential.',
    ],
  },
  {
    title: '10. Your rights',
    paragraphs: [
      'Depending on where you live, you may have the right to access, correct, delete, or export your personal data, restrict or object to certain processing, and withdraw consent where processing is consent-based.',
      'To make a request, email ' +
        SUPPORT_EMAIL +
        '. We may need to verify your identity before responding.',
      'If you are in the EEA or UK and believe we have not handled your data properly, you may lodge a complaint with your local supervisory authority. In Hungary, this is the Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH).',
    ],
  },
  {
    title: '11. Cookies & browser storage',
    bullets: [
      'We use browser local storage (not advertising cookies) for sign-in tokens, language preference, theme, currency display, and similar settings.',
      'You can clear this data through your browser settings, but you may need to sign in again and reset preferences.',
    ],
  },
  {
    title: '12. Children',
    paragraphs: [
      'Rhentify is not directed at children under 16, and we do not knowingly collect personal data from children under 16. If you believe a child has provided us data, contact us and we will take appropriate steps to delete it.',
    ],
  },
  {
    title: '13. Changes to this policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. Material changes will be posted on this page with an updated effective date. Continued use after changes take effect means you accept the revised policy.',
    ],
  },
  {
    title: '14. Contact',
    paragraphs: [
      `Privacy questions or data requests: ${SUPPORT_EMAIL}`,
      'See also our Terms & Conditions, Safety & Trust page, and Contact page for related information.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-2">Last updated: June 2026</p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-500 mb-10 max-w-2xl mx-auto">
            How {SITE_NAME} handles personal data for users in {LAUNCH_REGION_LABEL} and beyond. Also see our{' '}
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Terms & Conditions
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
