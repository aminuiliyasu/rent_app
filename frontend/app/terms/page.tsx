import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
            Terms & <span className="gradient-text">Conditions</span>
          </h1>
          
          <div className="card-glass space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By accessing and using Rhentify, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Use License</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Permission is granted to temporarily use Rhentify for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Responsibilities</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Prohibited Uses</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You may not use Rhentify in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                In no event shall Rhentify or its suppliers be liable for any damages arising out of the use or inability to use the materials on Rhentify&apos;s website.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
