'use client'
import Link from 'next/link'
import { ComponentType, useEffect, useState } from 'react'
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
  CloudSun,
  CalendarDays,
  Mail,
  Lock,
  MessageCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import UserMenu from './user-menu'
import UpgradeCta from './UpgradeCta'
import { useNetworkActivity } from '@/hooks/useNetworkActivity'
import { useMessageActivity } from '@/hooks/useMessageActivity'
import { useAuth } from '@/hooks/useAuth'


interface NavItem {
  href: string
  icon?: LucideIcon
  iconEmoji?: string
  label: string
  isNew?: boolean
  subItems?: NavItem[]
}

const DASHBOARD_PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Home' },
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
  { href: '/dashboard/messages', icon: Mail, label: 'Messages' },
  { href: '/dashboard/bookings', icon: CalendarDays, label: 'Bookings', isNew: true },
  { href: '/dashboard/email', icon: CloudSun, label: 'Emails' },
]

const DASHBOARD_EXPLORE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/library', icon: Library, label: 'Library' },
  { href: '/dashboard/network', icon: CloudSun, label: 'Network' },
  { href: '/dashboard/communities', icon: Blend, label: 'Spaces', isNew: true },
  { href: '/dashboard/wallet/gifts', iconEmoji: '❤️', label: 'Gifts' },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: '/admin', icon: Home, label: 'Admin' },
  { href: '/dashboard', icon: QrCode, label: 'Home' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/content', icon: FileText, label: 'Content' },
  { href: '/admin/email', icon: Mail, label: 'Emails' },
  { href: '/admin/whatsapp', icon: MessageCircle, label: 'WhatsApp' },

]

const DEFAULT_BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/help', icon: LifeBuoy, label: 'Help & Support' },
]

function NavGlyph({
  icon: Icon,
  iconEmoji,
  className,
}: {
  icon?: ComponentType<{ className?: string }>
  iconEmoji?: string
  className?: string
}) {
  if (iconEmoji) {
    return (
      <span aria-hidden="true" className={cn("inline-flex shrink-0 items-center justify-center text-sm leading-none", className)}>
        {iconEmoji}
      </span>
    )
  }

  if (!Icon) return null
  return <Icon className={className} />
}

export default function Sidebar({
  isCollapsed,
  onToggle,
  navItems,
  bottomNavItems = DEFAULT_BOTTOM_NAV_ITEMS,
  onNavigate,
}: {
  isCollapsed: boolean,
  onToggle: () => void,
  navItems?: NavItem[],
  bottomNavItems?: NavItem[],
  onNavigate?: () => void,
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const { count: networkCount } = useNetworkActivity()
  const { unreadCount: messagesCount } = useMessageActivity()
  const { user, isTrialing } = useAuth()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const isFreePlan = (user?.plan?.toLowerCase() === 'free' || !user?.plan);
  const isFreeExpired = isFreePlan && !isTrialing;

  const currentNavItems = navItems || (isAdmin ? ADMIN_NAV_ITEMS : DASHBOARD_PRIMARY_NAV_ITEMS)

  const PREMIUM_LABELS = ['Bookings', 'Analytics', 'Business Manager', 'Storefront Templates'];

  const shouldShowLock = (label: string) => {
    if (isAdmin) return false;
    return isFreePlan && PREMIUM_LABELS.includes(label);
  };

  const isAccessDenied = (label: string) => {
    if (isAdmin) return false;
    return isFreeExpired && PREMIUM_LABELS.includes(label);
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
          <Link href="/dashboard" className="flex items-center space-x-2 group" onClick={() => onNavigate?.()}>
            <div className=" rounded-lg group-hover:scale-110 transition-transform duration-200">
              <img src="/images/logo.svg" alt="Pasive" className="h-5 w-5" />
            </div>
            <div className="space-y-0">
              <h1 className="text-xl font-chunko pt-1 text-foreground leading-none ">PASIVE</h1>
              {isAdmin && <p className="text-[10px] leading-none text-muted-foreground font-medium uppercase tracking-wider">
                Admin
              </p>}
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
            const isActive = isNavItemActive(item)
            const isMessages = item.label === 'Messages'
            const hasUnread = isMessages && messagesCount > 0
            const isExpandable = Boolean(item.subItems?.length)
            const isExpanded = isExpandable && !isCollapsed && Boolean(expandedGroups[item.label])
            const GroupChevron = isExpanded ? ChevronDown : ChevronRight
            const locked = shouldShowLock(item.label)
            const denined = isAccessDenied(item.label)

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
                      denined && "opacity-60"
                    )}
                  >
                    <div className="relative">
                      <NavGlyph
                        icon={item.icon}
                        iconEmoji={item.iconEmoji}
                        className={cn("mr-1.5 h-3.5 w-3.5 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")}
                      />
                    </div>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {locked ? (
                      <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                    ) : (
                      <GroupChevron className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                    )}
                  </button>
                ) : (
                  <Link
                    href={denined ? "#" : item.href}
                    onClick={(e) => {
                      if (denined) {
                        e.preventDefault();
                        setIsUpgradeDialogOpen(true);
                        return;
                      }
                      onNavigate?.();
                    }}
                    title={isCollapsed ? item.label : ""}
                    className={cn(
                      "flex items-center text-xs font-medium rounded-md transition-all duration-200 leading-none relative",
                      isCollapsed ? "justify-center h-8 w-8 mx-auto" : "px-2 py-1.5 min-h-8",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      denined && "opacity-60"
                    )}
                  >
                    <div className="relative">
                      <NavGlyph
                        icon={item.icon}
                        iconEmoji={item.iconEmoji}
                        className={cn("h-3.5 w-3.5 shrink-0", !isCollapsed && "mr-1.5", isActive ? "text-foreground" : "text-muted-foreground")}
                      />
                      {hasUnread && isCollapsed && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                      {item.isNew && isCollapsed && !hasUnread && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
                      )}
                    </div>
                    {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                    {item.isNew && !isCollapsed && !hasUnread && (
                      <span className="ml-auto rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                        New
                      </span>
                    )}
                    {locked && !isCollapsed && <Lock className={cn("h-3 w-3 text-muted-foreground/50", item.isNew ? "ml-1" : "ml-auto")} />}
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
                      const isSubItemActive = isItemActive(subItem.href)
                      const subLocked = shouldShowLock(subItem.label)
                      const subDenied = isAccessDenied(subItem.label)

                      return (
                        <Link
                          key={subItem.href}
                          href={subDenied ? "#" : subItem.href}
                          onClick={(e) => {
                            if (subDenied) {
                              e.preventDefault();
                              setIsUpgradeDialogOpen(true);
                              return;
                            }
                            onNavigate?.();
                          }}
                          className={cn(
                            "flex min-h-8 items-center rounded-md px-2 py-1.5 text-xs font-medium leading-none transition-all duration-200",
                            isSubItemActive
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            subDenied && "opacity-60"
                          )}
                        >
                          <NavGlyph
                            icon={subItem.icon}
                            iconEmoji={subItem.iconEmoji}
                            className={cn("mr-1.5 h-3.5 w-3.5 shrink-0", isSubItemActive ? "text-foreground" : "text-muted-foreground")}
                          />
                          <span className="truncate flex-1">{subItem.label}</span>
                          {subLocked && <Lock className="ml-auto h-3 w-3 text-muted-foreground/50" />}
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
            const isActive = isItemActive(item.href)
            const showBadge = item.label === 'Network' && networkCount > 0
            const locked = shouldShowLock(item.label)
            const denined = isAccessDenied(item.label)

            return (
              <Link
                key={item.href}
                href={denined ? "#" : item.href}
                onClick={(e) => {
                  if (denined) {
                    e.preventDefault();
                    setIsUpgradeDialogOpen(true);
                    return;
                  }
                  onNavigate?.();
                }}
                title={isCollapsed ? item.label : ""}
                className={cn(
                  "flex items-center text-xs font-medium rounded-md transition-all duration-200 leading-none relative group/nav",
                  isCollapsed ? "justify-center h-8 w-8 mx-auto" : "px-2 py-1.5 min-h-8",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  denined && "opacity-60"
                )}
              >
                <div className="relative">
                  <NavGlyph
                    icon={item.icon}
                    iconEmoji={item.iconEmoji}
                    className={cn("h-3.5 w-3.5 shrink-0", !isCollapsed && "mr-1.5", isActive ? "text-foreground" : "text-muted-foreground")}
                  />
                  {showBadge && isCollapsed && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                  {item.isNew && isCollapsed && !showBadge && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
                  )}
                </div>
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {item.isNew && !isCollapsed && !showBadge && (
                  <span className="ml-auto rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                    New
                  </span>
                )}
                {locked && !isCollapsed && <Lock className={cn("h-3 w-3 text-muted-foreground/50", item.isNew ? "ml-1" : "ml-auto")} />}
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
            const isActive = isItemActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onNavigate?.()}
                title={isCollapsed ? item.label : ""}
                className={cn(
                  "flex items-center text-xs font-medium rounded-md transition-all duration-200 leading-none",
                  isCollapsed ? "justify-center h-8 w-8 mx-auto" : "px-2 py-1.5 min-h-8",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <NavGlyph
                  icon={item.icon}
                  iconEmoji={item.iconEmoji}
                  className={cn("h-3.5 w-3.5 shrink-0", !isCollapsed && "mr-1.5", isActive ? "text-foreground" : "text-muted-foreground")}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        {!isAdmin && (
          <div className="pt-2">
            <UpgradeCta
              isCollapsed={isCollapsed}
              open={isUpgradeDialogOpen}
              onOpenChange={setIsUpgradeDialogOpen}
            />
          </div>
        )}
      </div>

      <div className={cn(
        "p-2 border-t border-border/50",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <UserMenu isCollapsed={isCollapsed} adminOpensInNewTab />
      </div>
    </div>
  )
}
