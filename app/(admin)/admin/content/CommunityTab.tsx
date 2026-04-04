"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Users, Image as ImageIcon, UploadCloud, Loader2, Sparkles } from "lucide-react"
import { createCommunity, deleteCommunity, getAllCommunities, updateCommunity } from "@/services/communityService"
import { Community } from "@/types/community"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/hooks/use-toast"
import InstantCommunityModal from "@/components/communities/InstantCommunityModal"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CommunityForm {
  id?: string
  name: string
  description: string
  category: string
  privacy: "public" | "private"
  image: string
  bannerImage: string
  tags: string
  isPaid: boolean
  price: string
  currency: string
  creatorName: string
}

const emptyForm: CommunityForm = {
  name: "",
  description: "",
  category: "",
  privacy: "public",
  image: "",
  bannerImage: "",
  tags: "",
  isPaid: false,
  price: "",
  currency: "USD",
  creatorName: "",
}

const toFormData = (community: Community): CommunityForm => ({
  id: community.id,
  name: community.name ?? "",
  description: community.description ?? "",
  category: community.category ?? "",
  privacy: community.privacy ?? "public",
  image: community.image ?? "",
  bannerImage: community.bannerImage ?? "",
  tags: (community.tags ?? []).join(", "),
  isPaid: Boolean(community.isPaid),
  price: community.price ? String(community.price) : "",
  currency: community.currency ?? "USD",
  creatorName: community.creatorName ?? "",
})

export default function CommunityTab() {
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentCommunity, setCurrentCommunity] = useState<CommunityForm | null>(null)
  const [isInstantModalOpen, setIsInstantModalOpen] = useState(false)
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(null)
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [imageDragging, setImageDragging] = useState(false)
  const [bannerDragging, setBannerDragging] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  
  const imageInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const selectedId = useMemo(() => currentCommunity?.id, [currentCommunity?.id])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const data = await getAllCommunities()
      setCommunities(data)
    } catch (error) {
      console.error("Error fetching communities:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch spaces.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [])

  const uploadFile = async (file: File, path: string) => {
    const filename = `${uuidv4()}-${file.name}`
    const storageRef = ref(storage, `${path}/${filename}`)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  }

  const handleGenerateAIImage = async () => {
    if (!currentCommunity?.name) {
      toast({ variant: "destructive", title: "Missing title", description: "Please enter a space title first." })
      return
    }
    
    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productName: currentCommunity.name, 
          productDescription: currentCommunity.description || `A space for ${currentCommunity.name}` 
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("AI Generation Error Info:", errData);
        throw new Error('Generation failed')
      }

      const data = await response.json();
      if (data.base64Image) {
        const res = await fetch(`data:image/jpeg;base64,${data.base64Image}`);
        const blob = await res.blob();
        const file = new File([blob], `ai-gen-${uuidv4()}.jpg`, { type: 'image/jpeg' });
        const objectUrl = URL.createObjectURL(file);
        setImageFile(file);
        setCurrentCommunity(prev => prev ? { ...prev, image: objectUrl } : null);
        toast({ title: "Success", description: "AI image generated!" })
      }
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Error", description: "Failed to generate AI image." })
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleSave = async () => {
    if (!currentCommunity || !currentCommunity.name.trim() || !currentCommunity.description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Name and description are required.",
      })
      return
    }

    if (!user?.uid && !currentCommunity.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to create a space.",
      })
      return
    }

    try {
      setSaving(true)
      const normalizedTags = currentCommunity.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      const normalizedPrice = currentCommunity.isPaid && currentCommunity.price
        ? Number(currentCommunity.price)
        : 0

      let imageUrl = currentCommunity.image
      let bannerUrl = currentCommunity.bannerImage

      if (imageFile) imageUrl = await uploadFile(imageFile, "community-images")
      if (bannerFile) bannerUrl = await uploadFile(bannerFile, "community-banners")

      const payload = {
        name: currentCommunity.name.trim(),
        description: currentCommunity.description.trim(),
        category: currentCommunity.category.trim() || null,
        privacy: currentCommunity.privacy,
        image: imageUrl || null,
        bannerImage: bannerUrl || null,
        tags: normalizedTags.length > 0 ? normalizedTags : [],
        isPaid: currentCommunity.isPaid,
        price: normalizedPrice,
        currency: currentCommunity.currency.trim() || "USD",
        creatorName: currentCommunity.creatorName.trim() || null,
      }

      if (currentCommunity.id) {
        await updateCommunity(currentCommunity.id, payload)
        toast({ title: "Saved", description: "Space updated successfully." })
      } else {
        await createCommunity({
          ...payload,
          creatorId: user!.uid,
        })
        toast({ title: "Created", description: "Space created successfully." })
      }

      setImageFile(null)
      setBannerFile(null)
      await fetchCommunities()
    } catch (error) {
      console.error("Error saving community:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save space.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (community: Community) => {
    if (!community.id) return
    setCommunityToDelete(community)
  }

  const confirmDelete = async () => {
    if (!communityToDelete?.id) return

    try {
      await deleteCommunity(communityToDelete.id)
      setCommunities((prev) => prev.filter((item) => item.id !== communityToDelete.id))
      if (selectedId === communityToDelete.id) {
        setCurrentCommunity(null)
      }
      toast({ title: "Deleted", description: "Space deleted successfully." })
    } catch (error) {
      console.error("Error deleting community:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete space.",
      })
    } finally {
      setCommunityToDelete(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0">
        <h2 className="mb-4 text-lg font-semibold">Spaces</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setCurrentCommunity({ ...emptyForm })} className="flex-1">+ Create New</Button>
            <Button 
              onClick={() => setIsInstantModalOpen(true)} 
              variant="outline" 
              className="px-3 border-primary/30 text-primary hover:bg-primary/5"
              title="AI Instant Create"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading spaces...</p>
            ) : communities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No spaces found.</p>
            ) : (
              communities.map((community) => (
                <Card key={community.id} className="p-3 hover:bg-accent">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      className="text-left"
                      onClick={() => setCurrentCommunity(toFormData(community))}
                      type="button"
                    >
                      <p className="font-medium break-words">{community.name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{community.privacy}</Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {community.memberCount ?? 0}
                        </span>
                      </div>
                    </button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(community)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-8">
        <h2 className="mb-4 text-lg font-semibold">{currentCommunity?.id ? "Edit Space" : "Create Space"}</h2>
        {currentCommunity ? (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={currentCommunity.name}
                onChange={(e) => setCurrentCommunity({ ...currentCommunity, name: e.target.value })}
                placeholder="Space name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentCommunity.description}
                onChange={(e) => setCurrentCommunity({ ...currentCommunity, description: e.target.value })}
                placeholder="What is this space about?"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={currentCommunity.category}
                  onChange={(e) => setCurrentCommunity({ ...currentCommunity, category: e.target.value })}
                  placeholder="e.g. Marketing"
                />
              </div>

              <div className="grid gap-2">
                <Label>Privacy</Label>
                <Select
                  value={currentCommunity.privacy}
                  onValueChange={(value: "public" | "private") => setCurrentCommunity({ ...currentCommunity, privacy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Space Image</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs gap-1.5 text-primary hover:bg-primary/5"
                    onClick={handleGenerateAIImage}
                    disabled={isGeneratingImage || !currentCommunity.name}
                  >
                    {isGeneratingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    AI Gen
                  </Button>
                </div>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setImageDragging(true) }}
                  onDragLeave={() => setImageDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImageDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setCurrentCommunity({ ...currentCommunity, image: URL.createObjectURL(file) });
                    }
                  }}
                  className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors
                    ${imageDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
                >
                  {currentCommunity.image ? (
                    <img src={currentCommunity.image} alt="Preview" className="max-h-24 w-auto rounded-md object-contain" />
                  ) : (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">Drop avatar here</p>
                    </>
                  )}
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setCurrentCommunity({ ...currentCommunity, image: URL.createObjectURL(file) });
                    }
                  }} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div
                  onClick={() => bannerInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setBannerDragging(true) }}
                  onDragLeave={() => setBannerDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setBannerDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setBannerFile(file);
                      setCurrentCommunity({ ...currentCommunity, bannerImage: URL.createObjectURL(file) });
                    }
                  }}
                  className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors
                    ${bannerDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'}`}
                >
                  {currentCommunity.bannerImage ? (
                    <img src={currentCommunity.bannerImage} alt="Preview" className="max-h-24 w-auto rounded-md object-contain" />
                  ) : (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <UploadCloud className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">Drop banner here</p>
                    </>
                  )}
                  <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBannerFile(file);
                      setCurrentCommunity({ ...currentCommunity, bannerImage: URL.createObjectURL(file) });
                    }
                  }} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={currentCommunity.tags}
                  onChange={(e) => setCurrentCommunity({ ...currentCommunity, tags: e.target.value })}
                  placeholder="growth, marketing, founders"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creatorName">Creator Name</Label>
                <Input
                  id="creatorName"
                  value={currentCommunity.creatorName}
                  onChange={(e) => setCurrentCommunity({ ...currentCommunity, creatorName: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPaid">Paid space</Label>
                <Switch
                  id="isPaid"
                  checked={currentCommunity.isPaid}
                  onCheckedChange={(checked) => setCurrentCommunity({ ...currentCommunity, isPaid: checked })}
                />
              </div>
              {currentCommunity.isPaid && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentCommunity.price}
                      onChange={(e) => setCurrentCommunity({ ...currentCommunity, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={currentCommunity.currency}
                      onChange={(e) => setCurrentCommunity({ ...currentCommunity, currency: e.target.value.toUpperCase() })}
                      placeholder="USD"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              <Button variant="outline" onClick={() => setCurrentCommunity({ ...emptyForm })}>Reset</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a space from the list or create a new one.</p>
        )}
      </div>
      <InstantCommunityModal 
        open={isInstantModalOpen}
        onOpenChange={setIsInstantModalOpen}
        onCommunitiesCreated={fetchCommunities}
      />

      <AlertDialog open={!!communityToDelete} onOpenChange={(open) => !open && setCommunityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the space <strong>{communityToDelete?.name}</strong> and remove all member associations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Space
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
