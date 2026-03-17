import React from "react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

import SocialSettings from "./settings/SocialSettings"

import { getUserProfile, updateUserProfile } from "@/services/userProfilesService"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface SocialLink {
  id: string
  platform: string
  url: string
  thumbnail: string
  active: boolean
}

interface BioModeProps {
  socialLinks: SocialLink[]
  setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>
  saveProfile?: () => Promise<void>
}

const BioMode: React.FC<BioModeProps> = ({ 
  socialLinks, 
  setSocialLinks, 
  saveProfile
}) => {
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

  const TriggerStyle = "flex w-full items-center text-[13px] font-medium rounded-lg transition-all duration-200 px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground group data-[state=open]:text-foreground"
  const IconStyle = "h-4 w-4 mr-2.5 transition-colors group-hover:text-foreground group-data-[state=open]:text-foreground"

  return (
    <div className="w-full h-full bg-card border-r border-border flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-4 px-2.5">
        <Accordion type="multiple" className="space-y-2">
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
