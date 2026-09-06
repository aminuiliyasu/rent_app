'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'
import BrandLogo from '@/components/BrandLogo'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error(t('auth.invalidResetToast'))
      return
    }
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'))
      return
    }
    if (password.length < 8) {
      toast.error(t('auth.passwordMin8'))
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success(t('auth.passwordUpdated'))
      router.push('/login')
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.response?.data?.error || t('auth.resetFailed')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-700 dark:text-gray-300">{t('auth.invalidResetLink')}</p>
        <Link href="/forgot-password" className="btn-primary inline-block w-full py-3 text-center">
          {t('auth.requestNewLink')}
        </Link>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('auth.newPassword')}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field pr-12"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('auth.confirmPasswordLabel')}
        </label>
        <input
          id="confirm"
          type={showPassword ? 'text' : 'password'}
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>
      <button type="submit" disabled={loading} className="w-full btn-primary py-4 font-bold">
        {loading ? t('auth.updating') : t('auth.updatePassword')}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  const { t } = useLanguage()

  return (
    <div className="auth-shell">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo className="justify-center mb-4 mx-auto" />
          <h1 className="text-3xl font-semibold text-gray-950 dark:text-white mb-2">{t('auth.resetTitle')}</h1>
        </div>
        <div className="card-glass">
          <Suspense fallback={<p className="text-center text-gray-500">{t('common.loading')}</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
