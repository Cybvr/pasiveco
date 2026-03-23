'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, BarChart, Bell, ChevronRight, Coins, Compass, LifeBuoy, Package, Palette, Save, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { getUser } from '@/services/userService'
import { getDisplayAvatar } from '@/lib/avatar'
import { LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import NotificationsList, { DASHBOARD_NOTIFICATIONS } from './NotificationsList'
import { ScrollArea } from '@/components/ui/scroll-area'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/dashboard/edit': 'My Profile',
  '/dashboard/earnings': 'Earnings',
  '/dashboard/products': 'Products',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/dashboard/discovery': 'Discovery',
  '/dashboard/help': 'Help & Support',
  '/dashboard/messages': 'Messages',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/posts/new': 'New Post',
  '/dashboard/communities': 'Communities',
  '/dashboard/communities/create': 'Create Community',
  '/admin': 'Admin Console',
  '/admin/users': 'Manage Users',
  '/admin/content': 'Content Management',
}

interface QuickLink {
  href: string
  label: string
  icon: LucideIcon
}

const quickLinks: QuickLink[] = [
  { href: '/dashboard/earnings', label: 'Earnings', icon: Coins },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/edit', label: 'Edit Page', icon: Palette },
  { href: '/dashboard/discovery', label: 'Discover', icon: Compass },
  { href: '/dashboard/communities', label: 'Communities', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
]

export default function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('Creator')
  const unreadNotifications = DASHBOARD_NOTIFICATIONS.filter((item) => item.status === 'new').length

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return
      try {
        const profile = await getUser(user.uid)
        setProfilePicture(getDisplayAvatar({ image: profile?.profilePicture || user.photoURL || '', displayName: profile?.displayName || user.displayName || 'Creator', handle: profile?.username || user.email || 'creator' }))
        setDisplayName(profile?.displayName || user.displayName || 'Creator')
      } catch (error) {
        console.error('Error loading user profile for header:', error)
      }
    }

    void loadProfile()
  }, [user])

  const currentTitle = useMemo(() => {
    if (pageTitles[pathname]) return pageTitles[pathname]
    if (pathname.startsWith('/dashboard/earnings/')) return 'Earnings Details'
    if (pathname.startsWith('/dashboard/settings')) return 'Settings'
    if (pathname.startsWith('/dashboard/help')) return 'Help & Support'
    if (pathname.startsWith('/dashboard/posts/')) return 'Post'
    if (pathname.startsWith('/dashboard/communities/')) {
        if (pathname === '/dashboard/communities/create') return 'Create Community'
        return 'Community Details'
    }

    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1] || 'dashboard'
    return last
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }, [pathname])

  const handleNavigate = (href: string) => {
    setIsSheetOpen(false)
    router.push(href)
  }

  const showBackButton = pathname === '/dashboard/posts/new' || 
                         pathname === '/dashboard/edit' || 
                         (pathname.startsWith('/dashboard/communities/') && pathname !== '/dashboard/communities')
  const showSaveButton = pathname === '/dashboard/edit'

  const handleSaveEditProfile = () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('dashboard:save-edit-profile'))
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {showBackButton ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : null}
          <h1 className="truncate text-base font-semibold tracking-tight">{currentTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" aria-label="Open notifications">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 ? (
                  <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                ) : null}
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden flex max-h-[min(85vh,540px)] flex-col gap-0 p-0 sm:max-w-[400px]">
              <DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3 pr-10 space-y-0">
                <DialogTitle className="text-sm font-semibold text-foreground/90">Notifications</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1">
                <NotificationsList />
              </ScrollArea>
              <div className="flex items-center gap-2 border-t p-2 bg-muted/20">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 h-9 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setIsNotificationsOpen(false)
                    router.push('/dashboard/notifications')
                  }}
                >
                  View all
                </Button>
                {unreadNotifications > 0 && (
                  <>
                    <div className="h-4 w-[1px] bg-border/60" />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-1 h-9 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5"
                    >
                      Mark all read
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

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
              <SheetContent side="left" className="w-[72%] max-w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                      <div className="rounded-lg bg-primary/10 p-1">
                        <Image src="/images/monster.png" alt="Pasive" width={20} height={20} />
                      </div>
                      <span className="text-base font-black tracking-tighter leading-none">pasive</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex h-full flex-col">
                  <div className="space-y-2">
                    {quickLinks.map((item) => (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        onClick={() => handleNavigate(item.href)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    ))}
                  </div>

                  <div className="mt-auto border-t pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => handleNavigate('/dashboard/help')}
                    >
                      <LifeBuoy className="h-4 w-4" />
                      <span className="flex-1 text-left">Help & Support</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
