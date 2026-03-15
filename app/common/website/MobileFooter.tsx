'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Cookie, Users, BarChart, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export default function MobileFooter() {
  const { user } = useAuth()
  const pathname = usePathname()
  
  // Don't render if we're still loading auth state
  if (user === undefined) return null

  const navItems = [
    {
      href: '/dashboard',
      icon: Cookie,
      label: 'Design',
    },
    {
      href: '/dashboard/products',
      icon: ShoppingBag,
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
      href: '/dashboard/settings',
      icon: User,
      label: 'Profile',
    }
  ]

  // Only show mobile footer for authenticated users
  if (!user) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around py-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 text-[10px] transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 mb-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
      {/* Add padding to body to prevent content from being hidden behind footer */}
      <div className="h-16 md:hidden" />
    </>
  )
}
