import localFont from 'next/font/local'
import { EB_Garamond, Libre_Baskerville } from 'next/font/google'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import ClientLayout from './ClientLayout'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import ConsentAnalytics from '@/components/common/ConsentAnalytics'

const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  display: 'swap',
})

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-baskerville',
  display: 'swap',
})

const aeonik = localFont({
  src: [
    { path: '../public/font/AeonikPro-Air.otf', weight: '100', style: 'normal' },
    { path: '../public/font/AeonikPro-AirItalic.otf', weight: '100', style: 'italic' },
    { path: '../public/font/AeonikPro-Thin.otf', weight: '200', style: 'normal' },
    { path: '../public/font/AeonikPro-ThinItalic.otf', weight: '200', style: 'italic' },
    { path: '../public/font/AeonikPro-Light.otf', weight: '300', style: 'normal' },
    { path: '../public/font/AeonikPro-LightItalic.otf', weight: '300', style: 'italic' },
    { path: '../public/font/AeonikPro-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/font/AeonikPro-RegularItalic.otf', weight: '400', style: 'italic' },
    { path: '../public/font/AeonikPro-Medium.otf', weight: '500', style: 'normal' },
    { path: '../public/font/AeonikPro-MediumItalic.otf', weight: '500', style: 'italic' },
    { path: '../public/font/AeonikPro-Bold.otf', weight: '700', style: 'normal' },
    { path: '../public/font/AeonikPro-BoldItalic.otf', weight: '700', style: 'italic' },
    { path: '../public/font/AeonikPro-Black.otf', weight: '900', style: 'normal' },
    { path: '../public/font/AeonikPro-BlackItalic.otf', weight: '900', style: 'italic' },
  ],
  variable: '--font-aeonik',
})

const chunko = localFont({
  src: '../public/font/chunko-bold.otf',
  variable: '--font-chunko',
})

export const metadata: Metadata = {
  title: {
    default: 'Pasive',
    template: '%s | Pasive',
  },
  description: 'Sell digital products online',
  openGraph: {
    title: 'Pasive | Go Be Awesome',
    description: 'Sell digital products online',
    url: 'https://pasive.cc',
    siteName: 'Pasive',
    images: [
      {
        url: 'https://pasive.cc/images/thumbnail.jpg',
        width: 1200,
        height: 630,
        alt: 'Pasive',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pasive | Go Be Awesome',
    description: 'Sell digital products online',
    images: ['https://pasive.cc/images/thumbnail.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL('https://pasive.cc'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${aeonik.variable} ${chunko.variable} ${garamond.variable} ${baskerville.variable} font-sans antialiased font-normal`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </ThemeProvider>

        <ConsentAnalytics />
      </body>
    </html>
  )
}
