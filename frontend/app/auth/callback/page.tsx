'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth2 error:', error)
      const decodedError = decodeURIComponent(error)
      toast.error(decodedError || 'Authentication failed')
      setTimeout(() => router.push('/login'), 2000)
      setLoading(false)
      return
    }

    if (success === 'true' && token && refreshToken) {
      try {
        // Store tokens
        localStorage.setItem('accessToken', token)
        localStorage.setItem('refreshToken', refreshToken)

        // Fetch user profile and update auth context
        api.get('/auth/me')
          .then(() => {
            toast.success('Login successful!')
            // Use window.location to ensure full page reload and auth context update
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 500)
          })
          .catch((err) => {
            console.error('Failed to fetch user profile:', err)
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to fetch user profile'
            toast.error(errorMsg + '. Please try logging in again.')
            setTimeout(() => router.push('/login'), 2000)
          })
          .finally(() => setLoading(false))
      } catch (err) {
        console.error('Error processing OAuth2 callback:', err)
        toast.error('Error processing authentication. Please try again.')
        setTimeout(() => router.push('/login'), 2000)
        setLoading(false)
      }
    } else {
      console.warn('Missing OAuth2 parameters:', { token: !!token, refreshToken: !!refreshToken, success })
      toast.error('Authentication incomplete. Please try again.')
      setTimeout(() => router.push('/login'), 2000)
      setLoading(false)
    }
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    )
  }

  return null
}
