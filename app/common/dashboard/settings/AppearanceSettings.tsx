
import React from "react"
import { Palette, Type, Square } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface AppearanceData {
  buttonShape?: 'rounded' | 'square' | 'pill'
  fontFamily?: 'inter' | 'roboto' | 'poppins' | 'open-sans' | 'lato' | 'montserrat' | 'nunito' | 'raleway' | 'ubuntu' | 'playfair-display' | 'merriweather' | 'oswald' | 'source-sans-pro' | 'work-sans' | 'dm-sans'
  fontSize?: 'small' | 'medium' | 'large'
  buttonSize?: 'small' | 'medium' | 'large'
  buttonColor?: string
  textColor?: string
}

interface AppearanceSettingsProps {
  appearanceData: AppearanceData
  setAppearanceData: React.Dispatch<React.SetStateAction<AppearanceData>>
  onSave: (updates: AppearanceData) => void
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ 
  appearanceData, 
  setAppearanceData, 
  onSave 
}) => {
  const handleFieldChange = (field: keyof AppearanceData, value: string) => {
    const newData = { ...appearanceData, [field]: value }
    setAppearanceData(newData)
    onSave(newData)
  }

  const buttonShapes = [
    { value: 'rounded', label: 'Rounded' },
    { value: 'square', label: 'Square' },
    { value: 'pill', label: 'Pill' }
  ]

  const fonts = [
    { value: 'inter', label: 'Inter' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'poppins', label: 'Poppins' },
    { value: 'open-sans', label: 'Open Sans' },
    { value: 'lato', label: 'Lato' },
    { value: 'montserrat', label: 'Montserrat' },
    { value: 'nunito', label: 'Nunito' },
    { value: 'raleway', label: 'Raleway' },
    { value: 'ubuntu', label: 'Ubuntu' },
    { value: 'playfair-display', label: 'Playfair Display' },
    { value: 'merriweather', label: 'Merriweather' },
    { value: 'oswald', label: 'Oswald' },
    { value: 'source-sans-pro', label: 'Source Sans Pro' },
    { value: 'work-sans', label: 'Work Sans' },
    { value: 'dm-sans', label: 'DM Sans' }
  ]

  const sizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ]

  return (
    <AccordionItem value="appearance" className="border-none bg-zinc-800/50 rounded-lg">
      <AccordionTrigger className="px-3 py-2 hover:no-underline">
        <span className="flex items-center gap-2">
          <Type className="w-5 h-5" />
          <span>Appearance</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-zinc-400 mb-2 block">Button Shape</Label>
            <Select
              value={appearanceData.buttonShape || 'rounded'}
              onValueChange={(value) => handleFieldChange('buttonShape', value)}
            >
              <SelectTrigger className="w-full bg-zinc-700 border-zinc-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {buttonShapes.map((shape) => (
                  <SelectItem key={shape.value} value={shape.value}>
                    {shape.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-zinc-400 mb-2 block">Font Family</Label>
            <Select
              value={appearanceData.fontFamily || 'inter'}
              onValueChange={(value) => handleFieldChange('fontFamily', value)}
            >
              <SelectTrigger className="w-full bg-zinc-700 border-zinc-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-zinc-400 mb-2 block">Font Size</Label>
            <Select
              value={appearanceData.fontSize || 'medium'}
              onValueChange={(value) => handleFieldChange('fontSize', value)}
            >
              <SelectTrigger className="w-full bg-zinc-700 border-zinc-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-zinc-400 mb-2 block">Button Size</Label>
            <Select
              value={appearanceData.buttonSize || 'medium'}
              onValueChange={(value) => handleFieldChange('buttonSize', value)}
            >
              <SelectTrigger className="w-full bg-zinc-700 border-zinc-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-zinc-400 mb-2 block">Button Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={appearanceData.buttonColor || '#ffffff'}
                onChange={(e) => handleFieldChange('buttonColor', e.target.value)}
                className="w-8 h-8 rounded border border-zinc-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={appearanceData.buttonColor || '#ffffff'}
                onChange={(e) => handleFieldChange('buttonColor', e.target.value)}
                className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-white"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm text-zinc-400 mb-2 block">Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={appearanceData.textColor || '#000000'}
                onChange={(e) => handleFieldChange('textColor', e.target.value)}
                className="w-8 h-8 rounded border border-zinc-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={appearanceData.textColor || '#000000'}
                onChange={(e) => handleFieldChange('textColor', e.target.value)}
                className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-white"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default AppearanceSettings
