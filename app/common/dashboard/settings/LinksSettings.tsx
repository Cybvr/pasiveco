import React from "react"
import { Plus, Eye, EyeOff, Check } from "lucide-react"

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

interface LinksSettingsProps {
  links: CustomLink[]
  setLinks: React.Dispatch<React.SetStateAction<CustomLink[]>>
}

const LinksSettings: React.FC<LinksSettingsProps> = ({ links, setLinks }) => {
  const [editingLink, setEditingLink] = React.useState<number | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  const [editUrl, setEditUrl] = React.useState("")

  const fetchFavicon = async (url: string): Promise<string | null> => {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.origin

      const faviconUrls = [
        `${domain}/favicon.ico`,
        `${domain}/favicon.png`,
        `${domain}/apple-touch-icon.png`,
        `${domain}/apple-touch-icon-precomposed.png`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
      ]

      for (const faviconUrl of faviconUrls) {
        try {
          const response = await fetch(faviconUrl, { method: 'HEAD' })
          if (response.ok) {
            return faviconUrl
          }
        } catch (error) {
          continue
        }
      }
      return null
    } catch (error) {
      return null
    }
  }

  const handleEditLink = (link: CustomLink) => {
    setEditingLink(Number(link.id))
    setEditTitle(link.title)
    setEditUrl(link.url)
  }

  const handleSaveLink = async (linkId: number) => {
    const currentLink = links.find(link => Number(link.id) === linkId)
    let newThumbnail = currentLink?.thumbnail || "/images/pages/website.svg"

    if (editUrl && editUrl !== currentLink?.url) {
      const favicon = await fetchFavicon(editUrl)
      if (favicon) {
        newThumbnail = favicon
      }
    }

    setLinks(prev => 
      prev.map(link => 
        Number(link.id) === linkId 
          ? { ...link, title: editTitle, url: editUrl, thumbnail: newThumbnail }
          : link
      )
    )
    setEditingLink(null)
    setEditTitle("")
    setEditUrl("")
  }

  const handleCancelEdit = () => {
    setEditingLink(null)
    setEditTitle("")
    setEditUrl("")
  }

  const handleDeleteLink = (linkId: number) => {
    setLinks(prev => prev.filter(link => Number(link.id) !== linkId))
  }

  const handleAddLink = () => {
    const newLink: CustomLink = {
      id: Date.now().toString(),
      title: "New Link",
      description: "Add a description",
      url: "https://example.com",
      thumbnail: "/images/pages/website.svg",
      active: true,
      clicks: 0,
      ctr: 0
    }
    setLinks(prev => [...prev, newLink])
  }

  const handleToggleLink = (linkId: string) => {
    setLinks(prev => 
      prev.map(l => 
        l.id === linkId ? { ...l, active: !l.active } : l
      )
    )
  }

  const handleThumbnailUpload = (linkId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      setLinks(prev => 
        prev.map(l => 
          l.id === linkId ? { ...l, thumbnail: event.target?.result as string } : l
        )
      )
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between px-1 mb-1.5 pt-1">
        <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest pl-1">Links</span>
        <button
          onClick={handleAddLink}
          className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {links.map((link) => (
        <div 
          key={link.id} 
          className="group flex flex-col gap-0.5 py-1 px-1 rounded-md hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {/* Icon */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 flex items-center justify-center bg-muted/40 rounded-sm shrink-0 overflow-hidden">
                <img 
                  src={link.thumbnail} 
                  alt="" 
                  className="w-3.5 h-3.5 object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                  onError={(e) => { e.currentTarget.src = "/images/pages/website.svg" }}
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleThumbnailUpload(link.id, file)
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Title / Main Content */}
            <div className="flex-1 min-w-0" onClick={() => editingLink !== Number(link.id) && handleEditLink(link)}>
              {editingLink === Number(link.id) ? (
                <input
                  autoFocus
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-transparent border-none p-0 m-0 text-[13px] font-medium focus:ring-0 focus:outline-none placeholder:text-muted-foreground/10"
                  placeholder="Link Title"
                />
              ) : (
                <h4 className="text-[13px] font-medium text-foreground truncate cursor-text">{link.title}</h4>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              <button 
                onClick={() => handleToggleLink(link.id)}
                className={`p-1.5 rounded transition-all ${
                  link.active 
                    ? 'text-primary' 
                    : 'text-muted-foreground/10 hover:text-muted-foreground/40'
                }`}
              >
                {link.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              
              <button 
                onClick={() => editingLink === Number(link.id) ? handleSaveLink(Number(link.id)) : handleDeleteLink(Number(link.id))}
                className="p-1.5 text-muted-foreground/10 hover:text-destructive rounded transition-all"
              >
                {editingLink === Number(link.id) ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <span className="text-base leading-none">×</span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Edit State (URL) */}
          {editingLink === Number(link.id) && (
            <div className="pl-10 pr-1 pb-0.5">
              <input
                type="url"
                value={editUrl}
                onChange={async (e) => {
                  const newUrl = e.target.value
                  setEditUrl(newUrl)
                  if (newUrl.startsWith('http') && newUrl.includes('.')) {
                    try {
                      const favicon = await fetchFavicon(newUrl)
                      if (favicon) setLinks(prev => prev.map(l => Number(l.id) === editingLink ? { ...l, thumbnail: favicon } : l))
                    } catch (e) {}
                  }
                }}
                className="w-full bg-transparent border-none p-0 m-0 text-[11px] text-muted-foreground/60 focus:ring-0 focus:outline-none placeholder:text-muted-foreground/20 italic"
                placeholder="https://yourlink.com"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default LinksSettings