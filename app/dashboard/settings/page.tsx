'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, CreditCard, ArrowUpRight, ChevronRight, ShieldCheck, Palette, HelpCircle, Bell } from 'lucide-react'
import { getUser, type User as AppUser } from "@/services/userService"
import { useAuth } from "@/hooks/useAuth"
import md5 from 'md5'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { auth } from '@/lib/firebase'
import { toast } from "@/hooks/use-toast"
import { SettingsSkeleton } from '@/app/common/dashboard/SocialLoading'



const settingsLinks = [
  { href: '/dashboard/settings/account', label: 'My Profile', icon: User },
  { href: '/dashboard/settings/security', label: 'Security', icon: ShieldCheck },
  { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings/appearance', label: 'Appearance', icon: Palette },
  { href: '/dashboard/payouts', label: 'Withdrawals', icon: ArrowUpRight },
  { href: '/dashboard/settings/payment-method', label: 'Payout Methods', icon: CreditCard },
  { href: '/dashboard/settings/plan-billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
]
interface UserData {
  displayName: string
  firstName: string
  lastName: string
  email: string
  profilePicture?: string
  plan: string
  emailVerified: boolean
  createdAt: Date
  lastLoginAt: Date
  phone?: string
  location?: string
}

export default function GeneralSettings() {
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [userData, setUserData] = useState<UserData>({
    displayName: "User",
    firstName: "User",
    lastName: "",
    email: "user@example.com",
    plan: "free",
    emailVerified: false,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  })
  const [firebaseProfile, setFirebaseProfile] = useState<AppUser | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.uid) {
        setLoadingProfile(false)
        return
      }

      try {
        const firebaseProfile = await getUser(user.uid)
        if (firebaseProfile) {
          setFirebaseProfile(firebaseProfile)
          setUserData(prev => ({
            ...prev,
            displayName: firebaseProfile.displayName || prev.displayName,
            firstName: firebaseProfile.displayName?.split(' ')[0] || prev.firstName,
            lastName: firebaseProfile.displayName?.split(' ').slice(1).join(' ') || prev.lastName,
            email: user.email || prev.email,
          }))
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoadingProfile(false)
      }
    }

    void loadUserProfile()
  }, [user])

  const getGravatarUrl = (email: string) => {
    const hash = md5(email.trim().toLowerCase())
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=200`
  }

  const getProfilePicture = () => {
    if (userData.profilePicture) return userData.profilePicture
    if (firebaseProfile?.profilePicture) return firebaseProfile.profilePicture
    return getGravatarUrl(userData.email)
  }



  if (loadingProfile) {
    return <SettingsSkeleton />
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Unable to log out',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }
  return (
    <div className="space-y-4 max-w-2xl">
      {/* Profile Section */}
      <div className="bg-background border rounded-lg">
        <div className="p-3 sm:p-4">
          <div className="flex items-start space-x-2">
            <Avatar className="h-14 w-14">
              <AvatarImage src={getProfilePicture()} alt={userData.displayName} />
              <AvatarFallback className="text-md">{userData.firstName[0]}{userData.lastName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <h3 className="text-md font-medium text-foreground">{userData.displayName}</h3>
                <Badge variant={userData.emailVerified ? 'default' : 'secondary'} className="text-xs">
                  {userData.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{userData.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-background border rounded-lg p-2 space-y-1">
        {settingsLinks.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="flex min-h-8 w-full items-center rounded-md px-2 py-1.5 text-xs font-medium leading-none text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
          >
            <link.icon className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-left truncate">{link.label}</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        ))}
        <div className="pt-3 mt-2 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="flex min-h-8 w-full items-center rounded-md px-2 py-1.5 text-left text-xs font-medium leading-none text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Logout</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to login again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

    </div>
  )
}
