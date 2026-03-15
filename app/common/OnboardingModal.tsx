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
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save your profile")
      return
    }

    setIsSaving(true)
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        onboarding: {
          ...formData,
          completedAt: new Date().toISOString(),
          status: 'completed'
        },
        // Also update root level if preferred
        gender: formData.gender,
        dateOfBirth: formData.dob,
        phoneNumber: formData.phoneNumber,
        referralSource: formData.source,
        onboardingCompleted: true
      })

      toast.success("Profile updated successfully!")
      onClose()
    } catch (error) {
      console.error("Error saving onboarding data:", error)
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl border-none">
        <div className="p-8 space-y-6 bg-card">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold">
              Let’s quickly cover a few basics
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
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OnboardingModal