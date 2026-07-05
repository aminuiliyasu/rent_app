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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  title: 'Rhentify — Rent anything. Hire locally.',
  description:
    'Rent gear, spaces, and skilled people in Budapest. Local listings, secure messaging, and no platform fees.',
  icons: {
    icon: [
      { url: '/logo/rhentify-icon.svg', type: 'image/svg+xml' },
      { url: '/logo/rhentify-icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/logo/rhentify-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/logo/rhentify-icon.png',
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
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo/rhentify-icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/logo/rhentify-icon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/logo/rhentify-icon.png" />
        <link rel="shortcut icon" href="/logo/rhentify-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${dmSans.className} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
