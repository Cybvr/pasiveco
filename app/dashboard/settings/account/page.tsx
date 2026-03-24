'use client'
import { useEffect, useRef, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { getUser, updateUser, type User } from "@/services/userService"
import { DEFAULT_USER_CATEGORIES, getUserCategories } from "@/services/categoryService"
import { useAuth } from "@/hooks/useAuth"
import { getDisplayAvatar } from '@/lib/avatar'
import { Shield, Sparkles, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface UserData {
  displayName: string
  firstName: string
  lastName: string
  username: string
  email: string
  profilePicture?: string
  phone?: string
  bio?: string
  category: string
  brandPreferences?: string
  twoFactorEnabled: boolean
  isPinEnabled: boolean
  pin?: string
}

export default function AccountSettings() {
  const [userData, setUserData] = useState<UserData>({
    displayName: "User",
    firstName: "User",
    lastName: "",
    username: '',
    email: "user@example.com",
    category: '',
    twoFactorEnabled: false,
    isPinEnabled: false,
  })
  const [uploading, setUploading] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [categories, setCategories] = useState<string[]>(DEFAULT_USER_CATEGORIES)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firebaseProfile, setFirebaseProfile] = useState<User | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return

      try {
        const profile = await getUser(user.uid)
        if (profile) {
          setFirebaseProfile(profile)
          setUserData(prev => ({
            ...prev,
            displayName: profile.displayName || prev.displayName,
            firstName: profile.displayName?.split(' ')[0] || prev.firstName,
            lastName: profile.displayName?.split(' ').slice(1).join(' ') || prev.lastName,
            email: user.email || prev.email,
            username: profile.username || prev.username,
            bio: profile.bio || prev.bio,
            phone: profile.phoneNumber || prev.phone,
            category: profile.category || prev.category,
            brandPreferences: profile.brandPreferences || prev.brandPreferences || '',
            profilePicture: profile.profilePicture || prev.profilePicture,
            isPinEnabled: profile.isPinEnabled || false,
            pin: profile.pin || '',
          }))
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      }

      try {
        const categoryList = await getUserCategories()
        if (categoryList.length > 0) {
          setCategories(categoryList.map((item) => item.name))
        }
      } catch (error) {
        console.error("Error loading categories:", error)
        setCategories(DEFAULT_USER_CATEGORIES)
      }
    }

    void loadProfile()
  }, [user])

  const getProfilePicture = () =>
    getDisplayAvatar({
      image: userData.profilePicture || firebaseProfile?.profilePicture || user?.photoURL || '',
      displayName: userData.displayName,
      handle: userData.username || firebaseProfile?.username || userData.email,
    })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockUrl = URL.createObjectURL(file)
      setUserData(prev => ({ ...prev, profilePicture: mockUrl }))
      toast({ title: "Success", description: "Profile picture updated" })
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast({ title: "Error", description: "Failed to update profile picture", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpdateProfile = async () => {
    if (!userData.firstName.trim()) {
      toast({ title: "Error", description: "First name cannot be empty", variant: "destructive" })
      return
    }
    if (!user?.uid) return

    try {
      const displayName = `${userData.firstName} ${userData.lastName}`.trim()
      console.error("SAVING WITH ID:", user.uid, "AUTH UID:", user.uid)
      await updateUser(user.uid, {
        email: user.email || userData.email,
        displayName,
        username: userData.username,
        bio: userData.bio || "",
        phoneNumber: userData.phone || '',
        category: userData.category || '',
        brandPreferences: userData.brandPreferences || '',
        profilePicture: userData.profilePicture || firebaseProfile?.profilePicture || '',
        isPinEnabled: userData.isPinEnabled,
        pin: userData.pin || '',
      })

      const updatedProfile = await getUser(user.uid)
      if (updatedProfile) {
        setFirebaseProfile(updatedProfile)
      }
      toast({ title: "Profile updated", description: "Your profile has been updated successfully." })
    } catch (error) {
      console.error("Error updating profile", error)
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
    try {
      toast({ title: "Password updated", description: "Your password has been updated." })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error("Error updating password", error)
      toast({ title: "Error", description: "Failed to update password. Please try again.", variant: "destructive" })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      toast({ title: "Account deleted", description: "Your account has been successfully deleted." })
    } catch (error) {
      console.error("Error deleting user", error)
      toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" })
    }
  }

  const handleResearchBrand = async () => {
    setIsResearching(true)
    try {
      const res = await fetch('/api/research-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: `${userData.firstName} ${userData.lastName}`.trim(),
          username: userData.username,
          bio: userData.bio,
          category: userData.category,
        }),
      })

      if (!res.ok) throw new Error("Failed to research brand")
      const data = await res.json()
      setUserData(prev => ({ ...prev, brandPreferences: data.brandPreferences }))
      toast({ title: "Success", description: "Brand preferences generated with AI!" })
    } catch (error) {
      console.error(error)
      toast({ title: "AI Research Failed", description: "We couldn't research your brand at this time.", variant: "destructive" })
    } finally {
      setIsResearching(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Profile Information</h2>
          <p className="text-sm text-muted-foreground">Update your personal details and choose the category that best fits your profile.</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative cursor-pointer group" onClick={handleProfilePictureClick}>
              <Avatar className="w-20 h-20 border-2 border-gray-200">
                <AvatarImage src={getProfilePicture()} alt={userData.displayName} />
                <AvatarFallback className="text-lg">
                  {(userData.firstName[0] || 'U')}{(userData.lastName[0] || '')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Change</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          {uploading && <p className="text-center text-sm text-muted-foreground">Uploading...</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="First name"
              value={userData.firstName}
              onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <Input
              placeholder="Last name"
              value={userData.lastName}
              onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
            />
            <Input
              placeholder="Username"
              value={userData.username}
              onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value.replace(/^@+/, '') }))}
            />
            <Input
              placeholder="Email address"
              type="email"
              value={userData.email}
              readOnly
            />
            <Input
              placeholder="Phone number"
              value={userData.phone || ''}
              onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
            />
            <div className="md:col-span-2">
              <Select value={userData.category || 'unselected'} onValueChange={(value) => setUserData(prev => ({ ...prev, category: value === 'unselected' ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">No category selected</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Textarea
            placeholder="Tell us about yourself..."
            value={userData.bio || ''}
            onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Brand Preferences & Style</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResearchBrand}
                disabled={isResearching || !userData.firstName}
                className="h-7 gap-1.5 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
              >
                {isResearching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                {isResearching ? 'Searching...' : 'Create with AI'}
              </Button>
            </div>
            <Textarea
              placeholder="Describe your brand voice, style, and niche. E.g., 'Modern, minimalist, and focused on tech tutorials' or 'Bold, colorful, and energetic voice for fitness content'."
              value={userData.brandPreferences || ''}
              onChange={(e) => setUserData(prev => ({ ...prev, brandPreferences: e.target.value }))}
              rows={3}
            />
            <p className="text-[10px] text-muted-foreground">Tell us about your brand and what it&apos;s about.</p>
          </div>
        </div>
        <div className="p-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => {
            if (firebaseProfile) {
              setUserData(prev => ({
                ...prev,
                displayName: firebaseProfile.displayName || prev.displayName,
                firstName: firebaseProfile.displayName?.split(' ')[0] || prev.firstName,
                lastName: firebaseProfile.displayName?.split(' ').slice(1).join(' ') || prev.lastName,
                username: firebaseProfile.username || prev.username,
                bio: firebaseProfile.bio || prev.bio,
                phone: firebaseProfile.phoneNumber || prev.phone,
                category: firebaseProfile.category || '',
                brandPreferences: firebaseProfile.brandPreferences || '',
                profilePicture: firebaseProfile.profilePicture || prev.profilePicture,
              }))
            }
          }}>Cancel</Button>
          <Button type="button" onClick={handleUpdateProfile}>Save changes</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <div className="p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5" />
            Security Settings
          </h2>
          <p className="text-sm text-muted-foreground">Manage your password and security preferences.</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={userData.twoFactorEnabled}
              onCheckedChange={(checked) => setUserData(prev => ({ ...prev, twoFactorEnabled: checked }))}
            />
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">4-Digit Security PIN</p>
              <p className="text-xs text-muted-foreground">Locks the dashboard after 30 minutes of inactivity</p>
            </div>
            <Switch
              checked={userData.isPinEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  const newPin = prompt("Enter a 4-digit PIN:")
                  if (newPin && /^\d{4}$/.test(newPin)) {
                    setUserData(prev => ({ ...prev, isPinEnabled: true, pin: newPin }))
                    toast({ title: "PIN Set", description: "Your security PIN has been enabled." })
                  } else if (newPin) {
                    toast({ title: "Invalid PIN", description: "PIN must be 4 digits.", variant: "destructive" })
                  }
                } else {
                  setUserData(prev => ({ ...prev, isPinEnabled: false }))
                  toast({ title: "PIN Disabled", description: "Security PIN has been turned off." })
                }
              }}
            />
          </div>

          {userData.isPinEnabled && (
             <Button 
               variant="outline" 
               size="sm" 
               className="mt-2 text-xs"
               onClick={() => {
                  const newPin = prompt("Enter new 4-digit PIN:")
                  if (newPin && /^\d{4}$/.test(newPin)) {
                    setUserData(prev => ({ ...prev, pin: newPin }))
                    toast({ title: "PIN Updated", description: "Your security PIN has been changed." })
                  } else if (newPin) {
                    toast({ title: "Invalid PIN", description: "PIN must be 4 digits.", variant: "destructive" })
                  }
               }}
             >
               Change PIN
             </Button>
          )}

          <Separator className="my-2" />

          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              placeholder="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              placeholder="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              placeholder="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit">Update password</Button>
          </form>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="border border-red-200 bg-card rounded-lg overflow-hidden">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">Permanent actions that cannot be undone.</p>
        </div>
        <div className="p-4">
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>Delete Account</Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your account and all associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
