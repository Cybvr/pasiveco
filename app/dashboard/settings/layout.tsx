'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User, CreditCard, ArrowUpRight, ChevronRight, ArrowLeft, ShieldCheck, Palette, HelpCircle, Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils'
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
  { href: '/dashboard/settings/account', label: 'My Profile', icon: User },
  { href: '/dashboard/settings/security', label: 'Security', icon: ShieldCheck },
  { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings/appearance', label: 'Appearance', icon: Palette },
  { href: '/dashboard/payouts', label: 'Withdrawals', icon: ArrowUpRight },
  { href: '/dashboard/settings/payment-method', label: 'Payout Methods', icon: CreditCard },
  { href: '/dashboard/settings/plan-billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard/payouts/')) return 'Withdrawal Details'
    if (pathname.startsWith('/dashboard/settings/earnings/')) return 'Earnings Details'

    const activeLink = settingsLinks.find((link) =>
      pathname === link.href || pathname.startsWith(`${link.href}/`)
    )

    return activeLink?.label ?? 'Settings'
  }

  const isSettingsLinkActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const isRootSettingsPage = pathname === '/dashboard/settings'

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
      <div className="hidden md:flex md:w-56 border-r bg-background flex-col p-3">
        <nav className="space-y-px w-full">
          {settingsLinks.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={cn(
                "flex min-h-8 w-full items-center rounded-md px-2 py-1.5 text-xs font-medium leading-none transition-all duration-200",
                isSettingsLinkActive(link.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <link.icon className={cn(
                "mr-1.5 h-3.5 w-3.5 shrink-0",
                isSettingsLinkActive(link.href) ? "text-foreground" : "text-muted-foreground"
              )} />
              <span className="flex-1 truncate text-left">{link.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="flex min-h-8 w-full items-center rounded-md px-2 py-1.5 text-left text-xs font-medium leading-none text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Logout</span>
              </button>
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
      </div>

      <div className="flex-1 overflow-auto">
        {!isRootSettingsPage && (
          <div className="px-3 py-2 border-b bg-background">
            <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push('/dashboard/settings')}
              aria-label="Back to settings"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
              <h1 className="text-base font-semibold tracking-tight">{getPageTitle()}</h1>
            </div>
          </div>
        )}
        <div className={isRootSettingsPage ? '' : 'px-3 py-3 md:px-4 md:py-4'}>
          {children}
        </div>
      </div>
    </div>
  )
}
