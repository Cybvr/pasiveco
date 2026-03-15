import React from "react"
import { Accordion } from "@/components/ui/accordion"

import ProfileSettings from "./settings/ProfileSettings"
import ThemeSettings from "./settings/ThemeSettings"
import BackgroundSettings from "./settings/BackgroundSettings"
import LinksSettings from "./settings/LinksSettings"
import SocialSettings from "./settings/SocialSettings"
import AppearanceSettings from "./settings/AppearanceSettings"

import { getUserProfile, updateUserProfile } from "@/services/userProfilesService"
import { useAuth } from "@/hooks/useAuth"

interface CustomLink {
  id: string
  title: string
  description: string
  url: string
  thumbnail: string
  active: boolean
  clicks: number
  ctr: number
}

interface SocialLink {
  id: string
  platform: string
  url: string
  thumbnail: string
  active: boolean
}

interface AppearanceData {
  buttonShape?: 'rounded' | 'square' | 'pill'
  fontFamily?: 'inter' | 'roboto' | 'poppins' | 'open-sans' | 'lato' | 'montserrat' | 'nunito' | 'raleway' | 'ubuntu' | 'playfair-display' | 'merriweather' | 'oswald' | 'source-sans-pro' | 'work-sans' | 'dm-sans'
  fontSize?: 'small' | 'medium' | 'large'
  buttonSize?: 'small' | 'medium' | 'large'
  buttonColor?: string
  textColor?: string
}

interface ProfileData {
  username: string
  displayName: string
  bio: string
  profilePicture: string | null
  slug: string
  backgroundType?: 'color' | 'image'
  backgroundColor?: string
  backgroundImage?: string | null
  pageBackgroundType?: 'color' | 'image'
  pageBackgroundColor?: string
  pageBackgroundImage?: string | null
}

interface BioModeProps {
  profileData: ProfileData
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>
  links: CustomLink[]
  setLinks: React.Dispatch<React.SetStateAction<CustomLink[]>>
  socialLinks: SocialLink[]
  setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>
  selectedTheme: string
  setSelectedTheme: React.Dispatch<React.SetStateAction<string>>
  appearanceData: AppearanceData
  setAppearanceData: React.Dispatch<React.SetStateAction<AppearanceData>>
}

const BioMode: React.FC<BioModeProps> = ({ 
  profileData, 
  setProfileData, 
  links, 
  setLinks, 
  socialLinks, 
  setSocialLinks, 
  selectedTheme, 
  setSelectedTheme,
  appearanceData,
  setAppearanceData
}) => {
  const [saveTimeout, setSaveTimeout] = React.useState<NodeJS.Timeout | null>(null)
  const { user } = useAuth()

  // Initialize with Firebase data
  React.useEffect(() => {
    const loadProfileData = async () => {
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
              backgroundType: firebaseProfile.backgroundType,
              backgroundColor: firebaseProfile.backgroundColor,
              backgroundImage: firebaseProfile.backgroundImage,
              pageBackgroundType: firebaseProfile.pageBackgroundType,
              pageBackgroundColor: firebaseProfile.pageBackgroundColor,
              pageBackgroundImage: firebaseProfile.pageBackgroundImage,
            })

            // Set links from Firebase profile
            if (firebaseProfile.links) {
              setLinks(firebaseProfile.links)
            }

            // Set social links from Firebase profile or initialize with defaults
            if (firebaseProfile.socialLinks && firebaseProfile.socialLinks.length > 0) {
              setSocialLinks(firebaseProfile.socialLinks)
            } else {
              initializeDefaultSocialLinks()
            }

            // Set appearance data from Firebase profile
            if (firebaseProfile.appearance) {
              setAppearanceData(firebaseProfile.appearance)
            }
          } else {
            initializeDefaultSocialLinks()
          }
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      } else {
        initializeDefaultSocialLinks()
      }
    }

    loadProfileData()
  }, [user, setProfileData, setSocialLinks, setLinks])

  const initializeDefaultSocialLinks = () => {
    const defaultSocialLinks = [
      { id: '1', platform: 'Instagram', url: '', thumbnail: '/images/pages/instagram.svg', active: false },
      { id: '2', platform: 'Twitter', url: '', thumbnail: '/images/pages/twitter.svg', active: false },
      { id: '3', platform: 'YouTube', url: '', thumbnail: '/images/pages/youtube.svg', active: false },
      { id: '4', platform: 'LinkedIn', url: '', thumbnail: '/images/pages/linkedin.svg', active: false },
      { id: '5', platform: 'Facebook', url: '', thumbnail: '/images/pages/facebook.svg', active: false },
      { id: '6', platform: 'TikTok', url: '', thumbnail: '/images/pages/tik-tok.svg', active: false },
      { id: '7', platform: 'Spotify', url: '', thumbnail: '/images/pages/spotify.svg', active: false },
      { id: '8', platform: 'Discord', url: '', thumbnail: '/images/pages/discord.svg', active: false },
    ]
    setSocialLinks(defaultSocialLinks)
  }

  const saveProfileData = async (updates: Partial<ProfileData> | { socialLinks: SocialLink[] }) => {
    if (!user?.uid) return

    try {
      const currentProfile = await getUserProfile(user.uid)
      if (currentProfile) {
        await updateUserProfile(currentProfile.id, updates)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  const debouncedSave = React.useCallback((updates: Partial<ProfileData>) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    const newTimeout = setTimeout(() => {
      saveProfileData(updates)
    }, 1000) // Save after 1 second of no changes

    setSaveTimeout(newTimeout)
  }, [saveTimeout, user?.uid])

  const handleProfileSave = async (updates: Partial<ProfileData>) => {
    if (!user?.uid) return

    try {
      const currentProfile = await getUserProfile(user.uid)
      if (currentProfile) {
        await updateUserProfile(currentProfile.id, updates)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  return (
    <div className="w-full md:w-96 p-4 sm:p-6 bg-zinc-800/30 border-b md:border-b-0 md:border-r border-zinc-800 overflow-auto max-h-screen">
      <Accordion type="multiple" className="space-y-3 overflow-hidden">
        <ProfileSettings 
          profileData={profileData}
          setProfileData={setProfileData}
          onSave={debouncedSave}
        />

        <ThemeSettings 
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
        />

        <BackgroundSettings 
          profileData={profileData}
          setProfileData={setProfileData}
          onSave={saveProfileData}
          user={user}
        />

        <LinksSettings 
          links={links}
          setLinks={setLinks}
        />

        <SocialSettings 
          socialLinks={socialLinks}
          setSocialLinks={setSocialLinks}
          onSave={saveProfileData}
        />

        <AppearanceSettings 
          appearanceData={appearanceData}
          setAppearanceData={setAppearanceData}
          onSave={(updates) => saveProfileData({ appearance: updates })}
        />
      </Accordion>
    </div>
  )
}

export default BioMode