"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BioPagePreview from '@/app/common/dashboard/BioPagePreview'
import { getUserProfile } from '@/services/userProfilesService'
import { useAuth } from '@/hooks/useAuth'

function App() {
  const [profileData, setProfileData] = useState<{
    username: string
    displayName: string
    bio: string
    profilePicture: string | null
    slug: string
    socialLinks?: any[]
  }>({
    username: "@username",
    displayName: "Your Name",
    bio: "Your bio here",
    profilePicture: null,
    slug: "yourslug",
    socialLinks: [],
  })
  const router = useRouter()
  const { user } = useAuth()
  const [links, setLinks] = useState<any[]>([])

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
              socialLinks: firebaseProfile.socialLinks || [],
            })
            setLinks(firebaseProfile.links || [])
          }
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      }
    }
    loadProfile()
  }, [user])

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
        </div>
      </div>


      <div className="space-y-4">
        <div className="flex flex-row gap-3">
          <button type="button" onClick={() => router.push('/dashboard/products')}>Add Product</button>
          <button type="button" onClick={() => router.push('/dashboard/edit')}>Add Link</button>
          <button type="button" onClick={() => router.push('/dashboard/edit')}>Edit Page</button>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push('/dashboard/edit')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              router.push('/dashboard/edit')
            }
          }}
          className="rounded-xl text-card-foreground overflow-hidden h-full flex flex-col text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open page editor"
        >
          <div className="relative overflow-hidden bg-muted/20 rounded-xl group/preview h-[420px] md:h-[520px]">
            <div className="absolute inset-0">
              <div className="scale-[0.5] origin-top-left w-[200%] h-[200%] pointer-events-none p-8">
                <BioPagePreview profileData={profileData} links={links} />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover/preview:opacity-100 transition-opacity md:flex items-center justify-center hidden" />
          </div>
        </div>
      </div>

    </div>
  )
}

export default App
