'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Check, Loader2, X } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createReferral } from '@/services/referralService'
import { sanitizeUsername } from '@/lib/username'

interface OnboardingProps {
  onComplete: () => void
  userId: string
  displayName?: string
}

const creatorTypes = [
  { value: 'digital-products', label: 'Digital products' },
  { value: 'coaching', label: 'Coaching or consulting' },
  { value: 'courses', label: 'Courses or workshops' },
  { value: 'physical-goods', label: 'Physical products' },
  { value: 'events', label: 'Events or tickets' },
  { value: 'memberships', label: 'Memberships or community' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Something else' },
]

const goalOptions = [
  { value: 'launch-store', label: 'Launch my store' },
  { value: 'add-products', label: 'Add my first products' },
  { value: 'get-paid', label: 'Start accepting payments' },
  { value: 'grow-audience', label: 'Grow my audience' },
  { value: 'sell-on-social', label: 'Sell from Instagram, TikTok, or WhatsApp' },
  { value: 'manage-community', label: 'Build a paid community' },
  { value: 'other', label: 'Something else' },
]

const discoveryOptions = [
  { value: 'search', label: 'Search' },
  { value: 'referral', label: 'Referral' },
  { value: 'ai', label: 'AI recommendation' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'x', label: 'X / Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'ad', label: 'Ad' },
  { value: 'other', label: 'Other' },
]

const UserOnboarding: React.FC<OnboardingProps> = ({ onComplete, userId, displayName }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [storeName, setStoreName] = useState(displayName || '')
  const [storeHandle, setStoreHandle] = useState('')
  const [creatorType, setCreatorType] = useState('')
  const [customCreatorType, setCustomCreatorType] = useState('')
  const [goal, setGoal] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const savedRef = localStorage.getItem('ref_inviter_uid')
    if (savedRef) setReferralCode(savedRef)
  }, [])

  const cleanHandle = useMemo(() => sanitizeUsername(storeHandle), [storeHandle])

  const saveOnboarding = async (status: 'completed' | 'skipped') => {
    if (isSaving) return

    setIsSaving(true)
    try {
      const resolvedCreatorType = creatorType === 'other' ? customCreatorType.trim() : creatorType
      const resolvedGoal = goal === 'other' ? customGoal.trim() : goal
      const trimmedStoreName = storeName.trim()

      if (status === 'completed' && referralCode && referralCode !== userId) {
        await createReferral(referralCode, userId, displayName).catch(console.warn)
        localStorage.removeItem('ref_inviter_uid')
      }

      await setDoc(doc(db, 'users', userId), {
        ...(trimmedStoreName ? { displayName: trimmedStoreName, storeName: trimmedStoreName } : {}),
        ...(cleanHandle ? { requestedUsername: cleanHandle } : {}),
        onboarding: {
          storeName: trimmedStoreName,
          requestedUsername: cleanHandle,
          creatorType: resolvedCreatorType,
          goal: resolvedGoal,
          referralSource,
          referralCode: referralCode.trim(),
          completedAt: new Date().toISOString(),
          status,
        },
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      onComplete()
    } finally {
      setIsSaving(false)
    }
  }

  const slides = [
    <div key="store" className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight">What should your store be called?</h3>
        <p className="text-sm leading-6 text-muted-foreground">Use your creator name, brand name, or the name customers already know.</p>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="store-name">Store name</Label>
          <Input
            id="store-name"
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            placeholder="e.g. Ada Creates"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store-handle">Preferred link</Label>
          <div className="flex h-12 items-center rounded-md border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
            <span className="shrink-0 text-sm text-muted-foreground">pasive.co/</span>
            <input
              id="store-handle"
              value={storeHandle}
              onChange={(event) => setStoreHandle(event.target.value)}
              placeholder="adacreates"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          {storeHandle ? <p className="text-xs text-muted-foreground">We will save this as your preferred handle: {cleanHandle || '...'}</p> : null}
        </div>
      </div>
    </div>,
    <div key="creator-type" className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight">What are you selling?</h3>
        <p className="text-sm leading-6 text-muted-foreground">This helps Pasive shape your dashboard around the kind of creator store you are building.</p>
      </div>
      <Select value={creatorType} onValueChange={setCreatorType}>
        <SelectTrigger className="h-12 w-full">
          <SelectValue placeholder="Choose the closest fit" />
        </SelectTrigger>
        <SelectContent>
          {creatorTypes.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {creatorType === 'other' && (
        <Input
          value={customCreatorType}
          onChange={(event) => setCustomCreatorType(event.target.value)}
          placeholder="Tell us what you sell"
          className="h-12"
        />
      )}
    </div>,
    <div key="goal" className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight">What do you want to do first?</h3>
        <p className="text-sm leading-6 text-muted-foreground">Pick the thing you came here to get done. You can change direction anytime.</p>
      </div>
      <Select value={goal} onValueChange={setGoal}>
        <SelectTrigger className="h-12 w-full">
          <SelectValue placeholder="Choose your first goal" />
        </SelectTrigger>
        <SelectContent>
          {goalOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {goal === 'other' && (
        <Input
          value={customGoal}
          onChange={(event) => setCustomGoal(event.target.value)}
          placeholder="Tell us your goal"
          className="h-12"
        />
      )}
    </div>,
    <div key="discovery" className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight">How did you find Pasive?</h3>
        <p className="text-sm leading-6 text-muted-foreground">Quick attribution, then you are in.</p>
      </div>
      <Select value={referralSource} onValueChange={setReferralSource}>
        <SelectTrigger className="h-12 w-full">
          <SelectValue placeholder="Select a source" />
        </SelectTrigger>
        <SelectContent>
          {discoveryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="space-y-2">
        <Label htmlFor="referral-code">Referral code</Label>
        <Input
          id="referral-code"
          placeholder="Optional"
          className="h-12"
          value={referralCode}
          onChange={(event) => setReferralCode(event.target.value)}
        />
      </div>
    </div>,
  ]

  const isLastSlide = currentSlide === slides.length - 1
  const progress = ((currentSlide + 1) / slides.length) * 100

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Welcome to Pasive</p>
            <h2 className="text-lg font-semibold">Set up your creator store</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Skip onboarding"
            disabled={isSaving}
            onClick={() => saveOnboarding('skipped')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Step {currentSlide + 1} of {slides.length}</span>
            <button
              type="button"
              className="font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              disabled={isSaving}
              onClick={() => saveOnboarding('skipped')}
            >
              Skip for now
            </button>
          </div>

          <div className="min-h-[300px]">{slides[currentSlide]}</div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2"
              disabled={currentSlide === 0 || isSaving}
              onClick={() => setCurrentSlide((slide) => Math.max(0, slide - 1))}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {isLastSlide ? (
              <Button
                type="button"
                className="h-11 gap-2"
                disabled={isSaving}
                onClick={() => saveOnboarding('completed')}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Finish
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 gap-2"
                disabled={isSaving}
                onClick={() => setCurrentSlide((slide) => Math.min(slides.length - 1, slide + 1))}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserOnboarding
