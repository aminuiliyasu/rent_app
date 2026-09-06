'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import LocaleThemeControls from '@/components/LocaleThemeControls'
import BrandLogo from '@/components/BrandLogo'
import { useRouter } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

const desktopLinkClass =
  'px-4 py-2 rounded-full text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-200/70 dark:hover:bg-stone-800 hover:text-stone-950 dark:hover:text-accent-light transition-colors duration-200'

const mobileLinkClass =
  'block px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-accent-muted dark:hover:text-accent-light transition-all'

function ProfileButton({
  showName = false,
  onNavigate,
}: {
  showName?: boolean
  onNavigate?: () => void
}) {
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const href = isAuthenticated ? '/profile' : '/login'

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={t('nav.profile')}
      title={t('nav.profile')}
      className="flex items-center space-x-2 p-2 md:px-4 md:py-2.5 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
    >
      {user?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar URLs may be external or /uploads
        <img
          src={user.avatarUrl}
          alt=""
          className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
        />
      ) : (
        <UserCircleIcon className="h-7 w-7 md:h-6 md:w-6" />
      )}
      {showName && isAuthenticated && (
        <span className="hidden lg:inline max-w-[10rem] truncate">{user?.name}</span>
      )}
    </Link>
  )
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <BrandLogo />

          <div className="hidden md:flex items-center space-x-2">
            <Link href="/search" className={desktopLinkClass}>
              {t('nav.browse')}
            </Link>
            <Link href="/feed" className={desktopLinkClass}>
              {t('nav.rentRequests')}
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/listings/new" className={desktopLinkClass}>
                  {t('nav.postListing')}
                </Link>
                <Link href="/dashboard" className={desktopLinkClass}>
                  {t('nav.dashboard')}
                </Link>
                <Link href="/bookings/my" className={desktopLinkClass}>
                  {t('nav.bookings')}
                </Link>
                <Link href="/messages" className={desktopLinkClass}>
                  {t('nav.messages')}
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <LocaleThemeControls compact />
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <ProfileButton showName />
                <button onClick={handleLogout} className="btn-outline text-sm px-5 py-2.5">
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-stone-700 dark:text-stone-300 text-sm font-semibold hover:text-accent-muted dark:hover:text-accent-light transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="btn-primary text-sm px-6 py-2.5">
                  {t('nav.signUp')}
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-1">
            <ProfileButton />
            <button
              className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-3 animate-slide-down">
            <div className="px-4 pb-2">
              <LocaleThemeControls />
            </div>
            <Link href="/search" className={mobileLinkClass} onClick={closeMobileMenu}>
              {t('nav.browse')}
            </Link>
            <Link href="/feed" className={mobileLinkClass} onClick={closeMobileMenu}>
              {t('nav.rentRequests')}
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/listings/new" className={mobileLinkClass} onClick={closeMobileMenu}>
                  {t('nav.postListing')}
                </Link>
                <Link href="/dashboard" className={mobileLinkClass} onClick={closeMobileMenu}>
                  {t('nav.dashboard')}
                </Link>
                <Link href="/bookings/my" className={mobileLinkClass} onClick={closeMobileMenu}>
                  {t('nav.bookings')}
                </Link>
                <Link href="/messages" className={mobileLinkClass} onClick={closeMobileMenu}>
                  {t('nav.messages')}
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    closeMobileMenu()
                  }}
                  className={`${mobileLinkClass} w-full text-left`}
                >
                  {t('nav.logout')}
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link href="/login" className={mobileLinkClass} onClick={closeMobileMenu}>
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="block btn-primary text-center"
                  onClick={closeMobileMenu}
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
