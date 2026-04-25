"use client"
import { AuthProvider } from '@/context/AuthContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import SupportChatWidget from '@/components/SupportChatWidget'
import ImpersonationBanner from '@/components/admin/ImpersonationBanner'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { registerServiceWorker } from './sw-register'
import { useAuth as useAuthHook } from '@/hooks/useAuth'

function LayoutContent({ children, isSlugPage, isDashboardRoute, shouldShowSupportChat }: any) {
  const { isImpersonating } = useAuthHook()
  
  return (
    <div className={isImpersonating ? 'pt-12' : ''}>
      <ImpersonationBanner />
      {children}
      {shouldShowSupportChat ? <SupportChatWidget /> : null}
    </div>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Check if current path is a slug page (not dashboard, auth, marketing, etc.)
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const isMessagesRoute = pathname === '/dashboard/messages'
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
                     !pathname.startsWith('/legal') &&
                     !pathname.startsWith('/jobs')
  const shouldShowSupportChat = !isSlugPage && !isAuthRoute && !isAdminRoute && !isApiRoute && !isMessagesRoute

  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <AuthProvider>
      <CurrencyProvider>
        <LayoutContent 
          isSlugPage={isSlugPage} 
          isDashboardRoute={isDashboardRoute} 
          shouldShowSupportChat={shouldShowSupportChat}
        >
          {children}
        </LayoutContent>
        <Toaster />
        <Sonner />
      </CurrencyProvider>
    </AuthProvider>
  )
}
