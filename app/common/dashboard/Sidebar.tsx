'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Home,
  Cookie,
  Users,
  BarChart,
  Coins,
  Wallet,
  ArrowUpRight,
  ReceiptText,
  PanelLeftClose,
  PanelLeftOpen,
  Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import UserMenu from './user-menu'

export default function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) {
  const pathname = usePathname()
  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Home',
    },
    {
      href: '/dashboard/edit',
      icon: Palette,
      label: 'Customize',
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
      label: 'Earnings',
    },
    {
      href: '/dashboard/payouts',
      icon: ArrowUpRight,
      label: 'Withdrawals',
    },
    {
      href: '/dashboard/billings',
      icon: ReceiptText,
      label: 'Subscriptions',
    }
  ]

  return (
    <div className="flex flex-col h-full bg-card">
      <div className={cn(
        "px-3 py-3 border-b border-border/50 h-14 flex items-center transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="p-1.5 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Image src="/images/monster.png" alt="Monster" width={24} height={24} />
            </div>
            <h1 className="text-lg text-foreground font-black tracking-tighter">pasive</h1>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors hidden md:block"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-2.5">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : ""}
                className={cn(
                  "flex items-center text-[13px] font-medium rounded-lg transition-all duration-200",
                  isCollapsed ? "justify-center p-2" : "px-2.5 py-2",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2.5", isActive ? "text-foreground" : "text-muted-foreground")} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className={cn(
        "p-3 border-t border-border/50",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <UserMenu isCollapsed={isCollapsed} />
      </div>
    </div>
  )
}
