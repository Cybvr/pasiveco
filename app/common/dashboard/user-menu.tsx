
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ThemeToggle,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User as UserIcon, Settings, LogOut, Shield, Languages, Check } from 'lucide-react'
import { getUser, type User as AppUser } from '@/services/userService'
import { getDisplayAvatar } from '@/lib/avatar'
import { useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { routing, usePathname, useRouter } from '@/i18n/routing'
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

export default function UserMenu({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const t = useTranslations('UserMenu')
  const locale = useLocale()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [profile, setProfile] = useState<AppUser | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const fetchedProfile = await getUser(user.uid)
          setProfile(fetchedProfile)
        } catch (error) {
          console.error('Error fetching profile for UserMenu:', error)
        }
      }
    }
    fetchProfile()

    // Listen for updates from the edit page
    window.addEventListener('user-profile-updated', fetchProfile)
    return () => window.removeEventListener('user-profile-updated', fetchProfile)
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) return null

  const displayName = profile?.displayName || user.displayName || 'User'
  const handle = profile?.username ? `@${profile.username}` : user.email
  const canAccessAdmin = profile?.isAdmin || profile?.role === 'admin'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "relative flex items-center gap-3 transition-all duration-300 hover:bg-accent group",
              isCollapsed ? "h-10 w-10 p-0 justify-center rounded-xl" : "w-full justify-start p-2 rounded-xl"
            )}
          >
            <Avatar className={cn(
              "transition-all duration-300",
              isCollapsed ? "h-10 w-10 rounded-xl" : "h-9 w-9 rounded-lg"
            )}>
              <AvatarImage src={getDisplayAvatar({ 
                image: profile?.profilePicture || user.photoURL || null, 
                displayName, 
                handle: profile?.username || user.email || displayName 
              })} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="text-sm font-semibold truncate w-full">{displayName}</span>
                <span className="text-xs text-muted-foreground truncate w-full font-mono">{handle}</span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56" 
          align={isCollapsed ? "center" : "start"} 
          side={isCollapsed ? "right" : "bottom"} 
          sideOffset={isCollapsed ? 15 : 4} 
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground font-mono">
                {handle}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings/account')}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>{t('profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('settings')}</span>
          </DropdownMenuItem>
          {canAccessAdmin && (
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>{t('admin')}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages className="mr-2 h-4 w-4" />
              <span>{t('language')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {routing.locales.map((loc) => (
                <DropdownMenuItem 
                  key={loc} 
                  onClick={() => router.replace(pathname, { locale: loc })}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-xs uppercase text-muted-foreground w-4">{loc}</span>
                    <span>{t(loc === 'en' ? 'english' : 'french')}</span>
                  </span>
                  {locale === loc && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <ThemeToggle />
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowLogoutDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logoutConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('logoutDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              {t('logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
