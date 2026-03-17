'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Coins, Home, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Home',
  },
  {
    href: '/dashboard/products',
    icon: ShoppingBag,
    label: 'Products',
  },
  {
    href: '/dashboard/wallet',
    icon: Coins,
    label: 'Earnings',
  },
  {
    href: '/dashboard/settings',
    icon: User,
    label: 'Profile',
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center justify-center px-3 py-3 text-sm transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'mb-1 h-6 w-6',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  )
}
