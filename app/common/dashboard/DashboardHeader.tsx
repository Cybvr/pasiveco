'use client'

import Link from 'next/link'
import { ComponentType, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from '@/i18n/routing'
import { ArrowLeft, BarChart, Blend, CalendarDays, ChevronDown, ChevronRight, Coins, Home, LifeBuoy, LogOut, MessageSquare, Package, Palette, Save, ShoppingBag, Users, Zap, Bot, LucideIcon, Lock } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { getUser } from '@/services/userService'
import { getDisplayAvatar } from '@/lib/avatar'
import NotificationsDialog from './NotificationsDialog'
import UpgradeCta from './UpgradeCta'
import { cn } from '@/lib/utils'
import { useMessageActivity } from '@/hooks/useMessageActivity'
import { useNetworkActivity } from '@/hooks/useNetworkActivity'
import { CurrencySelector } from '@/components/currency-selector'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/dashboard/edit': 'Storefront',
  '/dashboard/earnings': 'Earnings',
  '/dashboard/bookings': 'Bookings',
  '/dashboard/library': 'Library',
  '/dashboard/products': 'Products',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/manager': 'Business Manager',
  '/dashboard/settings': 'Settings',
  '/dashboard/help': 'Help & Support',
  '/dashboard/messages': 'Messages',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/posts/new': 'New Post',
  '/dashboard/communities': 'Spaces',
  '/dashboard/communities/create': 'Create Space',
  '/dashboard/wallet/gifts': 'Gifts',
  '/admin': 'Admin Console',
  '/admin/users': 'Manage Users',
  '/admin/content': 'Content Management',
}

interface QuickLink {
  href: string
  label: string
  icon?: LucideIcon
  iconEmoji?: string
  subItems?: QuickLink[]
}

const primaryLinks: QuickLink[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/bookings', label: 'Bookings', icon: CalendarDays },
  {
    href: '/dashboard/products',
    label: 'Store',
    icon: ShoppingBag,
    subItems: [
      { href: '/dashboard/products', label: 'Products', icon: Package },
      { href: '/dashboard/edit', label: 'Storefront', icon: Palette },
      { href: '/dashboard/earnings', label: 'Earnings', icon: Coins },
      { href: '/dashboard/customers', label: 'Customers', icon: Users },
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
      { href: '/dashboard/manager', label: 'Business Manager', icon: Bot },
    ],
  },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
]

const exploreLinks: QuickLink[] = [
  { href: '/dashboard/library', label: 'Library', icon: Package },
  { href: '/dashboard/network', label: 'Network', icon: Zap },
  { href: '/dashboard/communities', label: 'Spaces', icon: Blend },
  { href: '/dashboard/wallet/gifts', label: 'Gifts', iconEmoji: '❤️' },
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
      <span aria-hidden="true" className={cn("inline-flex shrink-0 items-center justify-center text-base leading-none", className)}>
        {iconEmoji}
      </span>
    )
  }

  if (!Icon) return null
  return <Icon className={className} />
}

export default function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { unreadCount: messagesCount } = useMessageActivity()
  const { count: networkCount } = useNetworkActivity()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('Creator')
  const [profileHandle, setProfileHandle] = useState<string>('')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return
      try {
        const profile = await getUser(user.uid)
        setProfilePicture(getDisplayAvatar({ image: profile?.profilePicture || user.photoURL || '', displayName: profile?.displayName || user.displayName || 'Creator', handle: profile?.username || user.email || 'creator' }))
        setDisplayName(profile?.displayName || user.displayName || 'Creator')
        setProfileHandle((profile?.username || user.email?.split('@')[0] || 'creator').replace(/^@/, '').trim())
      } catch (error) {
        console.error('Error loading user profile for header:', error)
      }
    }

    void loadProfile()
  }, [user])

  const currentTitle = useMemo(() => {
    if (pageTitles[pathname]) return pageTitles[pathname]
    if (pathname.startsWith('/dashboard/earnings/')) return 'Earnings Details'
    if (pathname.startsWith('/dashboard/library/')) return 'Order Details'
    if (pathname.startsWith('/dashboard/products/')) return ''
    if (pathname.startsWith('/dashboard/settings')) return 'Settings'
    if (pathname.startsWith('/dashboard/help')) return 'Help & Support'
    if (pathname.startsWith('/dashboard/posts/')) return 'Post'
    if (pathname.startsWith('/dashboard/communities/')) {
      if (pathname === '/dashboard/communities/create') return 'Create Space'
      return 'Space Details'
    }

    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1] || 'dashboard'
    return last
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }, [pathname])

  const publicProfileHref = profileHandle ? `/${profileHandle}` : ''
  const publicProfileLabel = profileHandle ? `pasive.co/${profileHandle}` : ''

  const isItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const isNavItemActive = (item: QuickLink) => {
    if (isItemActive(item.href)) return true
    return item.subItems?.some((subItem) => isItemActive(subItem.href)) || false
  }

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = { ...current }
      let changed = false

      primaryLinks.forEach((item) => {
        if (!item.subItems?.length) return
        const shouldBeOpen = isNavItemActive(item)
        if (shouldBeOpen && !next[item.label]) {
          next[item.label] = true
          changed = true
        }
      })

      return changed ? next : current
    })
  }, [pathname])

  const handleNavigate = (href: string) => {
    setIsSheetOpen(false)
    router.push(href)
  }

  const { isTrialing, trialDaysLeft } = useAuth()
  const isFreePlan = (user?.plan?.toLowerCase() === 'free' || !user?.plan);
  const isFreeExpired = isFreePlan && !isTrialing;
  const PREMIUM_LABELS = ['Bookings', 'Analytics', 'Business Manager', 'Storefront Templates'];

  const shouldShowLock = (label: string) => {
    return isFreePlan && PREMIUM_LABELS.includes(label);
  };

  const isAccessDenied = (label: string) => {
    return isFreeExpired && PREMIUM_LABELS.includes(label);
  };

  const showBackButton = pathname === '/dashboard/posts/new' ||
    pathname.startsWith('/dashboard/products/') ||
    (pathname.startsWith('/dashboard/communities/') && pathname !== '/dashboard/communities')
  const showSaveButton = pathname === '/dashboard/edit'
  const isProductDetailPage = pathname.startsWith('/dashboard/products/')

  const handleSaveEditProfile = () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('dashboard:save-edit-profile'))
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {showBackButton ? (
            <Button
              type="button"
              variant="ghost"
              size={isProductDetailPage ? 'sm' : 'icon'}
              className={isProductDetailPage ? 'h-9 shrink-0 gap-2 px-2' : 'h-9 w-9 shrink-0'}
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
              {isProductDetailPage ? <span>Back</span> : null}
            </Button>
          ) : null}
          {currentTitle ? <h1 className="truncate text-base font-semibold tracking-tight">{currentTitle}</h1> : null}
        </div>

        <div className="flex items-center gap-2">
          {publicProfileHref ? (
            <Link
              href={publicProfileHref}
              target="_blank"
              rel="noreferrer"
              className="max-w-[140px] truncate text-xs font-medium text-primary hover:underline"
            >
              {publicProfileLabel}
            </Link>
          ) : null}

          {/* Currency switcher – visible on desktop only */}
          <CurrencySelector className="hidden md:flex h-8 w-[100px]" />

          <NotificationsDialog viewAllHref="/dashboard/notifications" />

          {showSaveButton ? (
            <Button type="button" size="sm" className="gap-2" onClick={handleSaveEditProfile}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          ) : (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button type="button" aria-label="Open profile menu" className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={profilePicture} alt={displayName} />
                    <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[75%] max-w-[280px] p-0 flex flex-col gap-0 border-r">
                <SheetHeader className="sr-only">
                  <SheetTitle>Dashboard Navigation</SheetTitle>
                </SheetHeader>
                <div className="pt-6 px-4 pb-4 border-b border-border/60">
                  <div className="flex items-center justify-between gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2 min-w-0 group" onClick={() => setIsSheetOpen(false)}>
                      <div className="rounded-lg bg-primary/10 p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-110">
                        <img src="/images/logo.svg" alt="Pasive" className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-chunko leading-none text-foreground translate-y-[1px]">PASIVE</span>
                    </Link>
                    <CurrencySelector className="h-9 w-[100px] shrink-0 rounded-md" />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/10 border-b">
                  <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                    <AvatarImage src={profilePicture} alt={displayName} />
                    <AvatarFallback className="bg-primary/5 text-primary text-sm font-medium">{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold truncate text-foreground leading-none mb-0.5">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground/90 truncate leading-tight font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="flex-1 space-y-0 overflow-y-auto pt-2 px-2">
                    {primaryLinks.map((item) => {
                      const isActive = isNavItemActive(item)
                      const isExpandable = Boolean(item.subItems?.length)
                      const isExpanded = isExpandable && Boolean(expandedGroups[item.label])
                      const ChevronIcon = isExpanded ? ChevronDown : ChevronRight
                      const locked = shouldShowLock(item.label)
                      const denied = isAccessDenied(item.label)

                      if (isExpandable) {
                        return (
                          <div key={item.href} className="space-y-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              className={cn(
                                "w-full justify-start gap-2.5 h-9 px-2.5 transition-colors",
                                isActive ? "bg-muted/70 text-foreground hover:bg-muted/70" : "hover:bg-muted/40",
                                denied && "opacity-60"
                              )}
                              onClick={() => {
                                setExpandedGroups((current) => ({
                                  ...current,
                                  [item.label]: !current[item.label],
                                }))
                              }}
                            >
                              <NavGlyph
                                icon={item.icon}
                                iconEmoji={item.iconEmoji}
                                className={cn("h-4 w-4", isActive ? "text-foreground" : "text-muted-foreground")}
                              />
                              <span className="flex-1 text-[12px] text-left font-semibold">{item.label}</span>
                              {locked ? (
                                <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                              ) : (
                                <ChevronIcon className={cn("h-3.5 w-3.5", isActive ? "text-foreground/70" : "text-muted-foreground/40")} />
                              )}
                            </Button>
                            {isExpanded ? (
                              <div className="ml-4 space-y-0.5 border-l border-border/60 pl-3">
                                {item.subItems?.map((subItem) => {
                                  const isSubItemActive = isItemActive(subItem.href)
                                  const subLocked = shouldShowLock(subItem.label)
                                  const subDenied = isAccessDenied(subItem.label)

                                  return (
                                    <Button
                                      key={subItem.href}
                                      type="button"
                                      variant="ghost"
                                      className={cn(
                                        "w-full justify-start gap-2.5 h-8.5 px-2.5 transition-colors",
                                        isSubItemActive ? "bg-muted/70 text-foreground hover:bg-muted/70" : "hover:bg-muted/40",
                                        subDenied && "opacity-60"
                                      )}
                                      onClick={() => {
                                        if (subDenied) {
                                          setIsSheetOpen(false)
                                          // Note: UpgradeCta handles the dialog, but here we are in mobile sheet
                                          // We should probably trigger the upgrade dialog.
                                          // I will trigger a custom event or just let it stay for now.
                                        } else {
                                          handleNavigate(subItem.href)
                                        }
                                      }}
                                    >
                                      <NavGlyph
                                        icon={subItem.icon}
                                        iconEmoji={subItem.iconEmoji}
                                        className={cn("h-4 w-4", isSubItemActive ? "text-foreground" : "text-muted-foreground")}
                                      />
                                      <span className="flex-1 text-[12px] text-left font-medium">{subItem.label}</span>
                                      {subLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />}
                                    </Button>
                                  )
                                })}
                              </div>
                            ) : null}
                          </div>
                        )
                      }

                      const showMessagesBadge = item.href === '/dashboard/messages' && messagesCount > 0

                      return (
                        <Button
                          key={item.href}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2.5 h-9 px-2.5 transition-colors",
                            isActive ? "bg-muted/70 text-foreground hover:bg-muted/70" : "hover:bg-muted/40",
                            denied && "opacity-60"
                          )}
                          onClick={() => {
                            if (denied) {
                              setIsSheetOpen(false)
                            } else {
                              handleNavigate(item.href)
                            }
                          }}
                        >
                          <div className="relative">
                            <NavGlyph
                              icon={item.icon}
                              iconEmoji={item.iconEmoji}
                              className={cn("h-4 w-4", isActive ? "text-foreground" : "text-muted-foreground")}
                            />
                            {showMessagesBadge ? (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                              </span>
                            ) : null}
                          </div>
                          <span className="flex-1 text-[12px] text-left font-semibold">{item.label}</span>
                          {locked ? (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                          ) : showMessagesBadge ? (
                            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                              {messagesCount > 9 ? '9+' : messagesCount}
                            </span>
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                          )}
                        </Button>
                      )
                    })}
                    <div className="px-2.5 py-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                        Explore
                      </p>
                    </div>
                    {exploreLinks.map((item) => {
                      const isActive = isItemActive(item.href)
                      const showNetworkBadge = item.href === '/dashboard/network' && networkCount > 0
                      const locked = shouldShowLock(item.label)
                      const denied = isAccessDenied(item.label)

                      return (
                        <Button
                          key={item.href}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2.5 h-9 px-2.5 transition-colors",
                            isActive ? "bg-muted/70 text-foreground hover:bg-muted/70" : "hover:bg-muted/40",
                            denied && "opacity-60"
                          )}
                          onClick={() => {
                            if (denied) {
                              setIsSheetOpen(false)
                            } else {
                              handleNavigate(item.href)
                            }
                          }}
                        >
                          <div className="relative">
                            <NavGlyph
                              icon={item.icon}
                              iconEmoji={item.iconEmoji}
                              className={cn("h-4 w-4", isActive ? "text-foreground" : "text-muted-foreground")}
                            />
                            {showNetworkBadge ? (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                              </span>
                            ) : null}
                          </div>
                          <span className="flex-1 text-[12px] text-left font-semibold">{item.label}</span>
                          {locked ? (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                          ) : showNetworkBadge ? (
                            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                              {networkCount > 9 ? '9+' : networkCount}
                            </span>
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                          )}
                        </Button>
                      )
                    })}
                  </div>
                  <div className="border-t px-2 ">
                    <UpgradeCta className="h-9 rounded-lg px-3 text-[12px]" />
                  </div>

                  <div className="mt-auto border-t ">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2.5 h-9 px-2.5 hover:bg-muted/40 transition-colors"
                      onClick={() => handleNavigate('/dashboard/help')}
                    >
                      <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-[12px] text-left font-semibold">Help & Support</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                    </Button>
                    <div className="h-[1px] bg-border/50  mx-2" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2.5 h-9 px-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="flex-1 text-[12px] text-left font-bold">Logout</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-20" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
