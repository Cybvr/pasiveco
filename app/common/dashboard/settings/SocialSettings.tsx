import React from "react"
import { Globe, Eye } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

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
    <AccordionItem value="social" className="border-none bg-zinc-800/50 rounded-lg">
      <AccordionTrigger className="px-3 py-2 hover:no-underline">
        <span className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <span>Social Media</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="space-y-2">
          {socialLinks.map((social) => (
            <div key={social.id} className="p-3 bg-zinc-700 rounded-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={social.thumbnail} 
                  alt={social.platform} 
                  className="w-4 h-4 object-contain" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{social.platform}</p>
                  <input
                    type="url"
                    value={social.url}
                    onChange={(e) => handleUrlChange(social.id, e.target.value)}
                    className="w-full bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-xs mt-1 focus:outline-none focus:border-orange-500"
                    placeholder={`Your ${social.platform} URL`}
                  />
                </div>
                <button 
                  onClick={() => handleToggleActive(social.id)}
                  className={`p-2 rounded transition-colors ${
                    social.active ? 'bg-orange-500 text-white' : 'bg-zinc-600 text-zinc-300 hover:bg-zinc-500'
                  }`} 
                  aria-label={`${social.active ? 'Hide' : 'Show'} ${social.platform}`}
                >
                  <Eye className={`w-3 h-3 ${!social.active ? 'opacity-50' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default SocialSettings