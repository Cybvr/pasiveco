'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BarChart,
  Coins,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  LifeBuoy,
  LucideIcon,
  Users,
  FileText,
  QrCode,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import UserMenu from './user-menu'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/edit', icon: Palette, label: 'Edit Page' },
  { href: '/dashboard/products', icon: Package, label: 'Products' },
  { href: '/dashboard/earnings', icon: Coins, label: 'Earnings' },
  { href: '/dashboard/customers', icon: Users, label: 'Customers' },
  { href: '/dashboard/network', icon: Zap, label: 'Network' },
  { href: '/dashboard/analytics', icon: BarChart, label: 'Analytics' },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: '/admin', icon: Home, label: 'Admin' },
  { href: '/dashboard', icon: QrCode, label: 'Home' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/content', icon: FileText, label: 'Content' },
]

const DEFAULT_BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/help', icon: LifeBuoy, label: 'Help & Support' },
]

export default function Sidebar({
  isCollapsed,
  onToggle,
  navItems,
  bottomNavItems = DEFAULT_BOTTOM_NAV_ITEMS,
}: {
  isCollapsed: boolean,
  onToggle: () => void,
  navItems?: NavItem[],
  bottomNavItems?: NavItem[],
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  const currentNavItems = navItems || (isAdmin ? ADMIN_NAV_ITEMS : DASHBOARD_NAV_ITEMS)
  const isItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    if (href === '/admin') return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <div className={cn(
        "px-2.5 py-2 border-b border-border/50 h-12 flex items-center transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="p-1 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Image src="/images/monster.png" alt="Monster" width={20} height={20} />
            </div>
            <div>
              <h1 className="text-base text-foreground font-black tracking-tighter leading-none">pasive</h1>
              {isAdmin && <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Admin</p>}
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors hidden md:block"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-1.5">
        <nav className="space-y-px">
          {currentNavItems.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : ""}
                className={cn(
                  "flex items-center text-xs font-medium rounded-md transition-all duration-200 leading-none",
                  isCollapsed ? "justify-center h-8 w-8 mx-auto" : "px-2 py-1.5 min-h-8",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", !isCollapsed && "mr-1.5", isActive ? "text-foreground" : "text-muted-foreground")} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-border/50 px-1.5 py-2">
        <nav className="space-y-px">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : ""}
                className={cn(
                  "flex items-center text-xs font-medium rounded-md transition-all duration-200 leading-none",
                  isCollapsed ? "justify-center h-8 w-8 mx-auto" : "px-2 py-1.5 min-h-8",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", !isCollapsed && "mr-1.5", isActive ? "text-foreground" : "text-muted-foreground")} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className={cn(
        "p-2 border-t border-border/50",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <UserMenu isCollapsed={isCollapsed} />
      </div>
    </div>
  )
}
