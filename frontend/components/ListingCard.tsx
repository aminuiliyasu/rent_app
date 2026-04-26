'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Listing } from '@/lib/types'
import { StarIcon, CubeIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/listings/${listing.id}`} className="listing-card group">
      {/* Image */}
      <div className="relative h-64 mb-4 rounded-t-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        {listing.primaryImageUrl ? (
          <Image
            src={listing.primaryImageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
            <CubeIcon className="h-20 w-20 text-blue-400/80 dark:text-blue-500/50" aria-hidden />
          </div>
        )}
        
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Featured badge */}
        {listing.isFeatured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1">
            <SparklesIcon className="h-3 w-3" />
            Featured
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ${listing.priceDay?.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">/day</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {listing.title}
        </h3>
        
        {listing.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{listing.description}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          {listing.city && listing.state && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPinIcon className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{listing.city}, {listing.state}</span>
            </div>
          )}
          
          {listing.averageRating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  i < Math.floor(listing.averageRating || 0) ? (
                    <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ) : (
                    <StarOutlineIcon key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                  )
                ))}
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">{listing.averageRating.toFixed(1)}</span>
              {listing.reviewCount && (
                <span className="text-gray-500 dark:text-gray-400 text-xs">({listing.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {listing.type === 'WORKER' && listing.workerProfession && (
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{listing.workerProfession}</span>
          </div>
        )}
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/50 dark:group-hover:border-blue-400/50 transition-all duration-300 pointer-events-none"></div>
    </Link>
  )
}
