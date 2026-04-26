import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookOpenIcon, VideoCameraIcon, DocumentTextIcon } from '@heroicons/react/24/solid'

export default function ResourcesPage() {
  const resources = [
    {
      icon: BookOpenIcon,
      title: 'Getting Started Guide',
      description: 'Learn how to create your first listing and start earning.',
    },
    {
      icon: VideoCameraIcon,
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials on using our platform.',
    },
    {
      icon: DocumentTextIcon,
      title: 'Best Practices',
      description: 'Tips and tricks to maximize your success on Rentify.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
            Resources
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to succeed on Rentify
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {resources.map((resource, idx) => (
            <div key={idx} className="card-glass text-center">
              <resource.icon className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {resource.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {resource.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
