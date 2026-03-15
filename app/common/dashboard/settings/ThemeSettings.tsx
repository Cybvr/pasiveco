import React from "react"
import { Palette } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface AppearanceData {
  buttonShape?: 'rounded' | 'square' | 'pill'
  fontFamily?: 'inter' | 'roboto' | 'poppins' | 'open-sans' | 'lato' | 'montserrat' | 'nunito' | 'raleway' | 'ubuntu' | 'playfair-display' | 'merriweather' | 'oswald' | 'source-sans-pro' | 'work-sans' | 'dm-sans'
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
}

interface ThemeSettingsProps {
  selectedTheme: string
  setSelectedTheme: React.Dispatch<React.SetStateAction<string>>
  profileData: ProfileData
  setProfileData: React.Dispatch<React.SetStateAction<any>>
  appearanceData: AppearanceData
  setAppearanceData: React.Dispatch<React.SetStateAction<AppearanceData>>
  onSave: (updates: any) => void
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ 
  selectedTheme, 
  setSelectedTheme,
  profileData,
  setProfileData,
  appearanceData,
  setAppearanceData,
  onSave
}) => {
  const presets = [
    { name: 'black', color: '#000000', title: 'Midnight', shape: 'square', font: 'inter', pageBg: '#0a0a0a', cardBg: '#171717', buttonColor: '#ffffff', buttonTextColor: '#000000', textColor: '#ffffff' },
    { name: 'white', color: '#ffffff', title: 'Neutral', shape: 'rounded', font: 'inter', pageBg: '#f3f4f6', cardBg: '#ffffff', buttonColor: '#000000', buttonTextColor: '#ffffff', textColor: '#000000' },
    { name: 'green', color: '#1a8d44', title: 'Eco', shape: 'pill', font: 'montserrat', pageBg: '#dcfce7', cardBg: '#f0fdf4', buttonColor: '#166534', buttonTextColor: '#ffffff', textColor: '#14532d' },
    { name: 'blue', color: '#2563eb', title: 'Tech', shape: 'rounded', font: 'roboto', pageBg: '#dbeafe', cardBg: '#eff6ff', buttonColor: '#1d4ed8', buttonTextColor: '#ffffff', textColor: '#1e3a8a' },
    { name: 'purple', color: '#7c3aed', title: 'Royal', shape: 'pill', font: 'poppins', pageBg: '#f3e8ff', cardBg: '#faf5ff', buttonColor: '#6d28d9', buttonTextColor: '#ffffff', textColor: '#4c1d95' },
    { name: 'red', color: '#dc2626', title: 'Pulse', shape: 'rounded', font: 'oswald', pageBg: '#fee2e2', cardBg: '#fef2f2', buttonColor: '#b91c1c', buttonTextColor: '#ffffff', textColor: '#7f1d1d' },
    { name: 'orange', color: '#ea580c', title: 'Zest', shape: 'pill', font: 'ubuntu', pageBg: '#ffedd5', cardBg: '#fff7ed', buttonColor: '#c2410c', buttonTextColor: '#ffffff', textColor: '#7c2d12' },
  ]

  const handleApplyTheme = (theme: any) => {
    setSelectedTheme(theme.name)
    const newAppearance = {
      ...appearanceData,
      buttonShape: theme.shape as any,
      fontFamily: theme.font as any,
      buttonColor: theme.buttonColor,
      buttonTextColor: theme.buttonTextColor,
      textColor: theme.textColor,
    }
    setAppearanceData(newAppearance)
    
    setProfileData((prev: any) => ({
      ...prev,
      backgroundType: 'color',
      backgroundColor: theme.cardBg,
      pageBackgroundType: 'color',
      pageBackgroundColor: theme.pageBg,
    }))

    onSave({ 
      theme: theme.name, 
      appearance: newAppearance,
      backgroundType: 'color',
      backgroundColor: theme.cardBg,
      pageBackgroundType: 'color',
      pageBackgroundColor: theme.pageBg,
    })
  }

  return (
    <div className="grid grid-cols-4 gap-y-4 gap-x-2 pt-2 pb-1">
      {/* Custom Theme Picker */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center cursor-pointer group hover:bg-muted transition-colors shadow-sm">
          {!presets.map(p => p.name).includes(selectedTheme) ? (
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: selectedTheme.startsWith('#') ? selectedTheme : undefined }} />
          ) : (
            <Palette className="w-4 h-4 text-muted-foreground/60" />
          )}
          <input
            type="color"
            value={selectedTheme.startsWith('#') ? selectedTheme : '#000000'}
            onChange={(e) => {
              setSelectedTheme(e.target.value)
              onSave({ theme: e.target.value })
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">Custom</span>
      </div>

      {presets.map((theme) => (
        <div key={theme.name} className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => handleApplyTheme(theme)}>
          <button
            className={`w-10 h-10 rounded-full transition-all duration-200 shadow-sm group-active:scale-90 ${
              selectedTheme === theme.name ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'
            }`}
            style={{ backgroundColor: theme.color }}
          />
          <span className={`text-[10px] font-medium transition-colors ${selectedTheme === theme.name ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
            {theme.title}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ThemeSettings