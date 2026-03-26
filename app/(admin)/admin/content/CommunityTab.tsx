"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Users } from "lucide-react"
import { createCommunity, deleteCommunity, getAllCommunities, updateCommunity } from "@/services/communityService"
import { Community } from "@/types/community"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/hooks/use-toast"

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
        description: "Failed to fetch communities.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [])

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
        description: "Please sign in to create a community.",
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
        : undefined

      if (currentCommunity.id) {
        await updateCommunity(currentCommunity.id, {
          name: currentCommunity.name.trim(),
          description: currentCommunity.description.trim(),
          category: currentCommunity.category.trim() || undefined,
          privacy: currentCommunity.privacy,
          image: currentCommunity.image.trim() || undefined,
          bannerImage: currentCommunity.bannerImage.trim() || undefined,
          tags: normalizedTags.length > 0 ? normalizedTags : undefined,
          isPaid: currentCommunity.isPaid,
          price: normalizedPrice,
          currency: currentCommunity.currency.trim() || undefined,
          creatorName: currentCommunity.creatorName.trim() || undefined,
        })
        toast({ title: "Saved", description: "Community updated successfully." })
      } else {
        await createCommunity({
          name: currentCommunity.name.trim(),
          description: currentCommunity.description.trim(),
          creatorId: user!.uid,
          creatorName: currentCommunity.creatorName.trim() || user?.displayName || "Admin",
          category: currentCommunity.category.trim() || undefined,
          privacy: currentCommunity.privacy,
          image: currentCommunity.image.trim() || undefined,
          bannerImage: currentCommunity.bannerImage.trim() || undefined,
          tags: normalizedTags.length > 0 ? normalizedTags : undefined,
          isPaid: currentCommunity.isPaid,
          price: normalizedPrice,
          currency: currentCommunity.currency.trim() || "USD",
        })
        toast({ title: "Created", description: "Community created successfully." })
      }

      await fetchCommunities()
    } catch (error) {
      console.error("Error saving community:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save community.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (community: Community) => {
    if (!community.id || !confirm(`Delete community \"${community.name}\"?`)) {
      return
    }

    try {
      await deleteCommunity(community.id)
      setCommunities((prev) => prev.filter((item) => item.id !== community.id))
      if (selectedId === community.id) {
        setCurrentCommunity(null)
      }
      toast({ title: "Deleted", description: "Community deleted successfully." })
    } catch (error) {
      console.error("Error deleting community:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete community.",
      })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div className="col-span-1 min-w-0 rounded-lg border p-4 md:col-span-4 md:mb-0">
        <h2 className="mb-4 text-lg font-semibold">Communities</h2>
        <div className="space-y-4">
          <Button onClick={() => setCurrentCommunity({ ...emptyForm })} className="w-full">+ Create New</Button>
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading communities...</p>
            ) : communities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No communities found.</p>
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
        <h2 className="mb-4 text-lg font-semibold">{currentCommunity?.id ? "Edit Community" : "Create Community"}</h2>
        {currentCommunity ? (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={currentCommunity.name}
                onChange={(e) => setCurrentCommunity({ ...currentCommunity, name: e.target.value })}
                placeholder="Community name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentCommunity.description}
                onChange={(e) => setCurrentCommunity({ ...currentCommunity, description: e.target.value })}
                placeholder="What is this community about?"
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
              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={currentCommunity.image}
                  onChange={(e) => setCurrentCommunity({ ...currentCommunity, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bannerImage">Banner URL</Label>
                <Input
                  id="bannerImage"
                  value={currentCommunity.bannerImage}
                  onChange={(e) => setCurrentCommunity({ ...currentCommunity, bannerImage: e.target.value })}
                  placeholder="https://..."
                />
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
                <Label htmlFor="isPaid">Paid community</Label>
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
          <p className="text-sm text-muted-foreground">Select a community from the list or create a new one.</p>
        )}
      </div>
    </div>
  )
}
