// app/layout.tsx
import { IBM_Plex_Sans } from 'next/font/google';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import Script from 'next/script';
import MobileFooter from '@/app/common/website/MobileFooter';
import { headers } from 'next/headers';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Pasive | Sell and share all you create in one place',
    template: '%s | Pasive',
  },
  description: 'Pasive.',
  openGraph: {
    title: 'Pasive',
    description: 'Sell and share all you create in one place',
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
    title: 'Pasive',
    description: 'Sell and share all you create in one place',
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
      <body className={`${ibmPlexSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster />
        </ThemeProvider>
        <Script src="https://js.paystack.co/v1/inline.js" />
      </body>
    </html>
  );
}
