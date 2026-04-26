import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheckIcon, LockClosedIcon, UserGroupIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'

export default function SafetyPage() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Verified Users',
      description: 'All users go through identity verification to ensure a safe marketplace experience.',
    },
    {
      icon: LockClosedIcon,
      title: 'Secure Payments',
      description: 'All transactions are processed securely through encrypted payment gateways.',
    },
    {
      icon: UserGroupIcon,
      title: '24/7 Support',
      description: 'Our support team is available around the clock to assist with any issues.',
    },
    {
      icon: CheckBadgeIcon,
      title: 'Trusted Reviews',
      description: 'Read authentic reviews from verified renters and owners before making decisions.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
            Safety & <span className="gradient-text">Trust</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your security and peace of mind are our top priorities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
      </div>
      <Footer />
    </div>
  )
}
