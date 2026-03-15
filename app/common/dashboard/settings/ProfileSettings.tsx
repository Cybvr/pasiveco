import React from "react"
import { User, Plus } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface ProfileData {
  username: string
  displayName: string
  bio: string
  profilePicture: string | null
  slug: string
}

interface ProfileSettingsProps {
  profileData: ProfileData
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>
  onSave: (updates: Partial<ProfileData>) => void
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  profileData, 
  setProfileData, 
  onSave 
}) => {
  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const newProfilePicture = e.target?.result as string
      setProfileData((prev) => ({
        ...prev,
        profilePicture: newProfilePicture,
      }))
      onSave({ profilePicture: newProfilePicture })
    }
    reader.readAsDataURL(file)
  }

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    onSave({ [field]: value })
  }

  return (
    <AccordionItem value="profile" className="border-none bg-card/50 rounded-lg">
      <AccordionTrigger className="px-3 py-2 hover:no-underline">
        <span className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <span>Profile</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Profile Picture</label>
            <div className="relative">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden border border-border">
                {profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Plus className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="absolute inset-0 w-20 h-20 opacity-0 cursor-pointer"
                aria-label="Upload profile picture"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Username</label>
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm mr-1">pasive.co/</span>
              <input
                type="text"
                value={profileData.username.replace('@', '')}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Display Name</label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => handleFieldChange('displayName', e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              rows={3}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default ProfileSettings