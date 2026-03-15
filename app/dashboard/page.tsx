"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MoreHorizontal, 
  Edit3, 
  Share2, 
  Eye, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Plus, 
  Coins, 
  Link as LinkIcon,
  ChevronRight,
  ArrowUpRight,
  ShoppingBag,
  Bell
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import BioPagePreview from '@/app/common/dashboard/BioPagePreview'
import { getUserProfile } from '@/services/userProfilesService'
import { useAuth } from '@/hooks/useAuth'

function App() {
  const [profileData, setProfileData] = useState<{
    username: string,
    displayName: string,
    bio: string,
    profilePicture: string | null,
    slug: string,
  }>({
    username: "@username",
    displayName: "Your Name",
    bio: "Your bio here",
    profilePicture: null,
    slug: "yourslug",
  })
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
    { label: "Total Revenue", value: "$0.00", icon: TrendingUp, color: "text-green-600", trend: "+0%" },
    { label: "Total Clicks", value: "0", icon: MousePointer2, color: "text-blue-600", trend: "+0%" },
    { label: "Total Audience", value: "0", icon: Users, color: "text-purple-600", trend: "+0%" },
  ]

  const quickActions = [
    { label: "Add Product", icon: ShoppingBag, href: "/dashboard/products", color: "bg-orange-50 text-orange-600" },
    { label: "Add Link", icon: LinkIcon, href: "/dashboard/edit", color: "bg-blue-50 text-blue-600" },
    { label: "Wallet", icon: Coins, href: "/dashboard/wallet", color: "bg-green-50 text-green-600" },
  ]

  const recentActivity = [
    { type: "notification", message: "Welcome to Pasive! Complete your profile to start selling.", time: "Just now" },
  ]

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profileData.displayName,
          text: `Check out my profile on Pasive`,
          url: fullUrl
        })
      } catch (error) {}
    } else {
      navigator.clipboard.writeText(fullUrl)
      alert('Link copied!')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {profileData.displayName.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your creator profile today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share Profile
          </Button>
          <Button className="bg-[#5A1448] hover:bg-[#4A103B]" onClick={() => router.push('/dashboard/edit')}>
            <Edit3 className="w-4 h-4 mr-2" /> Edit Page
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color.replace('text', 'bg')}/10`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.trend}</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick Actions & Preview */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {quickActions.map((action, i) => (
                <button 
                  key={i}
                  onClick={() => router.push(action.href)}
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
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

          {/* Mini Bio Preview Card */}
          <Card className="border-none shadow-sm overflow-hidden bg-muted/20">
            <div className="p-4 border-b bg-background flex justify-between items-center">
              <span className="text-sm font-medium">Page Preview</span>
              <Button variant="ghost" size="sm" onClick={() => window.open(`/${profileData.slug}`, '_blank')}>
                <Eye className="w-4 h-4 mr-2" /> View Live
              </Button>
            </div>
            <div className="relative aspect-[9/16] overflow-hidden">
              <div className="scale-[0.5] origin-top-left w-[200%] h-[200%] pointer-events-none p-8">
                <BioPagePreview profileData={profileData} links={[]} selectedTheme="default" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Activity & Detailed Stats */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Stay updated with your latest sales and interactions.</CardDescription>
              </div>
              <Bell className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-6">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex gap-4 items-start pb-6 border-b last:border-0">
                      <div className="p-2 rounded-full bg-blue-50">
                        <ArrowUpRight className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="link" className="w-full text-muted-foreground font-normal" onClick={() => router.push('/dashboard/analytics')}>
                    View all analytics
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="p-4 rounded-full bg-muted">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">No activity yet</p>
                    <p className="text-sm text-muted-foreground max-w-[250px]">Once you share your link and start selling, your activity will appear here.</p>
                  </div>
                  <Button onClick={() => router.push('/dashboard/edit')}>Start Creating</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App