'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TrustReviewsSection from '@/components/TrustReviewsSection'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { User } from '@/lib/types'
import toast from 'react-hot-toast'

export default function PublicUserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, user: me } = useAuth()
  const idParam = params.id as string
  const userId = Number(idParam)

  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || Number.isNaN(userId)) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const u = await api.get(`/users/${userId}`)
        if (!cancelled) setProfile(u.data as User)
      } catch {
        if (!cancelled) {
          setProfile(null)
          toast.error('Could not load profile')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, userId])

  const isSelf = me?.id === userId

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Loading…</div>
        <Footer />
      </div>
    )
  }

  if (!loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">User not found.</p>
          <button type="button" className="btn-secondary" onClick={() => router.push('/search')}>
            Browse listings
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {loading ? '…' : profile?.name ?? 'Member'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {isSelf ? 'Your public reputation (same as My Profile).' : 'Member profile · trust from completed rentals'}
        </p>
        {!isSelf && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
            Reviews show after both people submit on a finished booking — so you see balanced feedback.
          </p>
        )}

        {!Number.isNaN(userId) && userId > 0 && <TrustReviewsSection userId={userId} variant="public" />}
      </div>
      <Footer />
    </div>
  )
}
