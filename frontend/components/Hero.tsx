'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid'

export default function Hero() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradient-shift 15s ease infinite'
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/25 backdrop-blur-xl border-2 border-white/40 mb-10 animate-slide-down shadow-2xl">
            <SparklesIcon className="h-5 w-5 text-white mr-2" />
            <span className="text-base font-bold text-white">
              Your local rental & hire marketplace
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white mb-10 leading-tight animate-slide-up drop-shadow-2xl">
            Anything you need.<br />
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl" style={{ textShadow: '0 0 30px rgba(255, 235, 59, 0.5)' }}>
              Hire anyone.
            </span>
            <br />
            <span className="text-white drop-shadow-2xl">All around you</span>
          </h1>
          
          <p className="text-2xl md:text-3xl lg:text-4xl text-white mb-16 max-w-5xl mx-auto font-medium leading-relaxed animate-slide-up drop-shadow-lg" style={{ animationDelay: '0.1s' }}>
            Discover a wide range of items and skilled proffesional available for rent in your area
            <span className="block mt-4 text-xl md:text-2xl text-white/95 font-normal">
              Your marketplace for everything you need, when you need it.
            </span>
          </p>

          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative flex flex-col sm:flex-row gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/50">
                <div className="flex-1 relative">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                    <MagnifyingGlassIcon className="h-7 w-7 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for items, workers, or services..."
                    className="w-full pl-16 pr-6 py-6 text-gray-900 text-xl focus:outline-none placeholder:text-gray-400 font-semibold bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white px-12 py-6 whitespace-nowrap text-xl font-black shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95 uppercase tracking-wider"
                  style={{ backgroundSize: '200% 200%', animation: 'gradient-shift 3s ease infinite' }}
                >
                  <span className="relative z-10">Search</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                </button>
              </div>
            </div>
          </form>

          <p className="mt-8 mb-4 text-lg sm:text-xl md:text-2xl font-bold text-white text-center max-w-3xl mx-auto px-4 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            Currently, all transactions are 100% free
          </p>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" className="dark:fill-gray-50"/>
        </svg>
      </div>
    </div>
  )
}
