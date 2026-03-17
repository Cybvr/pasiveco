'use client'

import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Monitor, Moon, Sun } from 'lucide-react'

export default function AccountSettings() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Appearance Settings</CardTitle>
          <CardDescription>Customize how your dashboard looks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="dark-mode" className="text-sm font-medium">Dark mode</Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => setTheme('light')} className={`rounded-lg border p-3 text-left ${theme === 'light' ? 'border-primary bg-primary/5' : ''}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Sun className="h-4 w-4" />
                Light
              </div>
              <p className="text-xs text-muted-foreground">Bright interface for daytime work.</p>
            </button>
            <button type="button" onClick={() => setTheme('dark')} className={`rounded-lg border p-3 text-left ${theme === 'dark' ? 'border-primary bg-primary/5' : ''}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Moon className="h-4 w-4" />
                Dark
              </div>
              <p className="text-xs text-muted-foreground">Dimmed UI that is easier at night.</p>
            </button>
            <button type="button" onClick={() => setTheme('system')} className={`rounded-lg border p-3 text-left ${theme === 'system' ? 'border-primary bg-primary/5' : ''}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Monitor className="h-4 w-4" />
                System
              </div>
              <p className="text-xs text-muted-foreground">Follow your device theme setting.</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
