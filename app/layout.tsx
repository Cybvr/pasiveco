import localFont from 'next/font/local'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import ClientLayout from './ClientLayout'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import Script from 'next/script'

const aeonik = localFont({
  src: [
    {
      path: '../public/font/AeonikPro-Air.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/font/AeonikPro-AirItalic.otf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../public/font/AeonikPro-Thin.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/font/AeonikPro-ThinItalic.otf',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../public/font/AeonikPro-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/font/AeonikPro-LightItalic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../public/font/AeonikPro-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/font/AeonikPro-RegularItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/font/AeonikPro-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/font/AeonikPro-MediumItalic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../public/font/AeonikPro-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/font/AeonikPro-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../public/font/AeonikPro-Black.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../public/font/AeonikPro-BlackItalic.otf',
      weight: '900',
      style: 'italic',
    },
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
    url: 'https://pasive.co',
    siteName: 'Pasive',
    images: [
      {
        url: 'https://pasive.co/images/thumbnail.jpg',
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
    images: ['https://pasive.co/images/thumbnail.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL('https://pasive.co'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16978252898"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16978252898');
          `}
        </Script>
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1138878812634716');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${aeonik.variable} ${chunko.variable} font-sans antialiased font-normal`}>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1138878812634716&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
