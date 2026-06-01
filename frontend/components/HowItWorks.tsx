'use client'

import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/solid'

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Discover',
      description: 'Search gear, spaces, and vetted locals in your area',
      Icon: MagnifyingGlassIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      number: '2',
      title: 'Book & Pay',
      description: 'Select your dates, review pricing, and securely complete your payment within the chat',
      Icon: CreditCardIcon,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      number: '3',
      title: 'Enjoy',
      description: 'Meet locally, pick up, or get it delivered — your call',
      Icon: SparklesIcon,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-800/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      number: '4',
      title: 'Review',
      description: 'Close the loop with a review that builds community trust',
      Icon: StarIcon,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
  ]

  return (
    <section className="section-container bg-sand-100 dark:bg-ink-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
            How it works
          </p>
          <h2 className="section-title">
            From search to <span className="gradient-text">handoff</span>
          </h2>
          <p className="section-subtitle">
            Four clear steps. No guesswork, no hidden friction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div 
              key={step.number} 
              className="group relative animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Card */}
              <div className="card-glass text-center h-full hover:scale-105 transition-all duration-300">
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-2xl ${step.iconBg} border-2 border-gray-200 dark:border-gray-700 group-hover:border-transparent transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                    <step.Icon
                      className="h-12 w-12 text-gray-800 dark:text-gray-100 group-hover:scale-110 transition-transform duration-300"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      aria-hidden
                    />
                  </div>
                </div>
                
                {/* Number Badge */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${step.gradient} text-white text-xl font-extrabold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector Arrow (except last) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 transform -translate-y-1/2 z-0">
                  <ArrowRightIcon className="h-6 w-6 text-blue-500 dark:text-blue-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
