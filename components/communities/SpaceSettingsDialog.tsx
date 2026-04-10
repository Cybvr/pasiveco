"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, Loader2, Save, Settings, Sparkles, UploadCloud, X } from "lucide-react"
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"
import { Community } from "@/types/community"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { POPULAR_COMMUNITY_CATEGORIES, normalizeCommunityTags } from "@/lib/communityCategories"

type SpaceSettingsForm = {
  name: string
  description: string
  privacy: "public" | "private"
  category: string
  tags: string
  price: number
  isPaid: boolean
  image: string
  bannerImage: string
  slug: string
}

type SpaceSettingsUpdate = {
  name: string
  description: string
  privacy: "public" | "private"
  category: string
  tags: string[]
  price: number
  isPaid: boolean
  image: string
  bannerImage: string
  slug: string
}

interface SpaceSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  community: Community | null
  saving: boolean
  onSave: (data: SpaceSettingsUpdate) => Promise<void>
}

const ImageUploadCard = ({
  type,
  value,
  onClick,
  isGenerating,
  onGenerate,
  disabled,
}: {
  type: "image" | "bannerImage"
  value: string
  onClick: () => void
  isGenerating: boolean
  onGenerate: () => void
  disabled?: boolean
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">
        {type === "image" ? "Logo" : "Banner Image"}
      </Label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-[10px] gap-1.5"
        onClick={onGenerate}
        disabled={isGenerating || disabled}
      >
        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        {isGenerating ? "Generating..." : "Generate with AI"}
      </Button>
    </div>
    <div
      onClick={onClick}
      className="relative h-24 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-muted/30 cursor-pointer overflow-hidden transition-all group"
    >
      {value ? (
        <img src={value} className="w-full h-full object-cover" alt={type} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted/40">
          {type === "image" ? (
            <Camera className="w-5 h-5 text-muted-foreground" />
          ) : (
            <UploadCloud className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <p className="text-white text-xs font-semibold uppercase tracking-wider">
          {type === "image" ? "Change Logo" : "Change Banner"}
        </p>
      </div>
    </div>
  </div>
)


const TagInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [inputValue, setInputValue] = useState("")
  const tags = normalizeCommunityTags(value)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const newTag = inputValue.trim().replace(/^#/, "")
      if (newTag && !tags.includes(newTag)) {
        const nextTags = [...tags, newTag]
        onChange(nextTags.join(", "))
      }
      setInputValue("")
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      const nextTags = tags.slice(0, -1)
      onChange(nextTags.join(", "))
    }
  }

  const removeTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove)
    onChange(nextTags.join(", "))
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Tags</Label>
      <div className="flex flex-wrap gap-2 p-1.5 border rounded-md bg-background focus-within:ring-1 focus-within:ring-primary min-h-[36px] transition-all">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="rounded-full flex items-center gap-1 py-0.5 pl-2 pr-1 text-[11px] font-medium animate-in zoom-in-95 duration-200">
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="flex-1 bg-transparent border-none outline-none text-sm px-1.5 py-0.5 min-w-[80px] placeholder:text-muted-foreground/60"
        />
      </div>
      <p className="text-[10px] text-muted-foreground">Press Enter or comma to add.</p>
    </div>
  )
}

export default function SpaceSettingsDialog({ open, onOpenChange, community, saving, onSave }: SpaceSettingsDialogProps) {
  const [form, setForm] = useState<SpaceSettingsForm>({
    name: community?.name || "",
    description: community?.description || "",
    privacy: community?.privacy || "public",
    category: community?.category || "",
    tags: (community?.tags || []).join(", "),
    price: community?.price || 0,
    isPaid: community?.isPaid || false,
    image: community?.image || "",
    bannerImage: community?.bannerImage || "",
    slug: community?.slug || "",
  })
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setForm({
      name: community?.name || "",
      description: community?.description || "",
      privacy: community?.privacy || "public",
      category: community?.category || "",
      tags: (community?.tags || []).join(", "),
      price: community?.price || 0,
      isPaid: community?.isPaid || false,
      image: community?.image || "",
      bannerImage: community?.bannerImage || "",
      slug: community?.slug || "",
    })
  }, [community, open])

  const handleFileUpload = async (file: File, type: "image" | "bannerImage") => {
    if (!community?.id) return
    const storage = getStorage()
    const fileRef = ref(storage, `communities/${community.id}/${type}_${uuidv4()}`)
    try {
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      setForm((prev) => ({ ...prev, [type]: url }))
      toast.success(`${type === "image" ? "Avatar" : "Banner"} uploaded`)
    } catch (error) {
      console.error(error)
      toast.error("Upload failed")
    }
  }

  const handleGenerateAIImage = async (type: "image" | "bannerImage") => {
    if (!form.name) {
      toast.error("Please enter a space name to generate an image")
      return
    }
    type === "image" ? setIsGeneratingAvatar(true) : setIsGeneratingBanner(true)
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: form.name,
          productDescription: form.description || `A space called ${form.name}`,
          aspectRatio: type === "bannerImage" ? "16:9" : "1:1",
        }),
      })
      if (!response.ok) throw new Error("Image generation failed")
      const data = await response.json()
      if (!data.base64Image) throw new Error("No image returned")
      const imageResponse = await fetch(`data:image/jpeg;base64,${data.base64Image}`)
      const blob = await imageResponse.blob()
      const file = new File([blob], `ai-gen-${uuidv4()}.jpg`, { type: "image/jpeg" })
      await handleFileUpload(file, type)
      toast.success(`${type === "image" ? "Avatar" : "Banner"} generated successfully!`)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to generate image")
    } finally {
      type === "image" ? setIsGeneratingAvatar(false) : setIsGeneratingBanner(false)
    }
  }

  const handleSave = async () => {
    const resolvedCategory = form.category.trim()
    await onSave({
      name: form.name,
      description: form.description,
      privacy: form.privacy,
      category: resolvedCategory || "General",
      tags: normalizeCommunityTags(form.tags),
      price: form.isPaid ? form.price : 0,
      isPaid: form.isPaid,
      image: form.image,
      bannerImage: form.bannerImage,
      slug: form.slug,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[88vh] w-[calc(100vw-1rem)] sm:w-full flex flex-col p-0">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Settings className="w-4 h-4 text-primary" />
            Space Settings
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-4 md:px-5 py-5 space-y-6">
            <ImageUploadCard
              type="bannerImage"
              value={form.bannerImage}
              onClick={() => bannerInputRef.current?.click()}
              isGenerating={isGeneratingBanner}
              onGenerate={() => handleGenerateAIImage("bannerImage")}
              disabled={!form.name}
            />
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "bannerImage")}
            />

            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <ImageUploadCard
                type="image"
                value={form.image}
                onClick={() => avatarInputRef.current?.click()}
                isGenerating={isGeneratingAvatar}
                onGenerate={() => handleGenerateAIImage("image")}
                disabled={!form.name}
              />
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "image")}
              />
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Space Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">URL Slug</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">pasive.co/</span>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="h-9 pl-[4.5rem] text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((prev) => ({
                    ...prev,
                    category: value,
                  }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_COMMUNITY_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category} className="text-sm">{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>


            <TagInput
              value={form.tags}
              onChange={(value) => setForm((prev) => ({ ...prev, tags: value }))}
            />

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Description</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="text-sm resize-none"
                placeholder="What is this space about?"
              />
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Privacy</Label>
              <RadioGroup
                value={form.privacy}
                onValueChange={(value) => setForm((prev) => ({ ...prev, privacy: value as "public" | "private" }))}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <Label className="flex flex-col gap-1 p-3 border rounded-lg hover:bg-muted/40 transition-colors cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/[0.03]">
                  <RadioGroupItem value="public" className="sr-only" />
                  <span className="text-sm font-semibold">Public</span>
                  <span className="text-xs text-muted-foreground">Visible to everyone</span>
                </Label>
                <Label className="flex flex-col gap-1 p-3 border rounded-lg hover:bg-muted/40 transition-colors cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/[0.03]">
                  <RadioGroupItem value="private" className="sr-only" />
                  <span className="text-sm font-semibold">Private</span>
                  <span className="text-xs text-muted-foreground">Hidden from discovery</span>
                </Label>
              </RadioGroup>
            </div>

            <div className="p-4 border rounded-lg space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Paid Subscription</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Charge monthly membership fees</p>
                </div>
                <Switch checked={form.isPaid} onCheckedChange={(value) => setForm((prev) => ({ ...prev, isPaid: value }))} />
              </div>
              {form.isPaid && (
                <div className="pt-1 animate-in fade-in slide-in-from-top-1">
                  <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Monthly Fee (₦)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="h-9 text-sm mt-1.5"
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 md:px-5 py-4 border-t gap-2 bg-muted/20">
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="w-full sm:w-auto" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { SpaceSettingsUpdate }
