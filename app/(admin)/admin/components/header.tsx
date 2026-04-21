'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
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

  return (
    <header className="h-16 border-b px-6 flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        {mobileNav}
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
