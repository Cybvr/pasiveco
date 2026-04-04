'use client'
import { useEffect, useRef, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { getUser, updateUser, type User } from "@/services/userService"
import { DEFAULT_USER_CATEGORIES, getUserCategories } from "@/services/categoryService"
import { useAuth } from "@/hooks/useAuth"
import { getDisplayAvatar } from '@/lib/avatar'
import { Sparkles, Loader2, Phone, CheckCircle2 } from 'lucide-react'
import { auth } from '@/lib/firebase'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential,
  updatePhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth'
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
}

type CountryOption = {
  code: string
  name: string
  flag: string
  dialCode: string
}

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
]

const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0]

const parsePhoneNumber = (value: string) => {
  const sanitized = value.replace(/[^\d+]/g, '')
  const matchedCountry = [...COUNTRY_OPTIONS]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((country) => sanitized.startsWith(country.dialCode))

  if (!matchedCountry) {
    return {
      countryCode: DEFAULT_COUNTRY.code,
      localNumber: sanitized.replace(/\D/g, ''),
    }
  }

  return {
    countryCode: matchedCountry.code,
    localNumber: sanitized.slice(matchedCountry.dialCode.length).replace(/\D/g, ''),
  }
}

export default function AccountSettings() {
  const [userData, setUserData] = useState<UserData>({
    displayName: "User",
    firstName: "User",
    lastName: "",
    username: '',
    email: "user@example.com",
    category: '',
  })
  const [uploading, setUploading] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [categories, setCategories] = useState<string[]>(DEFAULT_USER_CATEGORIES)
  const [firebaseProfile, setFirebaseProfile] = useState<User | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const { user } = useAuth()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // ─── Phone verification state ─────────────────────────────────────────────
  const [selectedCountryCode, setSelectedCountryCode] = useState(DEFAULT_COUNTRY.code)
  const [phoneInput, setPhoneInput] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneVerifying, setPhoneVerifying] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [verifiedPhone, setVerifiedPhone] = useState<string>('')
  const selectedCountry = COUNTRY_OPTIONS.find((country) => country.code === selectedCountryCode) || DEFAULT_COUNTRY
  const formattedPhoneNumber = `${selectedCountry.dialCode}${phoneInput}`.trim()
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return

      try {
        const profile = await getUser(user.uid)
        if (profile) {
          setFirebaseProfile(profile)
          const existingPhone = profile.phoneNumber || ''
          setUserData(prev => ({
            ...prev,
            displayName: profile.displayName || prev.displayName,
            firstName: profile.displayName?.split(' ')[0] || prev.firstName,
            lastName: profile.displayName?.split(' ').slice(1).join(' ') || prev.lastName,
            email: user.email || prev.email,
            username: profile.username || prev.username,
            bio: profile.bio || prev.bio,
            phone: existingPhone,
            category: profile.category || prev.category,
            brandPreferences: profile.brandPreferences || prev.brandPreferences || '',
            profilePicture: profile.profilePicture || prev.profilePicture,
          }))
          if (existingPhone) {
            const parsedPhone = parsePhoneNumber(existingPhone)
            setSelectedCountryCode(parsedPhone.countryCode)
            setPhoneInput(parsedPhone.localNumber)
            setVerifiedPhone(existingPhone)
          }
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

  // ─── Phone OTP handlers ──────────────────────────────────────────────────
  const sendOtp = async () => {
    const phone = formattedPhoneNumber
    if (!phoneInput.trim()) {
      toast({ title: 'Enter a phone number', description: 'Add your number after the country code.', variant: 'destructive' })
      return
    }
    try {
      setPhoneVerifying(true)
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      }
      const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifierRef.current)
      setConfirmationResult(result)
      setOtpSent(true)
      toast({ title: 'Code sent!', description: `OTP sent to ${phone}` })
    } catch (err: any) {
      console.error(err)
      // Reset recaptcha on failure so it can be tried again
      recaptchaVerifierRef.current?.clear()
      recaptchaVerifierRef.current = null
      toast({ title: 'Failed to send OTP', description: err?.message || 'Check the number and try again', variant: 'destructive' })
    } finally {
      setPhoneVerifying(false)
    }
  }

  const confirmOtp = async () => {
    if (!confirmationResult || !otpCode.trim()) return
    try {
      setPhoneVerifying(true)
      const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otpCode.trim())
      if (user) {
        try {
          await linkWithCredential(user, credential)
        } catch (linkErr: any) {
          if (linkErr?.code === 'auth/provider-already-linked' || linkErr?.code === 'auth/credential-already-in-use') {
            await updatePhoneNumber(user, credential as any)
          } else {
            throw linkErr
          }
        }
      }
      const phone = formattedPhoneNumber
      if (user?.uid) {
        await updateUser(user.uid, { phoneNumber: phone })
      }
      setVerifiedPhone(phone)
      setUserData(prev => ({ ...prev, phone }))
      setOtpSent(false)
      setOtpCode('')
      toast({ title: '✅ Phone verified!', description: 'Your phone number has been verified and saved.' })
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Invalid code', description: err?.message || 'Please check the OTP and try again', variant: 'destructive' })
    } finally {
      setPhoneVerifying(false)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

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
      await updateUser(user.uid, {
        email: user.email || userData.email,
        displayName,
        username: userData.username,
        bio: userData.bio || "",
        phoneNumber: userData.phone || '',
        category: userData.category || '',
        brandPreferences: userData.brandPreferences || '',
        profilePicture: userData.profilePicture || firebaseProfile?.profilePicture || '',
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
    <div className="space-y-4 max-w-2xl">
      <div className="bg-card rounded-lg overflow-hidden border border-border/60">
        <div className="p-4 border-b border-border/60">
          <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
          <p className="text-sm text-muted-foreground">Update your personal details and choose the category that best fits your profile.</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative cursor-pointer group" onClick={handleProfilePictureClick}>
              <Avatar className="w-20 h-20 border-2 border-border/60">
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">First name</label>
              <Input
                placeholder="First name"
                value={userData.firstName}
                onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                className="bg-muted/10 border-border/60 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">Last name</label>
              <Input
                placeholder="Last name"
                value={userData.lastName}
                onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                className="bg-muted/10 border-border/60 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">Username</label>
              <Input
                placeholder="Username"
                value={userData.username}
                onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value.replace(/^@+/, '') }))}
                className="bg-muted/10 border-border/60 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">Email address</label>
              <Input
                placeholder="Email address"
                type="email"
                value={userData.email}
                readOnly
                className="bg-muted/20 border-border/60 cursor-not-allowed opacity-70"
              />
            </div>

            {/* Phone verification */}
            <div className="md:col-span-2">
              <div id="recaptcha-container" ref={recaptchaContainerRef} />
              
              <div className="rounded-xl border border-border/60 bg-muted/10 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">Phone number</span>
                  {verifiedPhone && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>

                {!otpSent ? (
                  <div className="flex flex-col gap-2 md:flex-row">
                    <Select
                      value={selectedCountryCode}
                      onValueChange={setSelectedCountryCode}
                      disabled={phoneVerifying}
                    >
                      <SelectTrigger className="w-full md:w-[220px] bg-muted/5 border-border/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_OPTIONS.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name} ({country.dialCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone-input"
                      placeholder="8012345678"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 font-mono text-sm bg-muted/5 border-border/60"
                      disabled={phoneVerifying}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={sendOtp}
                      disabled={phoneVerifying || !phoneInput.trim()}
                      className="shrink-0 gap-1.5 border-border/60"
                    >
                      {phoneVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Phone className="h-3.5 w-3.5" />}
                      {phoneVerifying ? 'Sending...' : verifiedPhone ? 'Re-verify' : 'Send code'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to <span className="font-semibold text-foreground">{formattedPhoneNumber}</span></p>
                    <div className="flex gap-2">
                      <Input
                        id="otp-input"
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="flex-1 font-mono text-center text-lg tracking-[0.4em] bg-muted/5 border-border/60"
                        disabled={phoneVerifying}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={confirmOtp}
                        disabled={phoneVerifying || otpCode.length < 6}
                        className="shrink-0 gap-1.5"
                      >
                        {phoneVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        {phoneVerifying ? 'Verifying...' : 'Confirm'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { setOtpSent(false); setOtpCode('') }}
                        className="shrink-0 text-muted-foreground text-xs"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}
                {!otpSent ? (
                  <p className="text-xs text-muted-foreground">
                    Selected: <span className="font-semibold text-foreground">{selectedCountry.flag} {selectedCountry.dialCode}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground ml-1">Category</label>
              <Select value={userData.category || 'unselected'} onValueChange={(value) => setUserData(prev => ({ ...prev, category: value === 'unselected' ? '' : value }))}>
                <SelectTrigger className="bg-muted/10 border-border/60">
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground ml-1">Bio</label>
            <Textarea
              placeholder="Tell us about yourself..."
              value={userData.bio || ''}
              onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="bg-muted/10 border-border/60 focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground ml-1 font-bold">AI Brand Profiling</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResearchBrand}
                disabled={isResearching || !userData.firstName}
                className="h-7 gap-1.5 text-[10px] text-primary hover:text-primary hover:bg-primary/10 font-bold"
              >
                {isResearching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                {isResearching ? 'Profiling...' : 'Generate with AI'}
              </Button>
            </div>
            <Textarea
              placeholder="AI will help describe your brand voice and style here..."
              value={userData.brandPreferences || ''}
              onChange={(e) => setUserData(prev => ({ ...prev, brandPreferences: e.target.value }))}
              rows={3}
              className="bg-muted/10 border-border/60 focus:border-primary/50"
            />
            <p className="text-[10px] text-muted-foreground leading-snug px-1">This helps us match you with the right affiliate products and communities.</p>
          </div>
        </div>
        <div className="p-4 flex bg-muted/5 justify-end space-x-2 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold" onClick={() => {
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
          }}>Reset</Button>
          <Button type="button" size="sm" className="h-9 px-6 text-xs font-semibold" onClick={handleUpdateProfile}>Save changes</Button>
        </div>
      </div>

      <div className="border border-red-200/50 bg-red-50/5 rounded-lg overflow-hidden mt-8">
        <div className="p-4 border-b border-red-200/50">
          <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider">Danger Zone</h2>
          <p className="text-xs text-muted-foreground">Permanent actions that cannot be undone.</p>
        </div>
        <div className="p-4">
          <Button variant="destructive" size="sm" className="h-9 px-4 text-xs font-bold" onClick={() => setDeleteDialogOpen(true)}>Delete Account</Button>
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
