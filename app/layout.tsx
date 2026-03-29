// app/layout.tsx
import localFont from 'next/font/local';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import Script from 'next/script';
import { headers } from 'next/headers';

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
});

const chunko = localFont({
  src: '../public/font/chunko-bold.otf',
  variable: '--font-chunko',
});

export const metadata: Metadata = {
  title: {
    default: 'Pasive',
    template: '%s | Pasive',
  },
  description: 'Make great stuff. Make great money.',
  openGraph: {
    title: 'Pasive | Make great stuff. Make great money.',
    description: 'Make great stuff. Make great money.',
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
    title: 'Pasive | Make great stuff. Make great money.',
    description: 'Make great stuff. Make great money.',
    images: ['https://pasive.co/images/thumbnail.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL('https://pasive.co'),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  const isSlugPage = pathname.startsWith('/app/') && pathname.split('/').length > 2;

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
      </head>
      <body className={`${aeonik.variable} ${chunko.variable} font-sans antialiased font-normal`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
