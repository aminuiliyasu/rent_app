'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAboutCategoryGuide, aboutCategoryGuideIntro } from '@/lib/i18n/aboutCategoryGuide'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function AboutPage() {
  const { locale, t } = useLanguage()
  const intro = aboutCategoryGuideIntro[locale]
  const categories = getAboutCategoryGuide(locale)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
            {t('about.title')} <span className="gradient-text">Rhentify</span>
          </h1>

          <div className="card-glass space-y-6 mb-12">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('about.p1')}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('about.p2')}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('about.p3')}
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">{intro.heading}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{intro.subheading}</p>

            <div className="space-y-5">
              {categories.map((category) => (
                <article
                  key={category.slug}
                  className="card-glass border border-gray-200/70 dark:border-gray-700/60 p-6 md:p-7"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{category.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{category.summary}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t('common.examples')}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {category.examples.map((example) => (
                      <li
                        key={example}
                        className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <div className="text-center">
            <Link
              href="/listings/new"
              className="btn-primary inline-flex items-center gap-2"
            >
              {locale === 'hu' ? 'Hirdetés feladása' : 'Post a listing'}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
