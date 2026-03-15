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
import { blogService, BlogPost } from '@/services/blogService'
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
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isBlogLoading, setIsBlogLoading] = useState(true)

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

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const posts = await blogService.getAllPosts()
        setBlogPosts((posts as BlogPost[]).slice(0, 3))
      } catch (error) {
        console.error("Error loading blog posts:", error)
      } finally {
        setIsBlogLoading(false)
      }
    }
    loadBlogPosts()
  }, [])

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

  const firstName =
    profileData.displayName && profileData.displayName !== "Your Name"
      ? profileData.displayName.split(' ')[0]
      : (user?.displayName?.split(' ')[0] || "Creator")

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Hello, {firstName} 👋</h1>
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
              <p className="text-lg font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Left: Preview */}
        <div className="lg:col-span-4">
          <div className="rounded-xl text-card-foreground overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">My Pasive Page</span>
            </div>
            <div className="relative flex-1 overflow-hidden bg-muted/20 rounded-xl group/preview" style={{ minHeight: 0 }}>
              <div className="absolute inset-0">
                <div className="scale-[0.5] origin-top-left w-[200%] h-[200%] pointer-events-none p-8">
                  <BioPagePreview profileData={profileData} links={[]} selectedTheme="default" />
                </div>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                <Button onClick={() => router.push('/dashboard/edit')}>
                  <Edit3 className="w-4 h-4" /> Edit Page
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="rounded-xl text-card-foreground flex flex-col flex-1">
            <h3 className="text-sm font-semibold leading-none tracking-tight pb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3 flex-1">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => router.push(action.href)}
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-border hover:bg-muted transition-colors group flex-1"
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
            </div>
          </div>
        </div>

      </div>

      {/* Blog Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest from the blog</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">View all</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isBlogLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="h-full animate-pulse">
                <CardContent className="p-5 space-y-3">
                  <div className="h-28 rounded-lg bg-muted/70" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-muted/70" />
                    <div className="h-5 w-4/5 rounded bg-muted/70" />
                    <div className="h-4 w-full rounded bg-muted/70" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            blogPosts.map((post) => {
              const imageSrc = post.imageUrl || post.image
              return (
                <Link key={post.id || post.slug} href={`/blog/${post.slug}`} className="group" prefetch={false}>
                  <Card className="h-full transition-colors hover:border-muted-foreground/40">
                    <CardContent className="p-5 space-y-3">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={post.title}
                          className="h-28 w-full rounded-lg object-cover bg-muted/70"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-28 rounded-lg bg-muted/70" />
                      )}
                      <div className="space-y-2">
                        {post.date && (
                          <p className="text-sm text-muted-foreground">{post.date}</p>
                        )}
                        <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default App
