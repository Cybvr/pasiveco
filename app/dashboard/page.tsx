"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import BioPagePreview from '@/app/common/dashboard/BioPagePreview'
import { getUserProfile } from '@/services/userProfilesService'
import { blogService, BlogPost } from '@/services/blogService'
import { useAuth } from '@/hooks/useAuth'
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
  const router = useRouter()
  const { user } = useAuth()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isBlogLoading, setIsBlogLoading] = useState(true)

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

      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-1">
              <p className="text-lg font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-row gap-3">
          <button type="button" onClick={() => router.push('/dashboard/products')}>Add Product</button>
          <button type="button" onClick={() => router.push('/dashboard/edit')}>Add Link</button>
          <button type="button" onClick={() => router.push('/dashboard/edit')}>Edit Page</button>
        </div>

        <div className="rounded-xl text-card-foreground overflow-hidden h-full flex flex-col">
          <div className="relative overflow-hidden bg-muted/20 rounded-xl group/preview h-[420px] md:h-[520px]">
            <div className="absolute inset-0">
              <div className="scale-[0.5] origin-top-left w-[200%] h-[200%] pointer-events-none p-8">
                <BioPagePreview profileData={profileData} links={[]} selectedTheme="default" />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover/preview:opacity-100 transition-opacity md:flex items-center justify-center hidden" />
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">What's New</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {isBlogLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="h-full min-w-[260px] md:min-w-[300px] animate-pulse snap-start border-0 shadow-none bg-transparent">
                <CardContent className="p-0 space-y-3">
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
                <Link key={post.id || post.slug} href={`/blog/${post.slug}`} className="group min-w-[260px] md:min-w-[300px] snap-start" prefetch={false}>
                  <Card className="h-full transition-colors hover:border-muted-foreground/40 border-0 shadow-none bg-transparent">
                    <CardContent className="p-0 space-y-3">
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
                        <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
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
