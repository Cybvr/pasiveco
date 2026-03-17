'use client'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User, CreditCard, Gift, Menu, Wallet, ArrowUpRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { auth } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const settingsLinks = [
  { href: '/dashboard/settings', label: 'General', icon: User },
  { href: '/dashboard/settings/account', label: 'My Account', icon: User },
  { href: '/dashboard/settings/plans', label: 'Plans', icon: CreditCard },
  { href: '/dashboard/settings/plan-billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings/earnings', label: 'Earnings', icon: Wallet },
  { href: '/dashboard/settings/withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
  { href: '/dashboard/settings/refer', label: 'Refer a friend', icon: Gift },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      {/* Mobile menu header - moved to top */}
      <div className="md:hidden border-b bg-background">
        <div className="">
          <Button 
            variant="ghost" 
            className="w-full flex justify-between" 
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            <span>Menu</span>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile dropdown */}
        {isDropdownOpen && (
          <div className="border-t p-2 space-y-1">
            {settingsLinks.map((link) => (
              <Button
                key={link.href}
                variant={pathname === link.href ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => {
                  router.push(link.href)
                  setDropdownOpen(false)
                }}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            ))}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to login again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-56 border-r bg-background">
        <nav className="space-y-1 p-4 w-full">
          {settingsLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 mb-1"
              onClick={() => router.push(link.href)}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Button>
          ))}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 mt-4"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to login again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">{children}</div>
    </div>
  )
}
