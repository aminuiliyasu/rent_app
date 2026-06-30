import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const samples = [
  {
    id: 'a',
    name: 'Concept A — Sparkle mark',
    tagline: 'Clean & professional. Close to your current logo.',
    file: '/logo/samples/concept-a-sparkle.svg',
    bestFor: 'Website header, favicon, general brand use',
  },
  {
    id: 'b',
    name: 'Concept B — R monogram',
    tagline: 'Bold app icon. Easy to recognize at small sizes.',
    file: '/logo/samples/concept-b-monogram.svg',
    bestFor: 'Mobile app, profile avatars, social icons',
  },
  {
    id: 'c',
    name: 'Concept C — Pin + trust',
    tagline: 'Local marketplace feel. Emphasizes Budapest & safety.',
    file: '/logo/samples/concept-c-pin-trust.svg',
    bestFor: 'Marketing, trust pages, local campaigns',
  },
  {
    id: 'd',
    name: 'Concept D — Wordmark only',
    tagline: 'Most elegant. Premium, editorial style.',
    file: '/logo/samples/concept-d-wordmark.svg',
    bestFor: 'Business cards, email signatures, minimal layouts',
  },
]

export default function LogoSamplesPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-950">
      <Navbar />
      <div className="pt-28 pb-16 section-container max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-eyebrow mb-3">Brand exploration</p>
          <h1 className="heading-display text-4xl md:text-5xl mb-4">Logo samples</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Four directions for Rhentify. Each uses navy <span className="text-primary-800 font-medium">#054494</span> and
            gold <span className="text-accent font-medium">#d4bc8a</span> to match your site.
          </p>
        </div>

        <div className="mb-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/samples/rhentify-logo-samples-sheet.png"
            alt="All four Rhentify logo concepts"
            className="w-full h-auto"
          />
        </div>

        <div className="grid gap-8">
          {samples.map((sample) => (
            <div key={sample.id} className="card-glass overflow-hidden">
              <div className="flex items-center justify-center p-10 bg-white dark:bg-gray-900 border-b border-gray-200/70 dark:border-gray-700/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sample.file} alt={sample.name} className="max-h-20 w-auto" />
              </div>
              <div className="p-6 md:p-8 border-t border-gray-200/70 dark:border-gray-700/60">
                <h2 className="font-serif text-xl font-semibold text-gray-900 dark:text-white mb-1">{sample.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{sample.tagline}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Best for:</span> {sample.bestFor}
                </p>
                <a
                  href={sample.file}
                  download
                  className="inline-flex mt-4 text-sm font-medium text-primary-800 dark:text-primary-300 hover:underline"
                >
                  Download SVG →
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Pick a favorite and we can polish it and set it as the live site logo.
          </p>
          <Link href="/" className="btn-outline inline-flex">
            Back to home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
