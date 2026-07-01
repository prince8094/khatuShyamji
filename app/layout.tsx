import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cinzel, Inter, Noto_Serif_Devanagari } from 'next/font/google'
import { LanguageProvider } from '@/lib/contexts/LanguageContext'
import { AudioProvider } from '@/lib/contexts/AudioContext'
import './globals.css'

const devanagari = Noto_Serif_Devanagari({
  variable: '--font-devanagari',
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  preload: false,
})

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  preload: false,
})
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Khatu Shyam Ji · Digital Darshan',
  description:
    'Book your darshan at Khatu Shyam Ji temple. Live crowd status, traffic updates, QR pass, hotels, transport and more. Jai Shree Shyam.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#D97706',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${inter.variable} ${devanagari.variable}`}
    >
      <body suppressHydrationWarning className="bg-background font-sans antialiased text-foreground selection:bg-[#D4AF37] selection:text-[#1A120B]">
        <LanguageProvider>
          <AudioProvider>
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </AudioProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
