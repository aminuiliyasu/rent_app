import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rhentify — Rent anything. Hire locally.',
  description:
    'Rent gear, spaces, and skilled people in Budapest. Local listings, secure messaging, and no platform fees right now.',
  icons: {
    icon: '/logo/rhentify-icon.png',
    apple: '/logo/rhentify-icon.png',
  },
  openGraph: {
    title: 'Rhentify — Rent anything. Hire locally.',
    description:
      'The local marketplace for gear, spaces, and skilled people. Now live in Budapest.',
    siteName: 'Rhentify',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className={`${dmSans.className} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
