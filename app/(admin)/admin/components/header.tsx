import type { ReactNode } from 'react'
import UserMenu from '@/app/common/dashboard/user-menu'
import NotificationsDialog from '@/app/common/dashboard/NotificationsDialog'

export default function AdminHeader({ mobileNav }: { mobileNav?: ReactNode }) {
  return (
    <header className="h-16 border-b px-6 flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        {mobileNav}
        <div>
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <p className="hidden text-sm text-muted-foreground md:block">Manage users and content</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationsDialog viewAllHref="/dashboard/notifications" />
        <UserMenu />
      </div>
    </header>
  )
}
