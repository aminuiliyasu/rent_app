'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SocialLinks from '@/components/SocialLinks'
import { EnvelopeIcon, MapPinIcon, ShareIcon } from '@heroicons/react/24/solid'
import { LAUNCH_REGION_LABEL, SUPPORT_EMAIL } from '@/lib/site'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Rhentify contact from ${name || 'visitor'}`)
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    )
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    toast.success('Opening your email app…')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="pt-20 section-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
            Contact <span className="gradient-text">Us</span>
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            Questions about listings, bookings, or getting started in {LAUNCH_REGION_LABEL}? We&apos;re here to help.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="card-glass text-center">
              <EnvelopeIcon className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email</h3>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">We typically reply within 1–2 business days.</p>
            </div>

            <div className="card-glass text-center">
              <MapPinIcon className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Launch city</h3>
              <p className="text-gray-600 dark:text-gray-400">{LAUNCH_REGION_LABEL}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Expanding to more cities soon.</p>
            </div>

            <div className="card-glass text-center">
              <ShareIcon className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Follow us</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Updates, tips, and community news on social.
              </p>
              <SocialLinks variant="light" className="justify-center" />
            </div>
          </div>

          <div className="card-glass">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="contact-name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-lg font-bold">
                Send via email
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
