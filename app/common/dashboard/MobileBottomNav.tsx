'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Compass, Home, Package, User, LucideIcon, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/discovery', icon: Compass, label: 'Discovery' },
  { href: '/dashboard/communities', icon: Users, label: 'Communities' },
  { href: '/dashboard/products', icon: Package, label: 'Products' },
  { href: '/dashboard/settings', icon: User, label: 'Profile' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/dashboard'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2 text-[11px] transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'mb-1 h-5 w-5',
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
