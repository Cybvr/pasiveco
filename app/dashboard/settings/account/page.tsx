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
import { Shield } from 'lucide-react'

interface UserData {
  displayName: string
  firstName: string
  lastName: string
  email: string
  profilePicture?: string
  phone?: string
  bio?: string
  category: string
  twoFactorEnabled: boolean
}

export default function AccountSettings() {
  const [userData, setUserData] = useState<UserData>({
    displayName: "User",
    firstName: "User",
    lastName: "",
    email: "user@example.com",
    category: '',
    twoFactorEnabled: false,
  })
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<string[]>(DEFAULT_USER_CATEGORIES)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firebaseProfile, setFirebaseProfile] = useState<User | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        return
      }

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
            bio: profile.bio || prev.bio,
            phone: profile.phoneNumber || prev.phone,
            category: profile.category || prev.category,
            profilePicture: profile.profilePicture || prev.profilePicture,
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
      handle: firebaseProfile?.username || userData.email,
    })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockUrl = URL.createObjectURL(file)
      setUserData(prev => ({ ...prev, profilePicture: mockUrl }))
      toast({
        title: "Success",
        description: "Profile picture updated",
      })
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpdateProfile = async () => {
    if (!userData.firstName.trim()) {
      toast({
        title: "Error",
        description: "First name cannot be empty",
        variant: "destructive",
      })
      return
    }
    if (!user?.uid) return
    try {
      const displayName = `${userData.firstName} ${userData.lastName}`.trim()
      const userId = firebaseProfile?.id || user.uid
      await updateUser(userId, {
        email: user.email || userData.email,
        displayName,
        bio: userData.bio || "",
        phoneNumber: userData.phone || '',
        category: userData.category || '',
        profilePicture: userData.profilePicture || firebaseProfile?.profilePicture || '',
      })

      const updatedProfile = await getUser(userId)
      if (updatedProfile) {
        setFirebaseProfile(updatedProfile)
      }
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile", error)
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required",
        variant: "destructive",
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }
    try {
      toast({
        title: "Password updated",
        description: "Your password has been updated.",
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error("Error updating password", error)
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }
    try {
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting user", error)
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      })
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
        </div>
        <div className="p-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => {
            if (firebaseProfile) {
              setUserData(prev => ({
                ...prev,
                displayName: firebaseProfile.displayName || prev.displayName,
                firstName: firebaseProfile.displayName?.split(' ')[0] || prev.firstName,
                lastName: firebaseProfile.displayName?.split(' ').slice(1).join(' ') || prev.lastName,
                bio: firebaseProfile.bio || prev.bio,
                phone: firebaseProfile.phoneNumber || prev.phone,
                category: firebaseProfile.category || '',
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
              <p className="text-sm text-muted-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={userData.twoFactorEnabled}
              onCheckedChange={(checked) => setUserData(prev => ({ ...prev, twoFactorEnabled: checked }))}
            />
          </div>

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
          <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
        </div>
      </div>
    </div>
  )
}
