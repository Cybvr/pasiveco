"use client"
import { AuthProvider } from '@/context/AuthContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import SupportChatWidget from '@/components/SupportChatWidget'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Check if current path is a slug page (not dashboard, auth, marketing, etc.)
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const isAuthRoute = pathname?.startsWith('/auth')
  const isAdminRoute = pathname?.startsWith('/admin')
  const isApiRoute = pathname?.startsWith('/api')
  const isSlugPage = pathname && !isDashboardRoute &&
                     !isAuthRoute &&
                     !isAdminRoute &&
                     !isApiRoute &&
                     pathname !== '/' &&
                     !pathname.startsWith('/blog') &&
                     !pathname.startsWith('/features') &&
                     !pathname.startsWith('/solutions') &&
                     !pathname.startsWith('/pricing') &&
                     !pathname.startsWith('/about') &&
                     !pathname.startsWith('/legal')
  const shouldShowSupportChat = !isSlugPage && !isAuthRoute && !isAdminRoute && !isApiRoute

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
      <CurrencyProvider>
        {children}
        {!isSlugPage && !isDashboardRoute}
        {shouldShowSupportChat ? <SupportChatWidget /> : null}
        <Toaster />
        <Sonner />
      </CurrencyProvider>
    </AuthProvider>
  )
}
