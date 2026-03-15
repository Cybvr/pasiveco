import React from "react"
import { Eye, EyeOff } from "lucide-react"

interface SocialLink {
  id: string
  platform: string
  url: string
  thumbnail: string
  active: boolean
}

interface SocialSettingsProps {
  socialLinks: SocialLink[]
  setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>
  onSave: (updates: { socialLinks: SocialLink[] }) => void
}

const SocialSettings: React.FC<SocialSettingsProps> = ({
  socialLinks,
  setSocialLinks,
  onSave
}) => {
  const handleUrlChange = (socialId: string, url: string) => {
    const updatedSocialLinks = socialLinks.map(s =>
      s.id === socialId ? { ...s, url } : s
    )
    setSocialLinks(updatedSocialLinks)
    onSave({ socialLinks: updatedSocialLinks })
  }

  const handleToggleActive = (socialId: string) => {
    const updatedSocialLinks = socialLinks.map(s =>
      s.id === socialId ? { ...s, active: !s.active } : s
    )
    setSocialLinks(updatedSocialLinks)
    onSave({ socialLinks: updatedSocialLinks })
  }

  return (
    <div className="space-y-0.5">
      {socialLinks.map((social) => (
        <div 
          key={social.id} 
          className="group flex items-center gap-2.5 py-1 px-1 rounded-md hover:bg-muted/30 transition-colors"
        >
          {/* Platform Icon */}
          <div className={`w-8 h-8 flex items-center justify-center rounded-sm shrink-0 transition-all ${
            social.active ? 'bg-background shadow-sm' : 'bg-muted/40'
          }`}>
            <img 
              src={social.thumbnail} 
              alt={social.platform} 
              className={`w-3.5 h-3.5 object-contain transition-all duration-300 ${
                social.active 
                  ? 'grayscale-0 opacity-100 scale-110' 
                  : 'grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-70'
              }`} 
            />
          </div>

          {/* Input Area */}
          <div className="flex-1 min-w-0">
            <input
              type="url"
              value={social.url}
              onChange={(e) => handleUrlChange(social.id, e.target.value)}
              className={`w-full bg-transparent border-none p-0 m-0 text-[13px] focus:ring-0 focus:outline-none placeholder:text-muted-foreground/20 transition-colors ${
                social.active ? 'text-foreground font-medium' : 'text-muted-foreground/40'
              }`}
              placeholder={`${social.platform} URL...`}
            />
          </div>

          {/* Visibility Toggle */}
          <button 
            onClick={() => handleToggleActive(social.id)}
            className={`p-1.5 rounded transition-all ${social.active
                ? 'text-primary'
                : 'text-muted-foreground/10 hover:text-muted-foreground/40'
              }`}
            aria-label={`${social.active ? 'Hide' : 'Show'} ${social.platform}`}
          >
            {social.active ? (
              <Eye className="w-3.5 h-3.5 stroke-[2.5px]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ))}
    </div>
  )
}

export default SocialSettings