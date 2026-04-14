'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Home,
  BarChart,
  Coins,
  Bot,
  ShoppingBag,
  Package,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Palette,
  Blend,
  LifeBuoy,
  LucideIcon,
  Users,
  FileText,
  QrCode,
  Zap,
  CalendarDays,
  MessageSquare,
  Lock,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import UserMenu from './user-menu'
import { useNetworkActivity } from '@/hooks/useNetworkActivity'
import { useMessageActivity } from '@/hooks/useMessageActivity'
import { useAuth } from '@/hooks/useAuth'
import PricingPlans from '@/app/common/website/PricingPlans'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'


interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  subItems?: NavItem[]
}

const DASHBOARD_PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/bookings', icon: CalendarDays, label: 'Bookings' },
  {
    href: '/dashboard/products',
    icon: ShoppingBag,
    label: 'Store',
    subItems: [
      { href: '/dashboard/products', icon: Package, label: 'Products' },
      { href: '/dashboard/edit', icon: Palette, label: 'Storefront' },
      { href: '/dashboard/earnings', icon: Coins, label: 'Earnings' },
      { href: '/dashboard/customers', icon: Users, label: 'Customers' },
      { href: '/dashboard/analytics', icon: BarChart, label: 'Analytics' },
      { href: '/dashboard/manager', icon: Bot, label: 'Business Manager' },
    ],
  },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
]

const DASHBOARD_EXPLORE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/library', icon: Library, label: 'Library' },
  { href: '/dashboard/network', icon: Zap, label: 'Network' },
  { href: '/dashboard/communities', icon: Blend, label: 'Spaces' },
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
  const { count: networkCount } = useNetworkActivity()
  const { unreadCount: messagesCount } = useMessageActivity()
  const { user, trialDaysLeft, isTrialing } = useAuth()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const isFreeExpired = (user?.plan?.toLowerCase() === 'free' || !user?.plan) && !isTrialing;

  const currentNavItems = navItems || (isAdmin ? ADMIN_NAV_ITEMS : DASHBOARD_PRIMARY_NAV_ITEMS)
  
  const isItemLocked = (label: string) => {
    if (isAdmin) return false;
    if (!isFreeExpired) return false;
    const lockedLabels = ['Bookings', 'Analytics', 'Business Manager', 'Storefront Templates'];
    return lockedLabels.includes(label);
  };

  const isItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    if (href === '/admin') return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }
  const isNavItemActive = (item: NavItem) => {
    if (isItemActive(item.href)) return true
    return item.subItems?.some((subItem) => isItemActive(subItem.href)) || false
  }

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = { ...current }
      let changed = false

      currentNavItems.forEach((item) => {
        if (!item.subItems?.length) return
        const shouldBeOpen = isNavItemActive(item)
        if (shouldBeOpen && !next[item.label]) {
          next[item.label] = true
          changed = true
        }
      })

      return changed ? next : current
    })
  }, [currentNavItems, pathname])

  return (
    <div className="flex flex-col h-full bg-card">
      <div className={cn(
        "px-2.5 py-2 border-b border-border/50 h-14 flex items-center transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="p-1 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Image src="/images/monster.png" alt="Monster" width={20} height={20} />
            </div>
            <div>
              <h1 className="text-xl font-chunko text-foreground leading-none translate-y-[1px]">PASIVE</h1>
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
            const isActive = isNavItemActive(item)
            const isMessages = item.label === 'Messages'
            const hasUnread = isMessages && messagesCount > 0
            const isExpandable = Boolean(item.subItems?.length)
            const isExpanded = isExpandable && !isCollapsed && Boolean(expandedGroups[item.label])
            const GroupChevron = isExpanded ? ChevronDown : ChevronRight
            const isLocked = isItemLocked(item.label)

            return (
              <div key={item.label} className="space-y-px">
                {isExpandable && !isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedGroups((current) => ({
                        ...current,
                        [item.label]: !current[item.label],
                      }))
                    }}
                    className={cn(
                      "flex w-full items-center rounded-md px-2 py-1.5 text-xs font-medium leading-none transition-all duration-200 relative",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      isLocked && "opacity-60"
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn("mr-1.5 h-3.5 w-3.5 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                    </div>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {isLocked ? (
                      <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                    ) : (
                      <GroupChevron className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                    )}
                  </button>
                ) : (
                  <Link
                    href={isLocked ? "#" : item.href}
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault();
                        setIsUpgradeDialogOpen(true);
                      }
                    }}
                    title={isCollapsed ? item.label : ""}
                    className={cn(
                      "flex items-center text-xs font-medium rounded-md transition-all duration-200 leading-none relative",
                      isCollapsed ? "justify-center h-8 w-8 mx-auto" : "px-2 py-1.5 min-h-8",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      isLocked && "opacity-60"
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", !isCollapsed && "mr-1.5", isActive ? "text-foreground" : "text-muted-foreground")} />
                      {hasUnread && isCollapsed && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                    </div>
                    {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                    {isLocked && !isCollapsed && <Lock className="ml-auto h-3 w-3 text-muted-foreground/50" />}
                    {hasUnread && !isCollapsed && (
                      <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {messagesCount > 9 ? '9+' : messagesCount}
                      </span>
                    )}
                  </Link>
                )}
                {isExpanded ? (
                  <div className="ml-4 space-y-px border-l border-border/60 pl-2">
                    {item.subItems!.map((subItem) => {
                      const SubIcon = subItem.icon
                      const isSubItemActive = isItemActive(subItem.href)
                      const isSubLocked = isItemLocked(subItem.label)

                      return (
                        <Link
                          key={subItem.href}
                          href={isSubLocked ? "#" : subItem.href}
                          onClick={(e) => {
                            if (isSubLocked) {
                              e.preventDefault();
                              setIsUpgradeDialogOpen(true);
                            }
                          }}
                          className={cn(
                            "flex min-h-8 items-center rounded-md px-2 py-1.5 text-xs font-medium leading-none transition-all duration-200",
                            isSubItemActive
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            isSubLocked && "opacity-60"
                          )}
                        >
                          <SubIcon className={cn("mr-1.5 h-3.5 w-3.5 shrink-0", isSubItemActive ? "text-foreground" : "text-muted-foreground")} />
                          <span className="truncate flex-1">{subItem.label}</span>
                          {isSubLocked && <Lock className="ml-auto h-3 w-3 text-muted-foreground/50" />}
                        </Link>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
          {!isAdmin && !navItems && !isCollapsed && (
            <div className="px-2 pt-3 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                Explore
              </p>
            </div>
          )}
          {!isAdmin && !navItems && DASHBOARD_EXPLORE_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(item.href)
            const showBadge = item.label === 'Network' && networkCount > 0
            const isLocked = isItemLocked(item.label)

            return (
              <Link
                key={item.href}
                href={isLocked ? "#" : item.href}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    setIsUpgradeDialogOpen(true);
                  }
                }}
                title={isCollapsed ? item.label : ""}
                className={cn(
                  "flex items-center text-xs font-medium rounded-md transition-all duration-200 leading-none relative group/nav",
                  isCollapsed ? "justify-center h-8 w-8 mx-auto" : "px-2 py-1.5 min-h-8",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  isLocked && "opacity-60"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", !isCollapsed && "mr-1.5", isActive ? "text-foreground" : "text-muted-foreground")} />
                  {showBadge && isCollapsed && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </div>
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {isLocked && !isCollapsed && <Lock className="ml-auto h-3 w-3 text-muted-foreground/50" />}
                {showBadge && !isCollapsed && (
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {networkCount > 9 ? '9+' : networkCount}
                  </span>
                )}
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
        {!isAdmin && (
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size={isCollapsed ? "icon" : "sm"}
              onClick={() => setIsUpgradeDialogOpen(true)}
              className={cn(
                "w-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300",
                isCollapsed ? "mx-auto h-8 w-8" : "rounded-md px-2 py-1.5 text-xs font-semibold"
              )}
              title={isCollapsed ? "Upgrade" : undefined}
            >
              <span className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "justify-between")}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  {!isCollapsed && <span className="truncate">Upgrade</span>}
                </div>
                {!isCollapsed && (user?.plan?.toLowerCase() === 'free' || !user?.plan) && isTrialing && (
                  <span className="text-[9px] bg-primary/10 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                    {trialDaysLeft} days left
                  </span>
                )}
              </span>
            </Button>
          </div>
        )}
      </div>

      <div className={cn(
        "p-2 border-t border-border/50",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <UserMenu isCollapsed={isCollapsed} />
      </div>

      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="w-[96vw] max-w-6xl max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
          <div className="shrink-0 p-4 sm:p-6 border-b">
            <DialogHeader className="pr-8">
              <DialogTitle>Upgrade your plan</DialogTitle>
              <DialogDescription>
                Pick the plan that fits your business and unlock more tools as you grow.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
            <PricingPlans
              currentPlan={user?.plan?.toLowerCase() ?? 'free'}
              embedded
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
