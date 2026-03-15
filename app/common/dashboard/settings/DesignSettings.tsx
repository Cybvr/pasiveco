import React from "react"
import { Monitor, Type, Search, Plus, Palette } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createApi } from 'unsplash-js'

interface AppearanceData {
  buttonShape?: 'rounded' | 'square' | 'pill'
  fontFamily?: 'inter' | 'roboto' | 'poppins' | 'open-sans' | 'lato' | 'montserrat' | 'nunito' | 'raleway' | 'ubuntu' | 'playfair-display' | 'merriweather' | 'oswald' | 'source-sans-pro' | 'work-sans' | 'dm-sans'
  fontSize?: 'small' | 'medium' | 'large'
  buttonSize?: 'small' | 'medium' | 'large'
  buttonColor?: string
  buttonTextColor?: string
  textColor?: string
}

interface ProfileData {
  backgroundType?: 'color' | 'image'
  backgroundColor?: string
  backgroundImage?: string | null
  pageBackgroundType?: 'color' | 'image'
  pageBackgroundColor?: string
  pageBackgroundImage?: string | null
  appearance?: AppearanceData
}

interface DesignSettingsProps {
  profileData: ProfileData
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>
  onSave: (updates: Partial<ProfileData>) => void
  user: any
  appearanceData: AppearanceData
  setAppearanceData: React.Dispatch<React.SetStateAction<AppearanceData>>
}

const DesignSettings: React.FC<DesignSettingsProps> = ({ 
  profileData, 
  setProfileData, 
  onSave, 
  user,
  appearanceData,
  setAppearanceData
}) => {
  const [unsplashImages, setUnsplashImages] = React.useState<any[]>([])
  const [unsplashQuery, setUnsplashQuery] = React.useState("gradient background")
  const [isSearching, setIsSearching] = React.useState(false)

  const unsplash = createApi({
    accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''
  })

  const presets = ['#000000', '#ffffff', '#1a8d44', '#2563eb', '#7c3aed', '#dc2626', '#ea580c']
  
  const buttonShapes: { value: 'rounded' | 'square' | 'pill'; label: string }[] = [
    { value: 'rounded', label: 'Rounded' },
    { value: 'square', label: 'Square' },
    { value: 'pill', label: 'Pill' }
  ]

  const sizes: { value: 'small' | 'medium' | 'large'; label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ]

  React.useEffect(() => {
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
    searchUnsplashImages()
  }, [])

  const handleFieldChange = (field: keyof AppearanceData, value: string) => {
    const newData = { ...appearanceData, [field]: value }
    setAppearanceData(newData as any)
    onSave({ appearance: newData })
  }

  const renderBackgroundSection = (isPage: boolean = false) => {
    const backgroundType = isPage ? (profileData.pageBackgroundType || 'color') : (profileData.backgroundType || 'color')
    const backgroundColor = isPage ? (profileData.pageBackgroundColor || '#000000') : (profileData.backgroundColor || '#000000')
    const backgroundImage = isPage ? profileData.pageBackgroundImage : profileData.backgroundImage

    return (
      <div className="space-y-4 pt-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {isPage ? 'Page' : 'Card'}
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {['color', 'image'].map((type) => (
            <button
              key={type}
              onClick={() => {
                const field = isPage ? 'pageBackgroundType' : 'backgroundType'
                onSave({ [field]: type })
                setProfileData(prev => ({ ...prev, [field]: type }))
              }}
              className={`p-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                backgroundType === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/80 border-border'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {backgroundType === 'color' ? (
          <div className="grid grid-cols-4 gap-2">
            {/* Custom Picker */}
            <div className="relative h-8 rounded-lg bg-muted/50 flex items-center justify-center cursor-pointer group hover:bg-muted transition-colors">
              {!presets.includes(backgroundColor.toLowerCase()) ? (
                <div className="absolute inset-0 rounded-lg" style={{ backgroundColor }} />
              ) : (
                <Plus className="w-4 h-4 text-muted-foreground/60" />
              )}
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => {
                  const field = isPage ? 'pageBackgroundColor' : 'backgroundColor'
                  onSave({ [field]: e.target.value })
                  setProfileData(prev => ({ ...prev, [field]: e.target.value }))
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            {/* Presets */}
            {presets.map((color) => (
              <button
                key={color}
                onClick={() => {
                  const colorField = isPage ? 'pageBackgroundColor' : 'backgroundColor'
                  onSave({ [colorField]: color })
                  setProfileData(prev => ({ ...prev, [colorField]: color }))
                }}
                className={`h-8 rounded-lg transition-all active:scale-95 ${
                  backgroundColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
             <div className="flex gap-1.5">
                <input
                  type="text"
                  value={unsplashQuery}
                  onChange={(e) => setUnsplashQuery(e.target.value)}
                  placeholder="Search background..."
                  className="flex-1 bg-muted border-none rounded-md text-[10px] px-2 h-7 focus:ring-1 focus:ring-primary outline-none"
                />
                <button
                  onClick={() => setUnsplashQuery(unsplashQuery)}
                  className="px-2 bg-primary text-primary-foreground rounded-md h-7"
                >
                  <Search className="h-3 w-3" />
                </button>
             </div>
             
             <div className="grid grid-cols-4 gap-1.5 max-h-24 overflow-y-auto pr-1">
                {unsplashImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      const field = isPage ? 'pageBackgroundImage' : 'backgroundImage'
                      onSave({ [field]: image.urls.regular })
                      setProfileData(prev => ({ ...prev, [field]: image.urls.regular }))
                    }}
                    className={`aspect-square rounded-md border overflow-hidden ${backgroundImage === image.urls.regular ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={image.urls.small} className="w-full h-full object-cover" alt="Unsplash" />
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Backgrounds Section */}
      <div className="space-y-4">
          {renderBackgroundSection(true)} 
          <div className="h-px bg-border/20 w-4/5 mx-auto" />
          {renderBackgroundSection(false)}
      </div>

      <div className="h-px bg-border/50" />

      {/* Buttons Section */}
      <div className="space-y-4">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Buttons</label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1">Shape</Label>
            <div className="flex bg-muted/60 p-1 rounded-lg">
              {buttonShapes.map((shape) => {
                const isActive = (appearanceData.buttonShape || 'rounded') === shape.value;
                return (
                  <button
                    key={shape.value}
                    onClick={() => handleFieldChange('buttonShape', shape.value)}
                    className={`flex-1 flex items-center justify-center py-1.5 text-[11px] font-medium transition-all ${
                      isActive 
                        ? 'bg-background shadow-sm text-foreground rounded-md' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {/* Visual Shape Indicator */}
                    <div className={`w-3 h-3 mr-1.5 border border-current ${
                      shape.value === 'square' ? 'rounded-none' : shape.value === 'rounded' ? 'rounded-[4px]' : 'rounded-full'
                    }`} />
                    {shape.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1">Size</Label>
            <div className="flex bg-muted/60 p-1 rounded-lg">
              {sizes.map((size) => {
                const isActive = (appearanceData.buttonSize || 'medium') === size.value;
                return (
                  <button
                    key={size.value}
                    onClick={() => handleFieldChange('buttonSize', size.value)}
                    className={`flex-1 py-1.5 text-[11px] font-medium transition-all ${
                      isActive 
                        ? 'bg-background shadow-sm text-foreground rounded-md' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {size.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {/* Button Color */}
          <div className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-lg border border-border/50">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">Button Color</Label>
            <div className="relative w-7 h-7 rounded-full shadow-sm border border-border overflow-hidden cursor-pointer hover:scale-105 transition-transform">
              <div className="absolute inset-0" style={{ backgroundColor: appearanceData.buttonColor || '#ffffff' }} />
              <input
                type="color"
                value={appearanceData.buttonColor || '#ffffff'}
                onChange={(e) => handleFieldChange('buttonColor', e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
          
          {/* Button Text Color */}
          <div className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-lg border border-border/50">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">Button Text Color</Label>
            <div className="relative w-7 h-7 rounded-full shadow-sm border border-border overflow-hidden cursor-pointer hover:scale-105 transition-transform">
              <div className="absolute inset-0" style={{ backgroundColor: appearanceData.buttonTextColor || '#000000' }} />
              <input
                type="color"
                value={appearanceData.buttonTextColor || '#000000'}
                onChange={(e) => handleFieldChange('buttonTextColor', e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Typography Section */}
      <div className="space-y-4">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</label>
        
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1">Font Family</Label>
          <Select
            value={appearanceData.fontFamily || 'inter'}
            onValueChange={(value) => handleFieldChange('fontFamily', value)}
          >
            <SelectTrigger className="h-8 bg-muted border-none text-[11px] font-medium rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter (Modern)</SelectItem>
              <SelectItem value="roboto">Roboto (Clean)</SelectItem>
              <SelectItem value="poppins">Poppins (Friendly)</SelectItem>
              <SelectItem value="montserrat">Montserrat (Wide)</SelectItem>
              <SelectItem value="oswald">Oswald (Bold)</SelectItem>
              <SelectItem value="ubuntu">Ubuntu (Tech)</SelectItem>
              <SelectItem value="playfair-display">Playfair (Elegant)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3 pt-1">
          {/* Text Color */}
          <div className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-lg border border-border/50">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">Text Color</Label>
            <div className="relative w-7 h-7 rounded-full shadow-sm border border-border overflow-hidden cursor-pointer hover:scale-105 transition-transform">
              <div className="absolute inset-0" style={{ backgroundColor: appearanceData.textColor || '#000000' }} />
              <input
                type="color"
                value={appearanceData.textColor || '#000000'}
                onChange={(e) => handleFieldChange('textColor', e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignSettings
