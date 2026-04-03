'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, BarChart, Blend, ChevronRight, Coins, Compass, LifeBuoy, LogOut, Package, Palette, Save, ShoppingBag, Zap } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { getUser } from '@/services/userService'
import { getDisplayAvatar } from '@/lib/avatar'
import { LucideIcon } from 'lucide-react'
import Image from 'next/image'
import NotificationsDialog from './NotificationsDialog'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/dashboard/edit': 'My Profile',
  '/dashboard/earnings': 'Earnings',
  '/dashboard/purchases': 'Purchases',
  '/dashboard/products': 'Products',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
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
  { href: '/dashboard/purchases', label: 'Purchases', icon: ShoppingBag },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/edit', label: 'Edit Page', icon: Palette },
  { href: '/dashboard/network', label: 'Network', icon: Zap },
  { href: '/dashboard/communities', label: 'Communities', icon: Blend },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
]

export default function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('Creator')
  const [profileHandle, setProfileHandle] = useState<string>('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return
      try {
        const profile = await getUser(user.uid)
        setProfilePicture(getDisplayAvatar({ image: profile?.profilePicture || user.photoURL || '', displayName: profile?.displayName || user.displayName || 'Creator', handle: profile?.username || user.email || 'creator' }))
        setDisplayName(profile?.displayName || user.displayName || 'Creator')
        setProfileHandle((profile?.username || profile?.slug || user.email?.split('@')[0] || 'creator').replace(/^@/, '').trim())
      } catch (error) {
        console.error('Error loading user profile for header:', error)
      }
    }

    void loadProfile()
  }, [user])

  const currentTitle = useMemo(() => {
    if (pageTitles[pathname]) return pageTitles[pathname]
    if (pathname.startsWith('/dashboard/earnings/')) return 'Earnings Details'
    if (pathname.startsWith('/dashboard/purchases/')) return 'Order Details'
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

  const publicProfileHref = profileHandle ? `/${profileHandle}` : ''
  const publicProfileLabel = profileHandle ? `pasive.co/${profileHandle}` : ''

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

          <NotificationsDialog audience="creator" viewAllHref="/dashboard/notifications" />

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
                <div className="pt-6 px-4 pb-4">
                  <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                    <div className="rounded-lg bg-primary/10 p-1.5 shadow-sm">
                      <Image src="/images/monster.png" alt="Pasive" width={20} height={20} />
                    </div>
                    <span className="text-base font-black tracking-tighter leading-none">pasive</span>
                  </Link>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-muted/10 border-y">
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
                  <div className="flex-1 space-y-0.5 overflow-y-auto pt-3 px-2">
                    {quickLinks.map((item) => (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className="w-full justify-start gap-3 h-10 px-3 hover:bg-muted/40 transition-colors"
                        onClick={() => handleNavigate(item.href)}
                      >
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-[13px] text-left font-semibold">{item.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                      </Button>
                    ))}
                  </div>
 
                  <div className="mt-auto border-t p-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-10 px-3 hover:bg-muted/40 transition-colors"
                      onClick={() => handleNavigate('/dashboard/help')}
                    >
                      <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-[13px] text-left font-semibold">Help & Support</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                    </Button>
                    <div className="h-[1px] bg-border/50 my-1 mx-2" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-10 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="flex-1 text-[13px] text-left font-bold">Logout</span>
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
