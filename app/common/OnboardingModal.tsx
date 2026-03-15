"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar as CalendarIcon, ChevronDown } from "lucide-react"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    gender: "",
    dob: "",
    phoneNumber: "",
    source: "",
  })

  const handleSave = () => {
    console.log("Saving onboarding data:", formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl border-none">
        <div className="p-8 space-y-6 bg-white">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-[#1A1F36]">
              Let&apos;s do a little housekeeping
            </DialogTitle>
            <DialogDescription className="text-[#697386] text-sm">
              We&apos;d like to get a little more info about you
            </DialogDescription>
          </DialogHeader>

          <hr className="border-gray-100" />

          {/* Info Banner */}
          <div className="bg-[#FFF9EA] rounded-lg p-5 flex gap-4 border border-[#FEEDC3]">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-[#9A6B16]" />
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-[#825D15] text-sm">Just a few things we need from you</h4>
              <ul className="text-sm text-[#825D15] space-y-3 list-disc pl-1">
                <li className="leading-tight">You need to update your gender and date of birth.</li>
                <li className="leading-tight">You need to update your contact number for internal comms and reminders.</li>
                <li className="leading-tight">We would like to know how you heard about Pasive.</li>
              </ul>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#1A1F36] font-medium">Gender</Label>
              <Select onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                <SelectTrigger className="w-full bg-white border-gray-200 h-11">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#1A1F36] font-medium">Date Of Birth</Label>
              <div className="relative">
                <Input
                  type="date"
                  placeholder="dd/mm/yyyy"
                  className="w-full h-11 border-gray-200 pr-10 appearance-none"
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#1A1F36] font-medium">
              Contact Number For Internal Comms And Reminders
            </Label>
            <Input
              placeholder="2348012345678"
              className="w-full h-11 border-gray-200"
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#1A1F36] font-medium">
              How Did You Hear About Pasive?
            </Label>
            <Select onValueChange={(v) => setFormData({ ...formData, source: v })}>
              <SelectTrigger className="w-full bg-white border-gray-200 h-11">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">X (formerly Twitter)</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="friend">From a Friend</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full h-12 bg-[#5A1448] hover:bg-[#4A103B] text-white font-semibold rounded-lg text-base mt-4 transition-colors"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OnboardingModal
