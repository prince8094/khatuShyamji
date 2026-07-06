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
  generator: "Khatu Shyam Ji Digital Pilgrimage Platform",
  icons: {
    icon: '/images/khatu-shyam-logo.png',
    apple: '/images/khatu-shyam-logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#800000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Khatu Shyam Ji" />
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
      </head>
      <body suppressHydrationWarning className="bg-background font-sans antialiased text-foreground selection:bg-[#D4AF37] selection:text-[#1A120B]">
        <LanguageProvider>
          <AudioProvider>
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </AudioProvider>
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('Service Worker registered with scope:', reg.scope);
                  }).catch(function(err) {
                    console.error('Service Worker registration failed:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  )
}
