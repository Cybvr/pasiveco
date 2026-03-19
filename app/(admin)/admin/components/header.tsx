import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UserMenu from '@/app/common/dashboard/user-menu'

export default function AdminHeader() {
  return (
    <header className="h-16 border-b px-6 flex items-center justify-between bg-background">
      <h2 className="text-lg font-semibold">Admin Panel</h2>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}
