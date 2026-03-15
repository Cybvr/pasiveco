"use client"
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import MobileFooter from '@/app/common/website/MobileFooter'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Check if current path is a slug page (not dashboard, auth, marketing, etc.)
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const isSlugPage = pathname && !isDashboardRoute &&
                     !pathname.startsWith('/auth') &&
                     !pathname.startsWith('/admin') &&
                     !pathname.startsWith('/api') &&
                     pathname !== '/' &&
                     !pathname.startsWith('/blog') &&
                     !pathname.startsWith('/features') &&
                     !pathname.startsWith('/solutions') &&
                     !pathname.startsWith('/pricing') &&
                     !pathname.startsWith('/about') &&
                     !pathname.startsWith('/legal')

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('ServiceWorker registered');
          })
          .catch((registrationError) => {
            console.log('ServiceWorker registration failed: ', registrationError);
          });
      });
    }
  }, [])

  return (
    <AuthProvider>
      {children}
      {!isSlugPage && <MobileFooter />}
      <Toaster />
      <Sonner />
    </AuthProvider>
  )
}