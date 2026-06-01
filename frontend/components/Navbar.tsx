'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import {
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

const NAV_LINKS = [
  { href: '/search', label: 'Explore' },
  { href: '/feed', label: 'Requests' },
] as const

const AUTH_LINKS = [
  { href: '/listings/new', label: 'List an item' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/messages', label: 'Messages' },
] as const

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isHome = pathname === '/'
  const onDarkHero = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const linkClass = onDarkHero ? 'nav-link nav-link-light' : 'nav-link nav-link-dark'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        onDarkHero
          ? 'border-transparent bg-transparent'
          : 'border-ink-100/80 border-b bg-white/85 shadow-sm backdrop-blur-xl dark:border-ink-800 dark:bg-ink-950/85'
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl font-serif text-lg italic transition-transform duration-300 group-hover:scale-105 ${
              onDarkHero
                ? 'bg-white text-ink-900'
                : 'bg-ink-900 text-white dark:bg-white dark:text-ink-900'
            }`}
          >
            R
          </span>
          <span
            className={`text-xl font-semibold tracking-tight ${
              onDarkHero ? 'text-white' : 'text-ink-900 dark:text-white'
            }`}
          >
            Rhentify
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
          {isAuthenticated &&
            AUTH_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
        </div>

        {/* Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded-full p-2.5 transition-colors ${
              onDarkHero
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-colors ${
                  onDarkHero
                    ? 'bg-white/10 hover:bg-white/15'
                    : 'bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    onDarkHero ? 'bg-accent text-ink-900' : 'bg-ink-900 text-white'
                  }`}
                >
                  {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
                <span
                  className={`max-w-[120px] truncate text-sm font-medium ${
                    onDarkHero ? 'text-white' : 'text-ink-800 dark:text-ink-100'
                  }`}
                >
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDownIcon
                  className={`h-4 w-4 ${onDarkHero ? 'text-white/60' : 'text-ink-400'}`}
                />
              </button>
              {userMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    aria-label="Close menu"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-ink-100 bg-white py-1 shadow-card-hover dark:border-ink-700 dark:bg-ink-900">
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-sand-100 dark:text-ink-200 dark:hover:bg-ink-800"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-sand-100 dark:text-ink-200 dark:hover:bg-ink-800"
                    >
                      Dashboard
                    </Link>
                    <hr className="my-1 border-ink-100 dark:border-ink-700" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={onDarkHero ? 'btn-ghost-light' : 'nav-link nav-link-dark'}
              >
                Sign in
              </Link>
              <Link href="/register" className="btn-accent">
                Get started
              </Link>
            </>
          )}

          {isAuthenticated && (
            <Link
              href="/listings/new"
              className={
                onDarkHero
                  ? 'ml-1 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-sand-50'
                  : 'btn-primary ml-1 !py-2.5 !text-sm'
              }
            >
              List item
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className={`rounded-xl p-2.5 md:hidden ${
            onDarkHero ? 'text-white' : 'text-ink-800 dark:text-white'
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className={`border-t px-4 py-6 md:hidden ${
            onDarkHero
              ? 'border-white/10 bg-ink-900/95 backdrop-blur-xl'
              : 'border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-950'
          }`}
        >
          <div className="flex flex-col gap-1">
            {[...NAV_LINKS, ...(isAuthenticated ? AUTH_LINKS : [])].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3 text-base font-medium ${
                  onDarkHero
                    ? 'text-white/90 hover:bg-white/10'
                    : 'text-ink-800 hover:bg-sand-100 dark:text-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4 dark:border-ink-800">
                <Link href="/login" className="btn-secondary text-center">
                  Sign in
                </Link>
                <Link href="/register" className="btn-accent text-center">
                  Get started
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 rounded-xl px-4 py-3 text-left text-red-500"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
