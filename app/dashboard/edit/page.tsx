"use client"

import { useState, useEffect } from "react"
import { User, ImageIcon, QrCode, Home } from "lucide-react"
import { getUserProfile, createUserProfile, updateUserProfile, type UserProfile } from "@/services/userProfilesService"
import type { QRCodeRecord } from "@/services/qrCodeService"
import { useAuth } from "@/hooks/useAuth"
import QRMode from "@/app/common/dashboard/QRMode"
import BioMode from "@/app/common/dashboard/BioMode"
import BioPagePreview from "@/app/common/dashboard/BioPagePreview"
import AvatarMode from "@/app/common/dashboard/ChatMode"
import QRCodePreview from "@/app/common/dashboard/QRCodePreview"
import AIChatPreview from "@/app/common/dashboard/ChatPreview"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import UserMenu from "@/app/common/dashboard/user-menu"
import Link from "next/link" // Import Link from Next.js

function Page() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentMode, setCurrentMode] = useState("bio")
  const [qrCanvas, setQrCanvas] = useState<HTMLCanvasElement | null>(null)
  const [qrDownloadFn, setQrDownloadFn] = useState<(() => void) | null>(null)
  const [qrCopyFn, setQrCopyFn] = useState<(() => Promise<void>) | null>(null)
  const [selectedTheme, setSelectedTheme] = useState("default")
  const [avatarData, setAvatarData] = useState({
    name: "Digital Twin",
    personality: "I am a helpful and knowledgeable assistant representing the profile owner.",
    instructions:
      "Answer questions about my background, skills, services, and experience. Be helpful and provide accurate information based on the context provided.",
    contextFile: null,
    responseStyle: "professional" as const,
    enabled: true,
  })
  const [profileData, setProfileData] = useState({
    username: "username",
    displayName: "Your Name",
    bio: "Your bio here",
    profilePicture: "/images/dud.png",
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [qrData, setQrData] = useState<Partial<QRCodeRecord>>({
    name: "Profile QR Code",
    url: `https://pasive.co/username`,
    type: "profile",
    foreground: "#000000",
    background: "#ffffff",
    size: 200,
    margin: 4,
    errorCorrectionLevel: "M",
    logoSize: 40,
    isActive: true,
    isPublic: false,
  })
  const [links, setLinks] = useState([])
  const [socialLinks, setSocialLinks] = useState([])
  const profileUrl = `https://pasive.co${profileData.username}`

  // Appearance settings for buttons and text
  const [appearanceData, setAppearanceData] = useState({
    buttonShape: "rounded",
    fontSize: "medium",
    fontFamily: "sans-serif",
  })

  // Load user profile data from Firebase
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return
      setLoading(true)
      try {
        let profile = await getUserProfile(user.uid)
        if (!profile) {
          // Create new profile if doesn't exist
          const profileId = await createUserProfile({
            userId: user.uid,
            username: user.email?.split("@")[0] || "user",
            displayName: user.displayName || "Your Name",
            bio: "Your bio here",
            profilePicture: user.photoURL || "/images/dud.png",
            links: [],
            socialLinks: [],
            theme: "default",
            isPublic: true,
            // Initialize appearance settings
            appearance: appearanceData,
          })
          profile = await getUserProfile(user.uid)
        }
        if (profile) {
          setUserProfile(profile)
          setProfileData({
            username: profile.username,
            displayName: profile.displayName,
            bio: profile.bio,
            profilePicture: profile.profilePicture,
          })
          setLinks(profile.links || [])
          setSocialLinks(profile.socialLinks || [])
          setSelectedTheme(profile.theme)
          // Load appearance settings if available
          if (profile.appearance) {
            setAppearanceData(profile.appearance)
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setLoading(false)
      }
    }
    loadUserProfile()
  }, [user])

  // Sync qrData URL with profileData changes
  useEffect(() => {
    setQrData((prev) => ({
      ...prev,
      url: profileUrl,
    }))
  }, [profileUrl])

  // Save profile changes to Firebase
  const saveProfile = async () => {
    if (!user || !userProfile) return
    try {
      await updateUserProfile(userProfile.id!, {
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        profilePicture: profileData.profilePicture,
        links,
        socialLinks,
        theme: selectedTheme,
        appearance: appearanceData, // Save appearance data
      })
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleQRGenerated = (canvas: HTMLCanvasElement, downloadFn: () => void, copyFn: () => Promise<void>) => {
    setQrCanvas(canvas)
    setQrDownloadFn(() => downloadFn)
    setQrCopyFn(() => copyFn)
  }

  const modes = [
    { key: "bio", label: "Bio Mode", icon: User },
    { key: "qr", label: "QR Mode", icon: QrCode },
    { key: "avatar", label: "Avatar Mode", icon: ImageIcon },
  ]

  const renderModeContent = () => {
    switch (currentMode) {
      case "bio":
        return (
          <BioMode
            profileData={profileData}
            setProfileData={setProfileData}
            links={links}
            setLinks={setLinks}
            socialLinks={socialLinks}
            setSocialLinks={setSocialLinks}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            appearanceData={appearanceData}
            setAppearanceData={setAppearanceData}
          />
        )
      case "qr":
        return <QRMode profileUrl={profileUrl} onQRGenerated={handleQRGenerated} onQRDataChange={setQrData} />
      case "avatar":
        return <AvatarMode avatarData={avatarData} onAvatarDataChange={setAvatarData} />
      default:
        return <BioMode profileData={profileData} setProfileData={setProfileData} links={links} setLinks={setLinks} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toaster component for notifications */}
      <Toaster />
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-1">
          {/* Home Button - Now part of the mode selector group */}
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
          {/* Mode Selector - Beside the Home button */}
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <Button
                key={mode.key}
                onClick={() => setCurrentMode(mode.key)}
                variant={currentMode === mode.key ? "default" : "ghost"}
                size="sm"
                className="gap-1"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Action Buttons - Right aligned */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/${profileData.username}`, "_blank")}
          >
            View
          </Button>
          <Button variant="secondary" size="sm" onClick={saveProfile}>
            Save
          </Button>
          <UserMenu />
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Panel - Dynamic Mode Content */}
        {renderModeContent()}
        {/* Right Panel - Preview Area */}
        <div className="flex-1 p-4 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-sm h-[600px] flex items-center justify-center overflow-hidden rounded-lg border bg-card">
            <div className="w-full h-full overflow-auto">
              {currentMode === "qr" ? (
                /* QR Code Preview */
                <QRCodePreview qrData={qrData} onQRGenerated={handleQRGenerated} />
              ) : currentMode === "avatar" ? (
                /* AI Avatar Chat Interface Preview */
                <AIChatPreview avatarData={avatarData} profileData={profileData} />
              ) : (
                /* Bio Profile Preview */
                <BioPagePreview
                  profileData={{ ...profileData, socialLinks, appearance: appearanceData }}
                  links={links}
                  selectedTheme={selectedTheme}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Page
