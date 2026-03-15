"use client"

import { useState, useEffect, useCallback } from "react"
import { User, QrCode, ExternalLink } from "lucide-react"
import { getUserProfile, createUserProfile, updateUserProfile, type UserProfile } from "@/services/userProfilesService"
import type { QRCodeRecord } from "@/services/qrCodeService"
import { useAuth } from "@/hooks/useAuth"
import QRMode from "@/app/common/dashboard/QRMode"
import BioMode from "@/app/common/dashboard/BioMode"
import BioPagePreview from "@/app/common/dashboard/BioPagePreview"
import QRCodePreview from "@/app/common/dashboard/QRCodePreview"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Page() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentMode, setCurrentMode] = useState("bio")
  const [qrCanvas, setQrCanvas] = useState<HTMLCanvasElement | null>(null)
  const [qrDownloadFn, setQrDownloadFn] = useState<(() => void) | null>(null)
  const [qrCopyFn, setQrCopyFn] = useState<(() => Promise<void>) | null>(null)
  const [selectedTheme, setSelectedTheme] = useState("default")

  const [profileData, setProfileData] = useState<Partial<UserProfile> & { username: string, slug: string, displayName: string, bio: string, profilePicture: string | null, bannerImage: string | null }>({
    username: "username",
    displayName: "Your Name",
    bio: "Your bio here",
    profilePicture: "/images/dud.png" as string | null,
    bannerImage: null,
    slug: "username",
    backgroundType: 'color',
    backgroundColor: '#ffffff',
    backgroundImage: null,
    pageBackgroundType: 'color',
    pageBackgroundColor: '#ffffff',
    pageBackgroundImage: null,
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
  })
  const [links, setLinks] = useState<any[]>([])
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/${profileData.username}` : `https://pasive.co/${profileData.username}`

  const [appearanceData, setAppearanceData] = useState({
    buttonShape: "rounded" as "rounded" | "square" | "pill",
    fontSize: "medium" as "small" | "medium" | "large",
    fontFamily: "sans-serif" as any,
    buttonSize: "medium" as "small" | "medium" | "large",
    buttonColor: "#ffffff",
    buttonTextColor: "#000000",
    textColor: "#000000",
  })

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return
      setLoading(true)
      try {
        let profile = await getUserProfile(user.uid)
        if (!profile) {
          const defaultLinks = [
            { id: '1', title: 'My Portfolio', description: 'Check out my latest work', url: 'https://example.com', thumbnail: '/images/pages/website.svg', active: true, clicks: 0, ctr: 0, type: 'custom' },
            { id: '2', title: 'Personal Website', description: 'Visit my home on the web', url: 'https://example.com', thumbnail: '/images/pages/website.svg', active: true, clicks: 0, ctr: 0, type: 'custom' },
            { id: '3', title: 'Contact Me', description: 'Reach out for collaborations', url: 'mailto:hello@pasive.co', thumbnail: '/images/pages/website.svg', active: true, clicks: 0, ctr: 0, type: 'custom' },
          ]
          const defaultSocialLinks = [
            { id: '1', platform: 'Instagram', url: 'https://instagram.com/username', thumbnail: '/images/pages/instagram.svg', active: true },
            { id: '2', platform: 'Twitter', url: 'https://twitter.com/username', thumbnail: '/images/pages/twitter.svg', active: true },
            { id: '3', platform: 'YouTube', url: '', thumbnail: '/images/pages/youtube.svg', active: false },
            { id: '4', platform: 'LinkedIn', url: 'https://linkedin.com/in/username', thumbnail: '/images/pages/linkedin.svg', active: true },
            { id: '5', platform: 'Facebook', url: '', thumbnail: '/images/pages/facebook.svg', active: false },
            { id: '6', platform: 'TikTok', url: '', thumbnail: '/images/pages/tik-tok.svg', active: false },
            { id: '7', platform: 'Spotify', url: '', thumbnail: '/images/pages/spotify.svg', active: false },
            { id: '8', platform: 'Discord', url: '', thumbnail: '/images/pages/discord.svg', active: false },
          ]

          const profileId = await createUserProfile({
            userId: user.uid,
            username: user.email?.split("@")[0] || "user",
            displayName: user.displayName || "Your Name",
            bio: "Building something amazing ✨",
            profilePicture: user.photoURL || "/images/dud.png",
            links: defaultLinks,
            socialLinks: defaultSocialLinks,
            theme: "default",
            isPublic: true,
            slug: user.email?.split("@")[0] || "user",
            appearance: appearanceData,
          })
          profile = await getUserProfile(user.uid)
        }
        if (profile) {
          setUserProfile(profile)
          setProfileData(prev => ({
            ...prev,
            username: profile.username,
            displayName: profile.displayName,
            bio: profile.bio || "Building something amazing ✨",
            profilePicture: profile.profilePicture,
            bannerImage: profile.bannerImage || null,
            slug: profile.slug || profile.username,
            backgroundType: profile.backgroundType || 'color',
            backgroundColor: profile.backgroundColor || '#ffffff',
            backgroundImage: profile.backgroundImage || null,
            pageBackgroundType: profile.pageBackgroundType || 'color',
            pageBackgroundColor: profile.pageBackgroundColor || '#ffffff',
            pageBackgroundImage: profile.pageBackgroundImage || null,
          }))
          
          // Define high-quality defaults
          const defaultLinks = [
            { id: '1', title: 'My Portfolio', description: 'Check out my latest work', url: 'https://github.com', thumbnail: '/images/pages/website.svg', active: true, clicks: 0, ctr: 0, type: 'custom' },
            { id: '2', title: 'Personal Website', description: 'Visit my home on the web', url: 'https://example.com', thumbnail: '/images/pages/website.svg', active: true, clicks: 0, ctr: 0, type: 'custom' },
          ]
          const defaultSocials = [
            { id: '1', platform: 'Instagram', url: 'https://instagram.com/username', thumbnail: '/images/pages/instagram.svg', active: true },
            { id: '2', platform: 'Twitter', url: 'https://twitter.com/username', thumbnail: '/images/pages/twitter.svg', active: true },
            { id: '3', platform: 'LinkedIn', url: 'https://linkedin.com/in/username', thumbnail: '/images/pages/linkedin.svg', active: true },
            { id: '4', platform: 'YouTube', url: '', thumbnail: '/images/pages/youtube.svg', active: false },
            { id: '5', platform: 'Facebook', url: '', thumbnail: '/images/pages/facebook.svg', active: false },
            { id: '6', platform: 'TikTok', url: '', thumbnail: '/images/pages/tik-tok.svg', active: false },
            { id: '7', platform: 'Spotify', url: '', thumbnail: '/images/pages/spotify.svg', active: false },
            { id: '8', platform: 'Discord', url: '', thumbnail: '/images/pages/discord.svg', active: false },
          ]

          // Heal links if empty
          if (!profile.links || profile.links.length === 0) {
            setLinks(defaultLinks)
          } else {
            setLinks(profile.links)
          }

          // Heal socials if empty or all inactive
          const hasActiveSocials = profile.socialLinks?.some(s => s.active && s.url)
          if (!profile.socialLinks || profile.socialLinks.length === 0 || !hasActiveSocials) {
            setSocialLinks(defaultSocials)
          } else {
            setSocialLinks(profile.socialLinks)
          }

          setSelectedTheme(profile.theme || "default")
          if (profile.appearance) {
            setAppearanceData({
              buttonShape: profile.appearance.buttonShape || "rounded",
              fontSize: profile.appearance.fontSize || "medium",
              fontFamily: profile.appearance.fontFamily || "sans-serif",
              buttonSize: profile.appearance.buttonSize || "medium",
              buttonColor: profile.appearance.buttonColor || "#ffffff",
              buttonTextColor: profile.appearance.buttonTextColor || "#000000",
              textColor: profile.appearance.textColor || "#000000",
            })
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

  useEffect(() => {
    setQrData((prev) => ({
      ...prev,
      url: profileUrl,
    }))
  }, [profileUrl])

  const saveProfile = async () => {
    if (!user || !userProfile) return
    try {
      await updateUserProfile(userProfile.id!, {
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        profilePicture: profileData.profilePicture,
        bannerImage: profileData.bannerImage,
        links,
        socialLinks,
        theme: selectedTheme,
        appearance: appearanceData,
        backgroundType: profileData.backgroundType,
        backgroundColor: profileData.backgroundColor,
        backgroundImage: profileData.backgroundImage,
        pageBackgroundType: profileData.pageBackgroundType,
        pageBackgroundColor: profileData.pageBackgroundColor,
        pageBackgroundImage: profileData.pageBackgroundImage,
      })
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  const handleQRGenerated = useCallback((canvas: HTMLCanvasElement, downloadFn: () => void, copyFn: () => Promise<void>) => {
    setQrCanvas(canvas)
    setQrDownloadFn(() => downloadFn)
    setQrCopyFn(() => copyFn)
  }, [])

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

  const modes = [
    { key: "bio", label: "Link in Bio", icon: User },
    { key: "qr", label: "QR Mode", icon: QrCode },
  ]

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Re-introducing the Top Navigation styled like Sidebar */}
      <nav className="flex items-center justify-between h-14 border-b px-4 shrink-0">
        <div className="flex items-center gap-1.5 h-full">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = currentMode === mode.key
            return (
              <button
                key={mode.key}
                onClick={() => setCurrentMode(mode.key)}
                className={cn(
                  "flex items-center text-[13px] font-semibold rounded-lg transition-all duration-200 px-3 py-2",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 mr-2", isActive ? "text-foreground" : "text-muted-foreground")} />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 h-full">
          <button
            onClick={() => window.open(profileUrl, "_blank")}
            className="flex items-center text-[13px] font-semibold rounded-lg border border-border px-4 py-2 hover:bg-accent transition-all duration-200"
          >
            My Page
            <ExternalLink className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-3.5rem)] overflow-hidden min-h-0">
        <div className="w-full md:w-64 h-full overflow-hidden min-h-0">
          {currentMode === "bio" ? (
            <BioMode
              profileData={profileData as any}
              setProfileData={setProfileData as any}
              links={links}
              setLinks={setLinks}
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
              appearanceData={appearanceData as any}
              setAppearanceData={setAppearanceData as any}
              saveProfile={saveProfile}
            />
          ) : (
            <QRMode profileUrl={profileUrl} onQRGenerated={handleQRGenerated} onQRDataChange={setQrData} />
          )}
        </div>

        <div className="flex-1 p-6 flex items-center justify-center bg-muted/20 overflow-hidden min-h-0">
          <div className="w-full max-w-sm h-full max-h-[650px] flex items-start justify-center min-h-0">
            <div className="w-full h-full overflow-auto bg-card rounded-xl border shadow-lg border-border">
              {currentMode === "qr" ? (
                <QRCodePreview qrData={qrData as any} onQRGenerated={setQrCanvas} />
              ) : (
                <BioPagePreview
                  profileData={{ ...profileData, socialLinks, appearance: appearanceData } as any}
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
