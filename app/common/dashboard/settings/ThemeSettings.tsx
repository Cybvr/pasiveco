import React from "react"
import { Palette } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface ThemeSettingsProps {
  selectedTheme: string
  setSelectedTheme: React.Dispatch<React.SetStateAction<string>>
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ 
  selectedTheme, 
  setSelectedTheme 
}) => {
  const themes = [
    { name: 'default', color: 'bg-zinc-800', title: 'Default Theme' },
    { name: 'blue', color: 'bg-blue-600', title: 'Blue Theme' },
    { name: 'green', color: 'bg-green-600', title: 'Green Theme' },
    { name: 'purple', color: 'bg-purple-600', title: 'Purple Theme' },
  ]

  return (
    <AccordionItem value="theme" className="border-none bg-zinc-800/50 rounded-lg">
      <AccordionTrigger className="px-3 py-2 hover:no-underline">
        <span className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          <span>Theme</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="grid grid-cols-4 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setSelectedTheme(theme.name)}
              className={`w-12 h-12 ${theme.color} rounded-lg border-2 transition-all ${
                selectedTheme === theme.name ? 'border-orange-500' : 'border-transparent hover:scale-105'
              }`}
              title={theme.title}
              aria-label={`Select ${theme.title.toLowerCase()}`}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default ThemeSettings