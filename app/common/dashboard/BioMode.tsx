import React from "react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { User, LinkIcon, Globe } from "lucide-react"

import ProfileSettings from "./settings/ProfileSettings"
import LinksSettings from "./settings/LinksSettings"
import SocialSettings from "./settings/SocialSettings"

import { getUserProfile, updateUserProfile } from "@/services/userProfilesService"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

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
  appearance?: AppearanceData
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
  saveProfile?: () => Promise<void>
}

const BioMode: React.FC<BioModeProps> = ({ 
  profileData, 
  setProfileData, 
  links, 
  setLinks, 
  socialLinks, 
  setSocialLinks, 
  saveProfile
}) => {
  const [saveTimeout, setSaveTimeout] = React.useState<NodeJS.Timeout | null>(null)
  const { user } = useAuth()


  const saveProfileData = async (updates: any) => {
    if (!user?.uid) return

    try {
      const currentProfile = await getUserProfile(user.uid)
      if (currentProfile) {
        await updateUserProfile(currentProfile.id || "", updates)
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
    }, 1000)

    setSaveTimeout(newTimeout)
  }, [saveTimeout, user?.uid])

  // Style helpers to match sidebar exactly
  const TriggerStyle = "flex w-full items-center text-[13px] font-medium rounded-lg transition-all duration-200 px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground group data-[state=open]:text-foreground"
  const IconStyle = "h-4 w-4 mr-2.5 transition-colors group-hover:text-foreground group-data-[state=open]:text-foreground"

  return (
    <div className="w-full h-full bg-card border-r border-border flex flex-col overflow-hidden">
      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5">
        <Accordion type="multiple" className="space-y-2">
          {/* Profile Section */}
          <AccordionItem value="profile" className="border-none">
            <AccordionTrigger className={cn(TriggerStyle, "hover:no-underline [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-muted-foreground")}>
              <div className="flex items-center">
                <User className={IconStyle} />
                <span>Profile</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2.5 px-1 pb-1.5">
              <ProfileSettings 
                profileData={profileData}
                setProfileData={setProfileData}
                onSave={debouncedSave}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Links Section */}
          <AccordionItem value="links" className="border-none">
            <AccordionTrigger className={cn(TriggerStyle, "hover:no-underline [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-muted-foreground")}>
              <div className="flex items-center">
                <LinkIcon className={IconStyle} />
                <span>Links</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2.5 px-1 pb-1.5">
              <LinksSettings 
                links={links}
                setLinks={setLinks}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Social Media Section */}
          <AccordionItem value="social" className="border-none">
            <AccordionTrigger className={cn(TriggerStyle, "hover:no-underline [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-muted-foreground")}>
              <div className="flex items-center">
                <Globe className={IconStyle} />
                <span>Social Media</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2.5 px-1 pb-1.5">
              <SocialSettings 
                socialLinks={socialLinks}
                setSocialLinks={setSocialLinks}
                onSave={saveProfileData}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Footer Save Button */}
      <div className="p-4 border-t border-border bg-card">
        <Button 
          className="w-full h-10 bg-[#1a8d44] hover:bg-[#1a8d44]/90 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
          onClick={saveProfile}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default BioMode
