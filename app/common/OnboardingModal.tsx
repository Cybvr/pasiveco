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
        <div className="p-8 space-y-6 bg-card">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold">
              Let&apos;s do a little housekeeping
            </DialogTitle>
            <DialogDescription className="text-sm">
              We&apos;d like to get a little more info about you
            </DialogDescription>
          </DialogHeader>

          <hr className="border-border" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">Gender</Label>
              <Select onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                <SelectTrigger className="w-full h-11">
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
              <Label className="font-medium">Date Of Birth</Label>
              <Input
                type="date"
                className="w-full h-11"
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">
              Contact Number For Internal Comms And Reminders
            </Label>
            <Input
              placeholder="2348012345678"
              className="w-full h-11"
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-medium">How Did You Hear About Pasive?</Label>
            <Select onValueChange={(v) => setFormData({ ...formData, source: v })}>
              <SelectTrigger className="w-full h-11">
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
            className="w-full h-12 font-semibold rounded-lg text-base transition-colors"
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