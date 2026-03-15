"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Edit3,
  Share2,
  Eye,
  Coins,
  Link as LinkIcon,
  ChevronRight,
  ShoppingBag,
  Bell,
  Crown,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import BioPagePreview from '@/app/common/dashboard/BioPagePreview'
import ShareModal from '@/app/common/dashboard/ShareModal'
import { getUserProfile } from '@/services/userProfilesService'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import Link from 'next/link'

function App() {
  const [profileData, setProfileData] = useState<{
    username: string
    displayName: string
    bio: string
    profilePicture: string | null
    slug: string
  }>({
    username: "@username",
    displayName: "Your Name",
    bio: "Your bio here",
    profilePicture: null,
    slug: "yourslug",
  })
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const profileUrl = `pasive.co/${profileData.slug}`
  const fullUrl = `https://${profileUrl}`

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.uid) {
        try {
          const firebaseProfile = await getUserProfile(user.uid)
          if (firebaseProfile) {
            setProfileData({
              username: firebaseProfile.username,
              displayName: firebaseProfile.displayName,
              bio: firebaseProfile.bio || "",
              profilePicture: firebaseProfile.profilePicture || null,
              slug: firebaseProfile.slug,
            })
          }
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      }
    }
    loadProfile()
  }, [user])

  const stats = [
    { label: "Total Revenue", value: "$0.00" },
    { label: "Total Clicks", value: "0" },
    { label: "Total Audience", value: "0" },
  ]

  const quickActions = [
    { label: "Add Product", icon: ShoppingBag, href: "/dashboard/products", color: "bg-primary/10 text-primary" },
    { label: "Add Link", icon: LinkIcon, href: "/dashboard/edit", color: "bg-secondary/20 text-secondary-foreground" },
    { label: "Wallet", icon: Coins, href: "/dashboard/wallet", color: "bg-muted text-muted-foreground" },
  ]

  const recentActivity = [
    { message: "Welcome to Pasive! Complete your profile to start selling.", time: "Just now" },
  ]



  const firstName =
    profileData.displayName && profileData.displayName !== "Your Name"
      ? profileData.displayName.split(' ')[0]
      : (user?.displayName?.split(' ')[0] || "Creator")

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">

      {/* Mobile Header Branding */}
      <div className="flex items-center space-x-2 md:hidden mb-4">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Image src="/images/monster.png" alt="Monster" width={24} height={24} />
        </div>
        <h1 className="text-lg text-foreground font-black italic tracking-tighter uppercase">pasive</h1>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {firstName} 👋</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your creator profile today.</p>
        </div>
        <div className="flex items-center gap-2">
          {profileData.slug && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href={`/${profileData.slug}`} target="_blank">
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
            <Link href="/pricing">
              <Crown className="w-4 h-4" />
            </Link>
          </Button>
          <div className="w-[1px] h-4 bg-border mx-1" />
          <Button variant="outline" onClick={() => setIsShareModalOpen(true)}>
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button onClick={() => router.push('/dashboard/edit')}>
            <Edit3 className="w-4 h-4" /> Edit
          </Button>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profileData={profileData}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Preview */}
        <div className="lg:col-span-4 space-y-8">
          <Card>
            <div className="p-4 border-b border-border flex justify-between items-center">
              <span className="text-sm font-medium">Page Preview</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => window.open(`/${profileData.slug}`, '_blank')}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative aspect-[9/16] overflow-hidden bg-muted/20">
              <div className="scale-[0.5] origin-top-left w-[200%] h-[200%] pointer-events-none p-8">
                <BioPagePreview profileData={profileData} links={[]} selectedTheme="default" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Quick Actions + Activity */}
        <div className="lg:col-span-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => router.push(action.href)}
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-border hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </CardContent>
          </Card>


        </div>

      </div>
    </div>
  )
}

export default App