import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
            About <span className="gradient-text">Rhentify</span>
          </h1>
          
          <div className="card-glass space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Rhentify is a revolutionary marketplace platform that connects people who need to rent items or hire workers with those who have items to rent or services to offer.
            </p>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Our mission is to make renting and hiring accessible, safe, and convenient for everyone. Whether you need a camera for a weekend project, furniture for your new apartment, or a skilled professional for a job, Rhentify makes it easy to find what you need.
            </p>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              We&apos;re starting in Budapest and growing neighborhood by neighborhood. Rhentify is built for real local connections — clear listings, in-app chat, mutual reviews, and no platform fees while we launch.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
