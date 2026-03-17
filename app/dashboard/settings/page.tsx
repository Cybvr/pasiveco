'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, CreditCard, Gift, ArrowUpRight, BarChart, Wallet, ChevronRight, ShieldCheck, Coins } from 'lucide-react'
import { getUserProfile } from "@/services/userProfilesService"
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



const settingsLinks = [
  { href: '/dashboard/settings/account', label: 'My Account', icon: User },
  { href: '/dashboard/settings/withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
  { href: '/dashboard/settings/earnings', label: 'Earnings', icon: Coins },
  { href: '/dashboard/settings/payment-methods', label: 'Payment Methods', icon: Wallet },
  { href: '/dashboard/settings/plan-billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings/analytics', label: 'Analytics', icon: BarChart },
  { href: '/dashboard/settings/refer', label: 'Refer a friend', icon: Gift },
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
  const [firebaseProfile, setFirebaseProfile] = useState(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const firebaseProfile = await getUserProfile(user.uid)
          if (firebaseProfile) {
            setFirebaseProfile(firebaseProfile)
            setUserData(prev => ({
              ...prev,
              displayName: firebaseProfile.displayName,
              firstName: firebaseProfile.displayName.split(' ')[0] || prev.firstName,
              lastName: firebaseProfile.displayName.split(' ').slice(1).join(' ') || prev.lastName,
              email: user.email || prev.email,
            }))
          }
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      }
    }

    loadUserProfile()
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-background border rounded-lg">
        <div className="p-2">
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
          <Button
            key={link.href}
            variant="ghost"
            className="w-full justify-start px-2 gap-2"
            onClick={() => router.push(link.href)}
          >
            <link.icon className="h-4 w-4" />
            <span className="flex-1 text-left">{link.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        ))}
        <div className="pt-3 mt-2 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
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
