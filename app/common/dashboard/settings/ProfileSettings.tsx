import React from "react"
import { User, Plus } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface ProfileData {
  username: string
  displayName: string
  bio: string
  profilePicture: string | null
  bannerImage?: string | null
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

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const newBannerImage = e.target?.result as string
      setProfileData((prev) => ({
        ...prev,
        bannerImage: newBannerImage,
      }))
      onSave({ bannerImage: newBannerImage })
    }
    reader.readAsDataURL(file)
  }

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    onSave({ [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-tight mb-2">Profile Banner</label>
        <div className="relative">
          <div className="w-full h-24 bg-muted rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden border border-border">
            {profileData.bannerImage ? (
              <img
                src={profileData.bannerImage}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <Plus className="w-6 h-6 text-muted-foreground/60" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload profile banner"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-tight mb-2">Profile Picture</label>
        <div className="relative">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden border border-border shadow-sm">
            {profileData.profilePicture ? (
              <img
                src={profileData.profilePicture || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Plus className="w-6 h-6 text-muted-foreground/60" />
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
        <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-tight mb-2">Handle</label>
        <div className="flex items-center bg-muted/40 border border-border/50 rounded-lg px-3 py-2 opacity-70 cursor-not-allowed">
          <span className="text-muted-foreground text-sm flex-shrink-0">pasive.co/</span>
          <span className="flex-1 text-sm text-foreground ml-1 font-medium select-none">
            {profileData.username.replace('@', '')}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-tight mb-2">Display Name</label>
        <input
          type="text"
          value={profileData.displayName}
          onChange={(e) => handleFieldChange('displayName', e.target.value)}
          className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-tight mb-2">Bio</label>
        <textarea
          value={profileData.bio}
          onChange={(e) => handleFieldChange('bio', e.target.value)}
          rows={3}
          className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
        />
      </div>
    </div>
  )
}

export default ProfileSettings