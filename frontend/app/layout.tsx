import type { Metadata } from 'next'
import { DM_Sans, Lora } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rhentify — Rent anything. Hire locally.',
  description:
    'Premium local marketplace for renting gear, spaces, and skilled professionals — book with confidence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`}>
      <body className={`${dmSans.className} font-sans`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: '!bg-[#0A0B10] !text-white !border !border-white/10 !shadow-2xl',
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
