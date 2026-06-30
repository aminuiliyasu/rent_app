'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useRouter } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <SparklesIcon className="h-5 w-5 text-primary-800 dark:text-primary-300" />
            </div>
            <span className="font-serif text-2xl font-semibold tracking-tight text-gray-900 dark:text-stone-100">
              Rhentify
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/search"
              className="px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
            >
              {t('nav.browse')}
            </Link>
            <Link
              href="/feed"
              className="px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
            >
              {t('nav.rentRequests')}
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/listings/new"
                  className="px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  {t('nav.postListing')}
                </Link>
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/messages"
                  className="px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  {t('nav.messages')}
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher compact />
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
              aria-label={t('nav.toggleTheme')}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="hidden lg:inline">{user?.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn-outline text-sm px-5 py-2.5">
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="btn-primary text-sm px-6 py-2.5">
                  {t('nav.signUp')}
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-3 animate-slide-down">
            <div className="px-4 pb-2">
              <LanguageSwitcher />
            </div>
            <Link
              href="/search"
              className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.browse')}
            </Link>
            <Link
              href="/feed"
              className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.rentRequests')}
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/listings/new"
                  className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.postListing')}
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/messages"
                  className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.messages')}
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  {t('nav.logout')}
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="block btn-primary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.signUp')}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
