import React from "react"
import { LinkIcon, Plus, Edit3, Eye } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

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
    <AccordionItem value="links" className="border-none bg-zinc-800/50 rounded-lg">
      <AccordionTrigger className="px-3 py-2 hover:no-underline">
        <span className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          <span>Links</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="sr-only">Add Link</span>
          <button
            onClick={handleAddLink}
            className="ml-auto bg-orange-500 hover:bg-orange-600 p-2 rounded-lg transition-colors"
            aria-label="Add link"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="p-3 bg-zinc-700 rounded-lg">
              {editingLink === Number(link.id) ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">URL</label>
                    <input
                      type="url"
                      value={editUrl}
                      onChange={async (e) => {
                        const newUrl = e.target.value
                        setEditUrl(newUrl)

                        if (newUrl.startsWith('http') && newUrl.includes('.')) {
                          try {
                            const favicon = await fetchFavicon(newUrl)
                            if (favicon) {
                              setLinks(prev => 
                                prev.map(l => 
                                  Number(l.id) === editingLink ? { ...l, thumbnail: favicon } : l
                                )
                              )
                            }
                          } catch (error) {
                            console.log('Failed to fetch favicon:', error)
                          }
                        }
                      }}
                      className="w-full bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-sm focus:outline-none focus:border-orange-500"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveLink(Number(link.id))}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-zinc-300 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <img 
                      src={link.thumbnail} 
                      alt={link.title} 
                      className="w-8 h-8 object-contain rounded border border-zinc-600" 
                      onError={(e) => {
                        e.currentTarget.src = "/images/pages/website.svg"
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleThumbnailUpload(link.id, file)
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{link.title}</p>
                    <p className="text-xs text-zinc-400 truncate">{link.url}</p>
                  </div>
                  <button 
                    onClick={() => handleToggleLink(link.id)}
                    className={`p-2 rounded transition-colors ${
                      link.active ? 'bg-orange-500 text-white' : 'bg-zinc-600 text-zinc-300 hover:bg-zinc-500'
                    }`} 
                    aria-label={`${link.active ? 'Hide' : 'Show'} ${link.title}`}
                  >
                    <Eye className={`w-3 h-3 ${!link.active ? 'opacity-50' : ''}`} />
                  </button>
                  <button 
                    onClick={() => handleEditLink(link)}
                    className="p-1 hover:bg-zinc-600 rounded transition-colors" 
                    aria-label={`Edit ${link.title}`}
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleDeleteLink(Number(link.id))}
                    className="p-1 hover:bg-red-600 rounded transition-colors text-red-400 hover:text-white" 
                    aria-label={`Delete ${link.title}`}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default LinksSettings