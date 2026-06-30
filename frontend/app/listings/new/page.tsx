'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { uploadMultipleImages } from '@/lib/upload'
import { buildListingPayload, listingToFormData } from '@/lib/listingFormShared'
import { DEFAULT_LISTING_CURRENCY, LISTING_CURRENCY_OPTIONS } from '@/lib/listingCurrency'
import toast from 'react-hot-toast'
import { ListingType } from '@/lib/types'
import { mergeCategoriesWithSeed, categoryHasPersistentId } from '@/lib/seedCategories'
import { localizeCategories } from '@/lib/i18n/categoryNames'
import { useLanguage } from '@/contexts/LanguageContext'
import { toAppListingImageUrl } from '@/lib/listingImageUrl'
import {
  XMarkIcon,
  PhotoIcon,
  SparklesIcon,
  PlusIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

interface Category {
  id: number
  name: string
  slug: string
}

export default function CreateListingPage() {
  const { isAuthenticated } = useAuth()
  const { locale } = useLanguage()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    type: ListingType.ITEM,
    title: '',
    description: '',
    categoryId: '',
    priceDay: '',
    priceWeek: '',
    priceMonth: '',
    priceHour: '',
    cashDeposit: '',
    itemDeposit: '',
    address: '',
    city: '',
    state: '',
    country: '',
    deliveryOption: 'PICKUP_ONLY',
    deliveryRadius: '',
    workerName: '',
    workerBio: '',
    workerProfession: '',
    serviceArea: '',
    availableDays: '',
    pricingCurrency: DEFAULT_LISTING_CURRENCY,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchCategories()
  }, [isAuthenticated, router])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(mergeCategoriesWithSeed(response.data || []))
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories(mergeCategoriesWithSeed([]))
    }
  }

  const displayCategories = useMemo(
    () => localizeCategories(categories, locale),
    [categories, locale],
  )

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploadingImages(true)
    try {
      const urls = await uploadMultipleImages(validFiles)
      setSelectedImages(prev => [...prev, ...urls])
      setImageFiles(prev => [...prev, ...validFiles])
      toast.success(`${validFiles.length} image(s) uploaded successfully!`)
    } catch (error: unknown) {
      console.error('Error uploading images:', error)
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Failed to upload images')
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  /** Same-origin `/uploads/...` so previews work on port 3000 via Next rewrites */
  const previewSrc = (url: string) => toAppListingImageUrl(url) || url

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = await buildListingPayload(formData, selectedImages)
      if (!payload) {
        setLoading(false)
        return
      }

      const response = await api.post('/listings', payload)
      toast.success('Listing created successfully!')
      router.push(`/listings/${response.data.id}`)
    } catch (error: any) {
      console.error('Error creating listing:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to create listing'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 animate-slide-down">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-50"></div>
              <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-xl">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                Create New{' '}
                <span className="gradient-text">Listing</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
                Share your items or services with the community
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card-glass animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-blue-500" />
              Basic Information
            </h2>
            
            <div className="space-y-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Listing Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ListingType })}
                  className="input-field font-semibold"
                  required
                >
                  <option value={ListingType.ITEM}>Item</option>
                  <option value={ListingType.WORKER}>Worker</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                  placeholder="e.g., Professional Camera Equipment"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={5}
                  placeholder="Describe your listing in detail..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="input-field font-semibold"
                  required
                >
                  <option value="">Select a category</option>
                  {displayCategories.map((category) => (
                    <option
                      key={category.slug || category.id}
                      value={
                        categoryHasPersistentId(category)
                          ? String(category.id)
                          : `slug:${category.slug}`
                      }
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Available Days
                </label>
                <select
                  value={formData.availableDays}
                  onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                  className="input-field font-semibold"
                >
                  <option value="">Select availability</option>
                  <option value="EVERYDAY">Every day</option>
                  <option value="WEEKDAYS">Weekdays (Mon-Fri)</option>
                  <option value="WEEKENDS">Weekends (Sat-Sun)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card-glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <PhotoIcon className="h-6 w-6 text-purple-500" />
              Images
            </h2>
            
            <div className="space-y-6">
              {/* Primary preview — same image shown first when browsing */}
              {selectedImages.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-900/10 aspect-[21/9] md:aspect-[2/1] max-h-[min(52vh,28rem)]">
                  <img
                    src={previewSrc(selectedImages[0])}
                    alt="Primary listing photo preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16">
                    <p className="text-sm font-bold text-white drop-shadow-md">
                      Primary photo — this is what people see first when browsing
                    </p>
                  </div>
                </div>
              )}

              {/* Thumbnails (all images; remove adjusts indices including primary) */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedImages.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group">
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={previewSrc(url)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                    uploadingImages
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                  }`}
                >
                  {uploadingImages ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-3"></div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="p-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-3">
                        <PhotoIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Click to upload images
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        PNG, JPG up to 5MB each
                      </span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card-glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <CurrencyDollarIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden />
              Pricing
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Listing currency
              </label>
              <select
                value={formData.pricingCurrency}
                onChange={(e) => setFormData({ ...formData, pricingCurrency: e.target.value })}
                className="input-field font-semibold max-w-md"
              >
                {LISTING_CURRENCY_OPTIONS.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                All rates and the cash deposit (if numeric) are stored and shown in this currency.
              </p>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter amounts as numbers (decimals allowed). Leave a field blank if you don&apos;t use that period.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Hourly rate
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={formData.priceHour}
                  onChange={(e) => setFormData({ ...formData, priceHour: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 25"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Daily rate
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={formData.priceDay}
                  onChange={(e) => setFormData({ ...formData, priceDay: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 150"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Weekly rate
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={formData.priceWeek}
                  onChange={(e) => setFormData({ ...formData, priceWeek: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Monthly rate
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={formData.priceMonth}
                  onChange={(e) => setFormData({ ...formData, priceMonth: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 3200"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Security Deposit
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Cash Deposit
                  </label>
                  <input
                    type="text"
                    value={formData.cashDeposit}
                    onChange={(e) => setFormData({ ...formData, cashDeposit: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Item Deposit
                  </label>
                  <input
                    type="text"
                    value={formData.itemDeposit}
                    onChange={(e) => setFormData({ ...formData, itemDeposit: e.target.value })}
                    className="input-field"
                    placeholder="e.g., National ID card"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card-glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPinIcon className="h-7 w-7 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  placeholder="District"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input-field"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Worker-specific fields */}
          {formData.type === ListingType.WORKER && (
            <div className="card-glass animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <UserIcon className="h-7 w-7 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden />
                Worker Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Worker Name
                  </label>
                  <input
                    type="text"
                    value={formData.workerName}
                    onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                    className="input-field"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Profession
                  </label>
                  <input
                    type="text"
                    value={formData.workerProfession}
                    onChange={(e) => setFormData({ ...formData, workerProfession: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Electrician, Photographer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.workerBio}
                    onChange={(e) => setFormData({ ...formData, workerBio: e.target.value })}
                    className="input-field"
                    rows={4}
                    placeholder="Tell us about your skills and experience..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="btn-primary flex-1 py-4 text-lg font-bold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Listing'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary px-8 py-4 text-lg font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}
