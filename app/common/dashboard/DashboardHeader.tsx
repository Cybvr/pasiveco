'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Bell, ChevronRight, Coins, MessageSquare, UserCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile } from '@/services/userProfilesService'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/dashboard/edit': 'My Profile',
  '/dashboard/products': 'Products',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/dashboard/messages': 'Messages',
  '/dashboard/notifications': 'Notifications',
}

const quickLinks = [
  { href: '/dashboard/settings/earnings', label: 'Earnings', icon: Coins },
  { href: '/dashboard/edit', label: 'My Profile', icon: UserCircle2 },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
]

export default function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [profilePicture, setProfilePicture] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('Creator')

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return
      try {
        const profile = await getUserProfile(user.uid)
        setProfilePicture(profile?.profilePicture || user.photoURL || '')
        setDisplayName(profile?.displayName || user.displayName || 'Creator')
      } catch (error) {
        console.error('Error loading user profile for header:', error)
      }
    }

    loadProfile()
  }, [user])

  const currentTitle = useMemo(() => {
    if (pageTitles[pathname]) return pageTitles[pathname]
    if (pathname.startsWith('/dashboard/settings')) return 'Settings'

    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1] || 'dashboard'
    return last
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 md:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <button type="button" aria-label="Open profile menu" className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={profilePicture} alt={displayName} />
                <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] max-w-sm">
            <SheetHeader>
              <SheetTitle>Account</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {quickLinks.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-base font-semibold tracking-tight">{currentTitle}</h1>
      </div>
    </header>
  )
}
