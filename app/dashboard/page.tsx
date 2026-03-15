"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Edit3, Share2, Eye, Globe, Instagram, Youtube, Twitter } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import BioPagePreview from '@/app/common/dashboard/BioPagePreview'
import { getUserProfile } from '@/services/userProfilesService'
import { useAuth } from '@/hooks/useAuth'

function App() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    username: "@username",
    displayName: "Your Name",
    bio: "Your bio here",
    profilePicture: null,
    slug: "yourslug",
  })
  const router = useRouter()
  const { user } = useAuth()
  
  const username = profileData.username
  const profileUrl = `pasive.co/${profileData.slug}`
  const fullUrl = `https://${profileUrl}`

  // Load Firebase profile data
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
              profilePicture: firebaseProfile.profilePicture,
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

  const links = []

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: username,
          text: `Check out my profile: ${username}`,
          url: fullUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
    setDropdownOpen(false)
  }

  const handleThumbnailClick = () => {
    router.push('/dashboard/edit')  // Next.js navigation
  }

  const handleEdit = () => {
    router.push('/dashboard/edit')  // Next.js navigation
  }

  const handleView = () => {
    window.open(`/${profileData.slug}`, '_blank')  // Internal link to slug page
  }

  return (
    <div className="bg-background text-foreground p-4">
      <div className="max-w-sm w-full space-y-2">
        {/* Welcome Text */}
        <div className="space-y-1">
          <p className="text-sm font-light text-foreground/60">Welcome</p>
        </div>

        {/* Profile Info */}
        <div className="space-y-1">
          <h1 className="text-2xl font-light tracking-tight">{username}</h1>
        </div>

        {/* Edit Link Card - Vertical with Page and dropdown */}
        <div className="bg-foreground/5 rounded-xl border border-foreground/10 overflow-hidden w-full max-w-xs">
          <div 
            className="h-80 relative cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
            onClick={handleThumbnailClick}
          >
            <div className="scale-[0.65] origin-top-left w-[154%] h-[154%] pointer-events-none">
              <BioPagePreview profileData={profileData} links={links} selectedTheme="default" />
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground text-sm">pasive.co/{profileData.slug}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 rounded hover:bg-foreground/10 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleView}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App