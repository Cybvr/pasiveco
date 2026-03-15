
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
import { User, Settings, LogOut, CreditCard, Shield } from 'lucide-react'
import { getUserProfile, type UserProfile } from '@/services/userProfilesService'
import { useEffect } from 'react'

export default function UserMenu({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { user } = useAuth()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const fetchedProfile = await getUserProfile(user.uid)
          setProfile(fetchedProfile)
        } catch (error) {
          console.error('Error fetching profile for UserMenu:', error)
        }
      }
    }
    fetchProfile()
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
              <AvatarImage src={profile?.profilePicture || user.photoURL || ''} alt={displayName} />
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
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings/plans')}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Plans</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ThemeToggle />
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowLogoutDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
