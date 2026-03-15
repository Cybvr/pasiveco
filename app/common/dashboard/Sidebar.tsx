'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  User, 
  Cookie, 
  Users, 
  BarChart, 
  Coins, 
  Wallet, 
  ArrowUpRight, 
  ReceiptText 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()
  const navItems = [
    {
      href: '/dashboard',
      icon: Cookie,
      label: 'Design',
    },
    {
      href: '/dashboard/products',
      icon: Coins,
      label: 'Products',
    },
    {
      href: '/dashboard/audience',
      icon: Users,
      label: 'Audience',
    },
    {
      href: '/dashboard/analytics',
      icon: BarChart,
      label: 'Analytics',
    },
    {
      href: '/dashboard/wallet',
      icon: Wallet,
      label: 'Wallet',
    },
    {
      href: '/dashboard/payouts',
      icon: ArrowUpRight,
      label: 'Payouts',
    },
    {
      href: '/dashboard/billings',
      icon: ReceiptText,
      label: 'Billings',
    },
    {
      href: '/dashboard/settings/account',
      icon: User,
      label: 'Profile',
    }
  ]

  return (
    <div className="hidden md:flex md:flex-col bg-background">
      <div className="flex flex-col flex-grow overflow-y-auto">
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
