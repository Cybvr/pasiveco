'use client'
import { useEffect, useState } from 'react'
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { getUser, updateUser, type User } from "@/services/userService"
import { useAuth } from "@/hooks/useAuth"
import { Bell } from 'lucide-react'

export default function NotificationsSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sales: true,
    updates: true,
  })

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.uid) return
      try {
        const profile = await getUser(user.uid)
        if (profile?.notificationPreferences) {
          setPreferences(profile.notificationPreferences)
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error)
      } finally {
        setLoading(false)
      }
    }
    void loadPreferences()
  }, [user])

  const handleUpdatePreference = async (key: keyof typeof preferences, value: boolean) => {
    if (!user?.uid) return
    const nextPrefs = { ...preferences, [key]: value }
    setPreferences(nextPrefs)
    try {
      await updateUser(user.uid, { notificationPreferences: nextPrefs })
      toast({ title: "Preferences saved", description: "Your notification settings have been updated." })
    } catch (error) {
      console.error("Error updating notifications", error)
      toast({ title: "Update failed", description: String(error), variant: "destructive" })
    }
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-card rounded-lg overflow-hidden border border-border/60">
        <div className="p-4 border-b border-border/60">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </h2>
          <p className="text-sm text-muted-foreground">Manage how you receive alerts and updates.</p>
        </div>
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates and alerts via email</p>
            </div>
            <Switch
              checked={preferences.email}
              onCheckedChange={(checked) => handleUpdatePreference('email', checked)}
            />
          </div>

          <Separator className="bg-border/60" />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Get notified on your device (PWA)</p>
            </div>
            <Switch
              checked={preferences.push}
              onCheckedChange={(checked) => handleUpdatePreference('push', checked)}
            />
          </div>

          <Separator className="bg-border/60" />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Sales & Payouts</p>
              <p className="text-xs text-muted-foreground">Get notified when you earn and when payouts complete</p>
            </div>
            <Switch
              checked={preferences.sales}
              onCheckedChange={(checked) => handleUpdatePreference('sales', checked)}
            />
          </div>

          <Separator className="bg-border/60" />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Platform Updates</p>
              <p className="text-xs text-muted-foreground">Important news about Pasive features</p>
            </div>
            <Switch
              checked={preferences.updates}
              onCheckedChange={(checked) => handleUpdatePreference('updates', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
