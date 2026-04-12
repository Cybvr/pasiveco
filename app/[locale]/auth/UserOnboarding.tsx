'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createReferral } from '@/services/referralService'
import { useEffect } from 'react'

interface OnboardingProps {
  onComplete: () => void
  userId: string
  displayName?: string
}

const UserOnboarding: React.FC<OnboardingProps> = ({ onComplete, userId, displayName }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [companySize, setCompanySize] = useState('')
  const [industry, setIndustry] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [goal, setGoal] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    const savedRef = localStorage.getItem('ref_inviter_uid')
    if (savedRef) {
      setReferralCode(savedRef)
    }
  }, [])

  const handleNext = () => setCurrentSlide(currentSlide + 1)
  const handleBack = () => setCurrentSlide(currentSlide - 1)
  const handleSubmit = async () => {
    const onboarding = {
      companySize,
      industry: industry === 'other' ? customIndustry : industry,
      goal: goal === 'other' ? customGoal : goal,
      referralSource,
      completedAt: new Date().toISOString(),
      status: 'completed',
    }

    if (referralCode && referralCode !== userId) {
      await createReferral(referralCode, userId, displayName).catch(console.warn)
      localStorage.removeItem('ref_inviter_uid')
    }

    await setDoc(doc(db, 'users', userId), {
      onboarding,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    }, { merge: true })

    onComplete()
  }

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'other', label: 'Other' }
  ]

  const goalOptions = [
    { value: 'Improve marketing campaigns', label: 'Improve marketing campaigns' },
    { value: 'Increase brand awareness', label: 'Increase brand awareness' },
    { value: 'Enhance customer engagement', label: 'Enhance customer engagement' },
    { value: 'Generate leads', label: 'Generate leads' },
    { value: 'Boost sales', label: 'Boost sales' },
    { value: 'other', label: 'Other' }
  ]

  const slides = [
    <div key="slide1" className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tighter">Company Size</h3>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60">Help us understand your organization better</p>
      </div>
      <Select value={companySize} onValueChange={setCompanySize}>
        <SelectTrigger className="w-full h-14 rounded-none border-2 border-muted focus:border-foreground transition-all">
          <SelectValue placeholder="Select company size" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-2">
          <SelectItem value="1-10">1-10 employees</SelectItem>
          <SelectItem value="11-50">11-50 employees</SelectItem>
          <SelectItem value="51-200">51-200 employees</SelectItem>
          <SelectItem value="201+">201+ employees</SelectItem>
        </SelectContent>
      </Select>
    </div>,
    <div key="slide2" className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tighter">Your Industry</h3>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60">Select the industry that best describes your business</p>
      </div>
      <Select value={industry} onValueChange={setIndustry}>
        <SelectTrigger className="w-full h-14 rounded-none border-2 border-muted focus:border-foreground transition-all">
          <SelectValue placeholder="Select industry" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-2">
          {industryOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {industry === 'other' && (
        <div className="mt-4 animate-in fade-in duration-300">
          <Input
            id="custom-industry"
            placeholder="Please specify your industry"
            required
            className="h-14 rounded-none border-2 border-muted focus:border-foreground transition-all"
            value={customIndustry}
            onChange={(e) => setCustomIndustry(e.target.value)}
          />
        </div>
      )}
    </div>,
    <div key="slide3" className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tighter">Primary Goal</h3>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60">What's the main objective you want to achieve?</p>
      </div>
      <Select value={goal} onValueChange={setGoal}>
        <SelectTrigger className="w-full h-14 rounded-none border-2 border-muted focus:border-foreground transition-all">
          <SelectValue placeholder="Select primary goal" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-2">
          {goalOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {goal === 'other' && (
        <div className="mt-4 animate-in fade-in duration-300">
          <Input
            id="custom-goal"
            placeholder="Please specify your goal"
            required
            className="h-14 rounded-none border-2 border-muted focus:border-foreground transition-all"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
          />
        </div>
      )}
    </div>,
    <div key="slide4" className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tighter">Discovery</h3>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60">Help us understand how you found Pasive</p>
      </div>
      <Select value={referralSource} onValueChange={setReferralSource}>
        <SelectTrigger className="w-full h-14 rounded-none border-2 border-muted focus:border-foreground transition-all">
          <SelectValue placeholder="Select source" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-2">
          <SelectItem value="search">Google Search</SelectItem>
          <SelectItem value="social-x">X / Twitter</SelectItem>
          <SelectItem value="social-tiktok">TikTok</SelectItem>
          <SelectItem value="social-instagram">Instagram</SelectItem>
          <SelectItem value="referral">Friend / Colleague</SelectItem>
          <SelectItem value="advertisement">Advertisement</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>,
    <div key="slide5" className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tighter">Referral Code</h3>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60">Were you invited by someone? If so, enter their code below.</p>
      </div>
      <Input
        id="referral-code"
        placeholder="ENTER CODE OR USERNAME"
        className="h-14 rounded-none border-2 border-muted focus:border-foreground transition-all uppercase placeholder:normal-case font-bold"
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value)}
      />
      <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 w-fit">
         <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em]">Optional Attribution</p>
      </div>
    </div>
  ]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-500">
      <div className="bg-card w-full max-w-lg rounded-none border-2 border-border p-8 md:p-12 shadow-[20px_20px_0px_rgba(0,0,0,0.1)] relative overflow-hidden">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
              Welcome <br/><span className="text-primary italic font-light opacity-50">to the house</span>
            </h2>
            <Button variant="ghost" size="icon" onClick={onComplete} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </Button>
          </div>

          <div className="mb-12">
            <div className="h-1 w-full bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-700 ease-in-out"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Step {currentSlide + 1} of {slides.length}</span>
              <span>{Math.round(((currentSlide + 1) / slides.length) * 100)}%</span>
            </div>
          </div>

          <div className="min-h-[220px] animate-in slide-in-from-right-4 duration-300">
            {slides[currentSlide]}
          </div>

          <div className="flex justify-between mt-12 pt-8 border-t border-border">
            {currentSlide > 0 ? (
              <Button variant="outline" onClick={handleBack} className="h-12 px-8 rounded-none font-bold uppercase tracking-widest text-[10px]">
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {currentSlide < slides.length - 1 ? (
              <Button onClick={handleNext} className="h-12 px-10 rounded-none font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-foreground/90">
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="h-12 px-10 rounded-none font-bold uppercase tracking-widest text-[10px] bg-primary text-primary-foreground hover:bg-primary/90">
                Finish Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserOnboarding
