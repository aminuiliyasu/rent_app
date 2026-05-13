'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrencyPresentation } from '@/contexts/CurrencyPresentationContext'
import api from '@/lib/api'
import { uploadImage } from '@/lib/upload'
import toast from 'react-hot-toast'
import { BanknotesIcon, PhotoIcon } from '@heroicons/react/24/outline'
import TrustReviewsSection from '@/components/TrustReviewsSection'

export default function ProfilePage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const { presentation, setPresentation } = useCurrencyPresentation()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatarUrl: '',
  })
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      })
      setAvatarPreview(user.avatarUrl || '')
    }
  }, [user])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const url = await uploadImage(file, 'profile')
      setFormData(prev => ({ ...prev, avatarUrl: url }))
      setAvatarPreview(url)
      toast.success('Profile picture uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.response?.data?.error || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put('/users/me', formData)
      toast.success('Profile updated successfully!')
      // Reload to update auth context
      window.location.reload()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to update profile'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Profile</h1>
        
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {formData.name.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
                  title="Change profile picture"
                >
                  <PhotoIcon className="w-4 h-4" />
                </label>
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click the camera icon to upload a new profile picture
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+1234567890"
              />
            </div>

            {/* Account Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Role:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">KYC Status:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{user?.kycStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email Verified:</span>
                  <span className={`font-medium ${user?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {user?.emailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phone Verified:</span>
                  <span className={`font-medium ${user?.phoneVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {user?.phoneVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="btn-primary flex-1"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="card mt-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 ring-1 ring-blue-500/20 dark:from-blue-400/10 dark:to-indigo-400/10 dark:ring-blue-400/25">
              <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">How prices look</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Applies across browse, listings, and bookings. Amounts stay in each listing&apos;s currency—this only changes labels (e.g.{' '}
                <span className="font-mono text-xs">HUF 5,000</span> vs <span className="font-mono text-xs">Ft5,000</span>).
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPresentation('iso')}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                presentation === 'iso'
                  ? 'border-blue-500 bg-blue-50/90 ring-2 ring-blue-500/30 dark:border-blue-400 dark:bg-blue-950/40 dark:ring-blue-400/25'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-gray-500'
              }`}
            >
              <span className="block font-semibold text-gray-900 dark:text-white">ISO codes</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">HUF, USD, EUR — clearest</span>
            </button>
            <button
              type="button"
              onClick={() => setPresentation('symbol')}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                presentation === 'symbol'
                  ? 'border-blue-500 bg-blue-50/90 ring-2 ring-blue-500/30 dark:border-blue-400 dark:bg-blue-950/40 dark:ring-blue-400/25'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-gray-500'
              }`}
            >
              <span className="block font-semibold text-gray-900 dark:text-white">Local symbols</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">Ft, $, € — compact</span>
            </button>
          </div>
        </div>

        {user?.id != null && <TrustReviewsSection userId={user.id} variant="self" />}
      </div>
      <Footer />
    </div>
  )
}
