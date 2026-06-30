'use client'

import { useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { SUPPORT_EMAIL } from '@/lib/site'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setSubmitted(true)
      toast.success('Check your inbox for reset instructions.')
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.response?.data?.error || 'Something went wrong. Try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center py-12 px-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Rhentify</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot password?</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="card-glass">
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive an email with a reset link
                shortly.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Didn&apos;t get it? Check spam or contact{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 dark:text-blue-400 font-semibold">
                  {SUPPORT_EMAIL}
                </a>
              </p>
              <Link href="/login" className="btn-primary inline-block w-full py-3 text-center">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-4 font-bold">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
