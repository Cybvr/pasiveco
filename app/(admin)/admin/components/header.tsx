'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotificationsDialog from '@/app/common/dashboard/NotificationsDialog'

const routeTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/email': 'Emails',
  '/admin/content': 'Content Manager',
}

export default function AdminHeader({ mobileNav }: { mobileNav?: ReactNode }) {
  const pathname = usePathname()
  const title = routeTitles[pathname] || 'Admin Panel'
  const [showEmailDraftsBack, setShowEmailDraftsBack] = useState(false)

  useEffect(() => {
    if (pathname !== '/admin/email') {
      setShowEmailDraftsBack(false)
      return
    }

    const handleComposerChange = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail
      setShowEmailDraftsBack(Boolean(detail?.open))
    }

    window.addEventListener('admin-email-mobile-composer-change', handleComposerChange)

    return () => {
      window.removeEventListener('admin-email-mobile-composer-change', handleComposerChange)
    }
  }, [pathname])

  const handleEmailDraftsBack = () => {
    window.dispatchEvent(new CustomEvent('admin-email-show-drafts'))
    setShowEmailDraftsBack(false)
  }

  return (
    <header className="h-14 lg:h-16 border-b px-4 lg:px-6 flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        {mobileNav}
        {showEmailDraftsBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={handleEmailDraftsBack}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to drafts</span>
          </Button>
        )}
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <NotificationsDialog viewAllHref="/dashboard/notifications" />
      </div>
    </header>
  )
}
