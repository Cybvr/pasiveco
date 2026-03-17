'use client'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User, CreditCard, Gift, Wallet, ArrowUpRight } from 'lucide-react'
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
import { toast } from "@/hooks/use-toast"

const settingsLinks = [
  { href: '/dashboard/settings', label: 'General', icon: User },
  { href: '/dashboard/settings/account', label: 'My Account', icon: User },
  { href: '/dashboard/settings/plans', label: 'Plans', icon: CreditCard },
  { href: '/dashboard/settings/plan-billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings/refer', label: 'Refer a friend', icon: Gift },
  { href: '/dashboard/settings/earnings', label: 'Earnings', icon: Wallet },
  { href: '/dashboard/settings/withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const isSettingsLinkActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Unable to log out',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-56 border-r bg-background">
        <nav className="space-y-1 p-4 w-full">
          {settingsLinks.map((link) => (
            <Button
              key={link.href}
              variant={isSettingsLinkActive(link.href) ? "secondary" : "ghost"}
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