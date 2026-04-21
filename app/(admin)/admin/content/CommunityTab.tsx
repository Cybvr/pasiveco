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
import { cn } from "@/lib/utils"
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 h-[calc(100vh-140px)]">
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0 flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Spaces</h3>
          <div className="flex items-center gap-1">
            <Button 
              onClick={() => setIsInstantModalOpen(true)} 
              variant="ghost" 
              className="h-6 w-6 p-0 rounded-full text-primary hover:bg-primary/10"
              title="AI Instant Create"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCurrentCommunity({ ...emptyForm })} 
              className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <AdminSidebarList
            items={communities}
            selectedId={selectedId}
            onSelect={(community) => setCurrentCommunity(toFormData(community))}
            onDelete={(community) => handleDelete(community)}
            getId={(community) => community.id!}
            getTitle={(community) => community.name!}
            getSubtitle={(community) => (
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="h-4 px-1 text-[8px] uppercase tracking-tighter border-muted-foreground/30">{community.privacy}</Badge>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium">
                  <Users className="h-3 w-3" />
                  {community.memberCount ?? 0}
                </span>
              </div>
            )}
            loading={loading}
            loadingMessage="Loading spaces..."
          />
        </div>
      </div>

      <div className="col-span-1 min-w-0 rounded-lg border md:col-span-8 bg-card flex flex-col overflow-hidden">
        {currentCommunity ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid gap-1">
                <Label htmlFor="name" className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Name</Label>
                <Input
                  id="name"
                  value={currentCommunity.name}
                  onChange={(e) => setCurrentCommunity({ ...currentCommunity, name: e.target.value })}
                  placeholder="Space name"
                  className="text-lg font-bold border-none px-0 shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="description" className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Description</Label>
                <Textarea
                  id="description"
                  value={currentCommunity.description}
                  onChange={(e) => setCurrentCommunity({ ...currentCommunity, description: e.target.value })}
                  placeholder="What is this space about?"
                  className="border-none px-0 shadow-none focus-visible:ring-0 text-sm text-muted-foreground min-h-[60px] resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label htmlFor="category" className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Category</Label>
                  <Input
                    id="category"
                    value={currentCommunity.category}
                    onChange={(e) => setCurrentCommunity({ ...currentCommunity, category: e.target.value })}
                    placeholder="e.g. Marketing"
                    className="h-8 bg-muted/30 border-none rounded-lg px-3 text-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Privacy</Label>
                  <Select
                    value={currentCommunity.privacy}
                    onValueChange={(value: "public" | "private") => setCurrentCommunity({ ...currentCommunity, privacy: value })}
                  >
                    <SelectTrigger className="h-8 bg-muted/30 border-none rounded-lg px-3 text-xs">
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
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Space Image</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[9px] gap-1 text-primary hover:bg-primary/5 rounded-full px-2"
                      onClick={handleGenerateAIImage}
                      disabled={isGeneratingImage || !currentCommunity.name}
                    >
                      {isGeneratingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      AI Gen
                    </Button>
                  </div>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className={cn(
                      "relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors",
                      imageDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'
                    )}
                  >
                    {currentCommunity.image ? (
                      <img src={currentCommunity.image} alt="Preview" className="max-h-20 w-auto rounded-md object-contain" />
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Drop avatar</p>
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
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Banner Image</Label>
                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className={cn(
                      "relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors",
                      bannerDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'
                    )}
                  >
                    {currentCommunity.bannerImage ? (
                      <img src={currentCommunity.bannerImage} alt="Preview" className="max-h-20 w-auto rounded-md object-contain" />
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4 text-muted-foreground/40" />
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Drop banner</p>
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
                <div className="grid gap-1">
                  <Label htmlFor="tags" className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Tags</Label>
                  <Input
                    id="tags"
                    value={currentCommunity.tags}
                    onChange={(e) => setCurrentCommunity({ ...currentCommunity, tags: e.target.value })}
                    placeholder="growth, founders"
                    className="h-8 bg-muted/30 border-none rounded-lg px-3 text-xs"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="creatorName" className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Creator Name</Label>
                  <Input
                    id="creatorName"
                    value={currentCommunity.creatorName}
                    onChange={(e) => setCurrentCommunity({ ...currentCommunity, creatorName: e.target.value })}
                    placeholder="Optional"
                    className="h-8 bg-muted/30 border-none rounded-lg px-3 text-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl border bg-muted/10 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPaid" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Paid space</Label>
                  <Switch
                    id="isPaid"
                    checked={currentCommunity.isPaid}
                    onCheckedChange={(checked) => setCurrentCommunity({ ...currentCommunity, isPaid: checked })}
                  />
                </div>
                {currentCommunity.isPaid && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1">
                      <Label htmlFor="price" className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentCommunity.price}
                        onChange={(e) => setCurrentCommunity({ ...currentCommunity, price: e.target.value })}
                        className="h-8 bg-background border-none rounded-lg px-3 text-xs"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="currency" className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Currency</Label>
                      <Input
                        id="currency"
                        value={currentCommunity.currency}
                        onChange={(e) => setCurrentCommunity({ ...currentCommunity, currency: e.target.value.toUpperCase() })}
                        className="h-8 bg-background border-none rounded-lg px-3 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-3 border-t bg-background flex justify-start shrink-0">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs uppercase tracking-widest px-8 rounded-full shadow-lg shadow-indigo-500/20"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <p className="text-sm font-medium">Select a space to edit or create a new one</p>
          </div>
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
