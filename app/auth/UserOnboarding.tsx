'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

interface OnboardingProps {
  onComplete: () => void
  userId: string
}

const UserOnboarding: React.FC<OnboardingProps> = ({ onComplete, userId }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [companySize, setCompanySize] = useState('')
  const [industry, setIndustry] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [goal, setGoal] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [referralSource, setReferralSource] = useState('')

  const handleNext = () => setCurrentSlide(currentSlide + 1)
  const handleBack = () => setCurrentSlide(currentSlide - 1)
  const handleSubmit = async () => {
    const userData = {
      companySize,
      industry: industry === 'other' ? customIndustry : industry,
      goal: goal === 'other' ? customGoal : goal,
      referralSource
    }
    console.log(userData)
    // Save to Firestore
    await addDoc(collection(db, 'company'), { 
      ...userData, 
      userId,
      createdAt: new Date()
    })
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
    <div key="slide1" className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Company Size</h3>
      <p className="text-sm text-muted-foreground">Help us understand your organization better</p>
      <Select value={companySize} onValueChange={setCompanySize}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select company size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1-10">1-10 employees</SelectItem>
          <SelectItem value="11-50">11-50 employees</SelectItem>
          <SelectItem value="51-200">51-200 employees</SelectItem>
          <SelectItem value="201+">201+ employees</SelectItem>
        </SelectContent>
      </Select>
    </div>,
    <div key="slide2" className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Industry</h3>
      <p className="text-sm text-muted-foreground">Select the industry that best describes your business</p>
      <Select value={industry} onValueChange={setIndustry}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select industry" />
        </SelectTrigger>
        <SelectContent>
          {industryOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {industry === 'other' && (
        <div className="mt-4">
          <Input
            id="custom-industry"
            placeholder="Please specify your industry"
            required
            value={customIndustry}
            onChange={(e) => setCustomIndustry(e.target.value)}
          />
        </div>
      )}
    </div>,
    <div key="slide3" className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Primary Goal</h3>
      <p className="text-sm text-muted-foreground">What's the main objective you want to achieve?</p>
      <Select value={goal} onValueChange={setGoal}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select primary goal" />
        </SelectTrigger>
        <SelectContent>
          {goalOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {goal === 'other' && (
        <div className="mt-4">
          <Input
            id="custom-goal"
            placeholder="Please specify your goal"
            required
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
          />
        </div>
      )}
    </div>,
    <div key="slide4" className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">How did you hear about us?</h3>
      <p className="text-sm text-muted-foreground">Help us understand how you found Pasive</p>
      <Select value={referralSource} onValueChange={setReferralSource}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="search">Google</SelectItem>
          <SelectItem value="social">Twitter</SelectItem>
          <SelectItem value="social">Tiktok</SelectItem>
          <SelectItem value="social">Instagram</SelectItem>
          <SelectItem value="referral">Friend/Colleague</SelectItem>
          <SelectItem value="advertisement">Advertisement</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 w-full text-center">Welcome to Pasive</h2>
          <Button variant="ghost" size="icon" onClick={onComplete} className="text-gray-500 hover:text-gray-700 absolute right-4 top-4">
            <X size={20} />
          </Button>
        </div>
        <div className="mb-6">
          <div className="h-2 w-full bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            ></div>
          </div>
        </div>
        {slides[currentSlide]}
        <div className="flex justify-between mt-8">
          {currentSlide > 0 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {currentSlide < slides.length - 1 ? (
            <Button onClick={handleNext} className="ml-auto">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="ml-auto">
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserOnboarding
