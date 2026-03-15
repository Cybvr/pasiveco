'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserProfile } from "@/services/userProfilesService"
import { useAuth } from "@/hooks/useAuth"
import md5 from 'md5'

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
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscriptions/default')
        if (!response.ok) {
          setSubscription({ plan: 'free', status: 'no_subscription' })
          return
        }
        const data = await response.json()
        if (data && data.plan) {
          data.plan = data.plan.toLowerCase()
        }
        setSubscription(data)
      } catch (error) {
        console.error('Error fetching subscription:', error)
        setSubscription({ plan: 'free', status: 'no_subscription' })
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  return (
    <div className="space-y-2 max-w-4xl">
      <h1 className="text-lg font-semibold text-foreground">Profile</h1>

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

      {/* Account Details */}
      <div className="bg-background border rounded-lg p-4">
        <h2 className="text-sm font-medium text-foreground pb-4">Account Details</h2>
        <div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-foreground">Full Name</dt>
              <dd className="text-sm text-muted-foreground mt-1">{userData.firstName} {userData.lastName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-foreground">Email Address</dt>
              <dd className="text-sm text-muted-foreground mt-1">{userData.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-foreground">Phone Number</dt>
              <dd className="text-sm text-muted-foreground mt-1">{userData.phone || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-foreground">Location</dt>
              <dd className="text-sm text-muted-foreground mt-1">{userData.location || 'Not provided'}</dd>
            </div>
          </dl>
        </div>
      </div>

     
    </div>
  )
}