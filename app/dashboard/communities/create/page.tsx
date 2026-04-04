"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, Info, Camera, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/useAuth"
import { createCommunity } from "@/services/communityService"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateCommunityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    privacy: "public" as "public" | "private",
    category: "other",
    price: 0,
    isPaid: false,
    image: "",
    bannerImage: ""
  })

  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File, type: 'image' | 'bannerImage') => {
    const storage = getStorage()
    const fileRef = ref(storage, `communities/new/${type}_${uuidv4()}`)
    try {
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      setFormData(prev => ({ ...prev, [type]: url }))
      toast.success(`${type === 'image' ? 'Logo' : 'Banner'} uploaded`)
    } catch (err) {
      console.error(err)
      toast.error('Upload failed')
    }
  }

  const handleGenerateAIImage = async (type: 'image' | 'bannerImage') => {
    if (!formData.name) {
      toast.error('Enter a space name first')
      return
    }
    if (type === 'bannerImage') setIsGeneratingBanner(true)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.name,
          productDescription: formData.description || `A space called ${formData.name}`,
          aspectRatio: type === 'bannerImage' ? '16:9' : '1:1'
        }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Image generation failed')
      }
      const data = await response.json()
      if (data.base64Image) {
        const res = await fetch(`data:image/jpeg;base64,${data.base64Image}`)
        const blob = await res.blob()
        const file = new File([blob], `ai-gen-${uuidv4()}.jpg`, { type: 'image/jpeg' })
        await handleFileUpload(file, type)
        toast.success(`${type === 'image' ? 'Logo' : 'Banner'} generated`)
      } else {
        throw new Error('No image returned')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate image')
    } finally {
      if (type === 'bannerImage') setIsGeneratingBanner(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { setError("You must be logged in."); return }
    if (!formData.name.trim()) { setError("Space name is required."); return }

    setLoading(true)
    setError(null)

    const slug = formData.name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    try {
      const communityId = await createCommunity({
        ...formData, slug,
        creatorId: user.uid,
        creatorName: user.displayName || "Unknown Creator",
        tags: []
      })
      router.push(`/dashboard/communities/${communityId}`)
    } catch (err: any) {
      const isPermissionError = err.message?.toLowerCase().includes("permission") ||
        err.message?.toLowerCase().includes("insufficient")
      if (!isPermissionError) setError(err.message || "Failed to create space.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-2 px-4">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive" className="py-2 px-3">
            <Info className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs ml-1">{error}</AlertDescription>
          </Alert>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</Label>
          <Input
            id="name"
            placeholder="Creative Rebels Space"
            maxLength={40}
            required
            className="h-9 text-sm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Banner */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Banner</Label>
            <button
              type="button"
              onClick={() => handleGenerateAIImage('bannerImage')}
              disabled={isGeneratingBanner || !formData.name}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              {isGeneratingBanner
                ? <><Loader2 className="h-3 w-3 animate-spin" />Generating…</>
                : 'AI Generate'}
            </button>
          </div>
          <div
            onClick={() => bannerInputRef.current?.click()}
            className="relative h-24 rounded-md border border-dashed border-border hover:border-primary/50 cursor-pointer overflow-hidden transition-colors group bg-muted/30"
          >
            {formData.bannerImage ? (
              <img src={formData.bannerImage} className="w-full h-full object-cover" alt="Banner" />
            ) : (
              <div className="w-full h-full flex items-center justify-center gap-1.5 text-muted-foreground">
                <UploadCloud className="w-4 h-4" />
                <span className="text-xs">Upload banner</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-[11px] font-medium">Change</span>
            </div>
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'bannerImage')} />
        </div>

        {/* Logo + Description row — flush top */}
        <div className="flex gap-3">
          {/* Logo column */}
          <div className="shrink-0 flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Logo</Label>
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative w-16 h-16 rounded-lg border border-dashed border-border hover:border-primary/50 cursor-pointer overflow-hidden transition-colors group bg-muted/30"
            >
              {formData.image ? (
                <img src={formData.image} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')} />
          </div>

          {/* Description column */}
          <div className="flex-1 flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this space about?"
              className="text-sm flex-1 resize-none"
              style={{ minHeight: '68px' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Privacy</Label>
          <RadioGroup
            defaultValue="public"
            className="grid grid-cols-2 gap-2"
            onValueChange={(val) => setFormData({ ...formData, privacy: val as 'public' | 'private' })}
          >
            {[
              { value: "public", label: "Public", desc: "Anyone can join" },
              { value: "private", label: "Private", desc: "Invite only" }
            ].map(({ value, label, desc }) => (
              <label
                key={value}
                htmlFor={value}
                className={`flex items-start gap-2.5 p-3 rounded-md border cursor-pointer transition-colors hover:bg-muted/40 ${formData.privacy === value ? 'border-primary/60 bg-primary/5' : 'border-border'}`}
              >
                <RadioGroupItem value={value} id={value} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium leading-none mb-0.5">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Paid toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-t border-border/50">
            <div>
              <p className="text-sm font-medium">Subscription</p>
              <p className="text-xs text-muted-foreground">Charge a monthly fee to access</p>
            </div>
            <Switch
              id="isPaid"
              checked={formData.isPaid}
              onCheckedChange={(val) => setFormData({ ...formData, isPaid: val })}
            />
          </div>

          {formData.isPaid && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label htmlFor="price" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Price (₦)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 5000"
                min="0"
                required={formData.isPaid}
                className="h-9 text-sm"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
              <p className="text-[11px] text-muted-foreground">Recommended: ₦1,000 – ₦10,000</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground">By creating, you agree to our guidelines.</p>
          <Button
            type="submit"
            size="sm"
            disabled={loading || !formData.name.trim() || !user}
            className="h-8 px-4 text-sm"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Creating…</>
            ) : (
              <><Save className="w-3.5 h-3.5 mr-1.5" />Create</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
