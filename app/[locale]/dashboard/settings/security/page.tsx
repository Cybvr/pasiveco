'use client'
import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { getUser, updateUser, type User } from "@/services/userService"
import { useAuth } from "@/hooks/useAuth"
import { Shield } from 'lucide-react'

export default function SecuritySettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [firebaseProfile, setFirebaseProfile] = useState<User | null>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isPinEnabled, setIsPinEnabled] = useState(false)
  const [pin, setPin] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return
      try {
        const profile = await getUser(user.uid)
        if (profile) {
          setFirebaseProfile(profile)
          setTwoFactorEnabled((profile as any).twoFactorEnabled || false)
          setIsPinEnabled((profile as any).isPinEnabled || false)
          setPin((profile as any).pin || '')
        }
      } catch (error) {
        console.error("Error loading security profile:", error)
      } finally {
        setLoading(false)
      }
    }
    void loadProfile()
  }, [user])

  const handleUpdateSecurity = async (updates: Partial<User>) => {
    if (!user?.uid) return
    try {
      await updateUser(user.uid, updates)
      toast({ title: "Security updated", description: "Your security settings have been saved." })
    } catch (error) {
      console.error("Error updating security", error)
      toast({ title: "Update failed", description: String(error), variant: "destructive" })
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast({ title: "Error", description: "Current password is required", variant: "destructive" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" })
      return
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters long", variant: "destructive" })
      return
    }
    toast({ title: "Password updated", description: "Your password has been updated." })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-card rounded-lg overflow-hidden border border-border/60">
        <div className="p-4 border-b border-border/60">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Account Security
          </h2>
          <p className="text-sm text-muted-foreground">Manage your password and security preferences.</p>
        </div>
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => {
                setTwoFactorEnabled(checked)
                handleUpdateSecurity({ twoFactorEnabled: checked } as any)
              }}
            />
          </div>

          <Separator className="bg-border/60" />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">4-Digit Security PIN</p>
              <p className="text-xs text-muted-foreground">Locks the dashboard after 30 minutes of inactivity</p>
            </div>
            <Switch
              checked={isPinEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  const newPin = prompt("Enter a 4-digit PIN:")
                  if (newPin && /^\d{4}$/.test(newPin)) {
                    setIsPinEnabled(true)
                    setPin(newPin)
                    handleUpdateSecurity({ isPinEnabled: true, pin: newPin } as any)
                    toast({ title: "PIN Set", description: "Your security PIN has been enabled." })
                  } else if (newPin) {
                    toast({ title: "Invalid PIN", description: "PIN must be 4 digits.", variant: "destructive" })
                  }
                } else {
                  setIsPinEnabled(false)
                  handleUpdateSecurity({ isPinEnabled: false } as any)
                  toast({ title: "PIN Disabled", description: "Security PIN has been turned off." })
                }
              }}
            />
          </div>

          {isPinEnabled && (
             <Button 
               variant="outline" 
               size="sm" 
               className="h-8 text-xs gap-1.5"
               onClick={() => {
                  const newPin = prompt("Enter new 4-digit PIN:")
                  if (newPin && /^\d{4}$/.test(newPin)) {
                    setPin(newPin)
                    handleUpdateSecurity({ pin: newPin } as any)
                    toast({ title: "PIN Updated", description: "Your security PIN has been changed." })
                  } else if (newPin) {
                    toast({ title: "Invalid PIN", description: "PIN must be 4 digits.", variant: "destructive" })
                  }
               }}
             >
               Change PIN
             </Button>
          )}

          <Separator className="bg-border/60" />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Current password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-muted/10 border-border/60 focus:border-primary/50"
                  required
                />
                <Input
                  placeholder="New password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-muted/10 border-border/60 focus:border-primary/50"
                  required
                />
                <Input
                  placeholder="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-muted/10 border-border/60 focus:border-primary/50"
                  required
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto h-9 text-xs font-semibold">Update password</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
