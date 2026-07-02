'use client'

import Link from 'next/link'
import { SparklesIcon } from '@heroicons/react/24/outline'

type BrandLogoProps = {
  className?: string
  /** Use on dark backgrounds (e.g. footer) */
  onDark?: boolean
}

export default function BrandLogo({ className = '', onDark = false }: BrandLogoProps) {
  const wordmarkClass = onDark
    ? 'text-2xl font-bold text-stone-100'
    : 'text-2xl font-bold gradient-text'

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 group shrink-0 ${className}`}
      aria-label="Rhentify home"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-75 blur transition-opacity group-hover:opacity-100" />
        <div className="relative rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-2">
          <SparklesIcon className="h-6 w-6 text-white" />
        </div>
      </div>
      <span className={wordmarkClass}>Rhentify</span>
    </Link>
  )
}
