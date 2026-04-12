'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const themeOptions = [
  {
    value: 'light',
    title: 'Light mode',
    description: 'Use a bright interface for daytime browsing and editing.',
    icon: Sun,
  },
  {
    value: 'dark',
    title: 'Dark mode',
    description: 'Use a darker interface that is easier on the eyes in low light.',
    icon: Moon,
  },
] as const

export default function AppearancePage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeTheme = mounted ? theme : 'dark'

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose how Pasive looks while you manage your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isActive = activeTheme === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent/40',
                  isActive && 'border-primary bg-primary/5 shadow-sm',
                )}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-medium">{option.title}</h2>
                    {isActive && <span className="text-xs font-medium text-primary">Active</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}>
          Switch to {activeTheme === 'dark' ? 'light' : 'dark'} mode
        </Button>
      </div>
    </div>
  )
}
