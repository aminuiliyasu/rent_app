import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
            Cookie <span className="gradient-text">Policy</span>
          </h1>
          
          <div className="card-glass space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Are Cookies</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Use Cookies</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We use cookies to remember your preferences, keep you logged in, analyze how our website is used, and improve your experience. We also use cookies for security purposes and to prevent fraud.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Types of Cookies We Use</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Managing Cookies</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You can control and manage cookies in various ways. Most browsers allow you to refuse or accept cookies. However, disabling cookies may affect the functionality of our website.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
