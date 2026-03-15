import React from "react"
import { Monitor, Plus, Search } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { createApi } from 'unsplash-js'

interface ProfileData {
  backgroundType?: 'color' | 'image'
  backgroundColor?: string
  backgroundImage?: string | null
  pageBackgroundType?: 'color' | 'image'
  pageBackgroundColor?: string
  pageBackgroundImage?: string | null
}

interface BackgroundSettingsProps {
  profileData: ProfileData
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>
  onSave: (updates: Partial<ProfileData>) => void
  user: any
}

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({ 
  profileData, 
  setProfileData, 
  onSave, 
  user 
}) => {
  const [unsplashImages, setUnsplashImages] = React.useState<any[]>([])
  const [unsplashQuery, setUnsplashQuery] = React.useState("gradient background")
  const [isSearching, setIsSearching] = React.useState(false)

  const unsplash = createApi({
    accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''
  })

  const colors = ['#000000', '#1a1a1a', '#374151', '#1e40af', '#059669', '#7c3aed', '#dc2626', '#ea580c']

  React.useEffect(() => {
    searchUnsplashImages()
  }, [])

  const searchUnsplashImages = async () => {
    setIsSearching(true)
    try {
      const result = await unsplash.search.getPhotos({
        query: unsplashQuery,
        page: 1,
        perPage: 12,
        orientation: 'portrait'
      })

      if (result.response) {
        setUnsplashImages(result.response.results)
      }
    } catch (error) {
      console.error('Error fetching Unsplash images:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleBackgroundTypeChange = (type: 'color' | 'image', isPage: boolean = false) => {
    const field = isPage ? 'pageBackgroundType' : 'backgroundType'
    const newProfileData = { ...profileData, [field]: type }
    setProfileData(newProfileData)
    onSave({ [field]: type })
  }

  const handleColorChange = (color: string, isPage: boolean = false) => {
    const field = isPage ? 'pageBackgroundColor' : 'backgroundColor'
    const newProfileData = { ...profileData, [field]: color }
    setProfileData(newProfileData)
    onSave({ [field]: color })
  }

  const handleImageSelect = (imageUrl: string, isPage: boolean = false) => {
    const field = isPage ? 'pageBackgroundImage' : 'backgroundImage'
    const newProfileData = { ...profileData, [field]: imageUrl }
    setProfileData(newProfileData)
    onSave({ [field]: imageUrl })
  }

  const handleImageUpload = async (file: File, isPage: boolean = false) => {
    if (!user) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.uid)
      formData.append('folder', isPage ? 'page-backgrounds' : 'backgrounds')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        const field = isPage ? 'pageBackgroundImage' : 'backgroundImage'
        const newProfileData = { ...profileData, [field]: result.downloadURL }
        setProfileData(newProfileData)
        onSave({ [field]: result.downloadURL })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const renderBackgroundSettings = (isPage: boolean = false) => {
    const backgroundType = isPage 
      ? (profileData.pageBackgroundType || 'color') 
      : (profileData.backgroundType || 'color')
    const backgroundColor = isPage 
      ? (profileData.pageBackgroundColor || '#000000') 
      : (profileData.backgroundColor || '#000000')
    const backgroundImage = isPage 
      ? profileData.pageBackgroundImage 
      : profileData.backgroundImage

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            {isPage ? 'Page' : 'Bio Card'} Background Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleBackgroundTypeChange('color', isPage)}
              className={`p-2 rounded-lg border-2 text-sm transition-all ${
                backgroundType === 'color' 
                  ? 'border-primary bg-primary/20' 
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              Color
            </button>
            <button
              onClick={() => handleBackgroundTypeChange('image', isPage)}
              className={`p-2 rounded-lg border-2 text-sm transition-all ${
                backgroundType === 'image' 
                  ? 'border-primary bg-primary/20' 
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              Image
            </button>
          </div>
        </div>

        {backgroundType === 'color' ? (
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              {isPage ? 'Page' : 'Bio Card'} Background Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color, isPage)}
                  className={`w-full h-10 rounded-lg border-2 transition-all ${
                    backgroundColor === color 
                      ? 'border-primary' 
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`${isPage ? 'Page' : 'Bio card'} background color ${color}`}
                />
              ))}
            </div>
            <div className="mt-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => handleColorChange(e.target.value, isPage)}
                className="w-full h-10 rounded-lg border border-border bg-transparent cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              {isPage ? 'Page' : 'Bio Card'} Background Image
            </label>
            <div className="space-y-3">
              {/* Unsplash Search */}
              {!isPage && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-muted-foreground">Unsplash Gallery</label>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={unsplashQuery}
                      onChange={(e) => setUnsplashQuery(e.target.value)}
                      placeholder="Search backgrounds..."
                      className="flex-1 bg-muted border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={searchUnsplashImages}
                      disabled={isSearching}
                      className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                    >
                      <Search className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {unsplashImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <button
                          onClick={() => handleImageSelect(image.urls.regular, isPage)}
                          className={`w-full h-16 rounded-lg border-2 transition-all overflow-hidden ${
                            backgroundImage === image.urls.regular 
                              ? 'border-primary' 
                              : 'border-border hover:border-muted-foreground hover:scale-105'
                          }`}
                          style={{
                            backgroundImage: `url(${image.urls.small})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                          title={`Photo by ${image.user.name}`}
                        />
                      </div>
                    ))}
                    {isSearching && (
                      <div className="col-span-3 text-center py-4 text-muted-foreground text-xs">
                        Searching Unsplash...
                      </div>
                    )}
                    {!isSearching && unsplashImages.length === 0 && (
                      <div className="col-span-3 text-center py-4 text-muted-foreground text-xs">
                        No images found. Try a different search term.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Custom Image */}
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Upload Custom Image</label>
                <div className="relative">
                  <div className={`w-full h-24 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors overflow-hidden ${
                    backgroundImage ? 'border-solid' : ''
                  }`}>
                    {backgroundImage ? (
                      <img
                        src={backgroundImage}
                        alt="Background preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Plus className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground">Upload Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, isPage)
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {backgroundImage && (
                <button
                  onClick={() => {
                    const field = isPage ? 'pageBackgroundImage' : 'backgroundImage'
                    const newProfileData = { ...profileData, [field]: null }
                    setProfileData(newProfileData)
                    onSave({ [field]: null })
                  }}
                  className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Remove Background
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Page Background */}
      <AccordionItem value="page-background" className="border-none bg-card/50 rounded-lg">
        <AccordionTrigger className="px-3 py-2 hover:no-underline">
          <span className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            <span>Page Background</span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3">
          {renderBackgroundSettings(true)}
        </AccordionContent>
      </AccordionItem>

      {/* Bio Card Background */}
      <AccordionItem value="background" className="border-none bg-card/50 rounded-lg">
        <AccordionTrigger className="px-3 py-2 hover:no-underline">
          <span className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            <span>Bio Card Background</span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3">
          {renderBackgroundSettings(false)}
        </AccordionContent>
      </AccordionItem>
    </>
  )
}

export default BackgroundSettings