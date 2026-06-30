'use client'

import Link from 'next/link'
import { SparklesIcon } from '@heroicons/react/24/outline'
import SocialLinks from '@/components/SocialLinks'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-slate-950 text-stone-300 border-t border-stone-800">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-700 bg-stone-900/50">
                <SparklesIcon className="h-5 w-5 text-accent-light" />
              </div>
              <span className="font-serif text-2xl font-semibold text-stone-100">Rhentify</span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-4">{t('footer.tagline')}</p>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">{t('footer.subtitle')}</p>
            <Link
              href="/contact"
              className="inline-flex text-sm font-medium text-accent-light hover:text-stone-100 transition-colors"
            >
              {t('footer.contactSupport')}
            </Link>
            <div className="mt-6">
              <p className="text-eyebrow text-stone-500 mb-3">{t('footer.followUs')}</p>
              <SocialLinks size="sm" />
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-medium mb-6 text-stone-100">{t('footer.forRenters')}</h4>
            <ul className="space-y-3">
              {[
                { href: '/search', label: t('footer.browseListings') },
                { href: '/how-it-works', label: t('footer.howItWorks') },
                { href: '/safety', label: t('footer.safetyTrust') },
                { href: '/resources/renters', label: t('footer.renterResources') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-stone-100 transition-colors text-sm font-normal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-medium mb-6 text-stone-100">{t('footer.forOwners')}</h4>
            <ul className="space-y-3">
              {[
                { href: '/listings/new', label: t('footer.postAListing') },
                { href: '/dashboard', label: t('nav.dashboard') },
                { href: '/resources/owners', label: t('footer.ownerResources') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-stone-100 transition-colors text-sm font-normal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-medium mb-6 text-stone-100">{t('footer.company')}</h4>
            <ul className="space-y-3">
              {[
                { href: '/about', label: t('footer.aboutUs') },
                { href: '/contact', label: t('footer.contact') },
                { href: '/terms', label: t('footer.termsConditions') },
                { href: '/privacy', label: t('footer.privacyPolicy') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-stone-100 transition-colors text-sm font-normal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 mt-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <p className="text-stone-500 text-sm text-center md:text-left">
              &copy; {year} Rhentify. {t('footer.rightsReserved')}
            </p>
            <SocialLinks size="sm" className="justify-center" />
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/terms" className="text-stone-500 hover:text-stone-200 transition-colors">
                {t('footer.terms')}
              </Link>
              <span className="text-stone-700">|</span>
              <Link href="/privacy" className="text-stone-500 hover:text-stone-200 transition-colors">
                {t('footer.privacy')}
              </Link>
              <span className="text-stone-700">|</span>
              <Link href="/cookies" className="text-stone-500 hover:text-stone-200 transition-colors">
                {t('footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
