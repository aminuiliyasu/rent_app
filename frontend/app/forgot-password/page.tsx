'use client'

import { useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'
import BrandLogo from '@/components/BrandLogo'
import { SUPPORT_EMAIL } from '@/lib/site'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setSubmitted(true)
      toast.success(t('auth.resetEmailSent'))
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.response?.data?.error || t('auth.somethingWrong')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center py-12 px-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo className="justify-center mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.forgotTitle')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.forgotSubtitle')}
          </p>
        </div>

        <div className="card-glass">
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t('auth.forgotSuccess', { email })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('auth.forgotSpam')}{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 dark:text-blue-400 font-semibold">
                  {SUPPORT_EMAIL}
                </a>
              </p>
              <Link href="/login" className="btn-primary inline-block w-full py-3 text-center">
                {t('auth.backToSignIn')}
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('common.email')}
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
                {loading ? t('auth.sending') : t('auth.sendReset')}
              </button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  {t('auth.backToSignIn')}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
