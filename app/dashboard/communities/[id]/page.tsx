"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Shield, Share, MoreVertical, LogOut, Loader2, Plus, Globe, MessageSquare, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { getCommunity, getCommunityBySlug, isCommunityMember, joinCommunity, leaveCommunity, deleteCommunity, updateCommunity } from "@/services/communityService"
import { Community } from "@/types/community"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function CommunityDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [community, setCommunity] = useState<Community | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== "string") return
      try {
        let data = await getCommunityBySlug(id)
        if (!data) data = await getCommunity(id)
        if (!data) { router.push("/dashboard/communities"); return }
        setCommunity(data)
        if (user) {
          const member = await isCommunityMember(data.id, user.uid)
          setIsMember(member)
        }
      } catch (error) {
        console.error("Error fetching community data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, user, router])

  const handleJoinLeave = async () => {
    if (!user || !community) return
    setActionLoading(true)
    try {
      if (isMember) {
        await leaveCommunity(community.id, user.uid)
        setIsMember(false)
        setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount - 1 } : null)
      } else {
        await joinCommunity(community.id, user.uid)
        setIsMember(true)
        setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null)
      }
    } catch (error: any) {
      console.error("Error joining/leaving community:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditOpen = () => {
    if (!community) return
    setEditForm({ name: community.name, description: community.description })
    setEditDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!community) return
    setEditLoading(true)
    try {
      await updateCommunity(community.id, { name: editForm.name, description: editForm.description })
      setCommunity(prev => prev ? { ...prev, name: editForm.name, description: editForm.description } : null)
      toast.success('Community updated')
      setEditDialogOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update community')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!community) return
    try {
      await deleteCommunity(community.id)
      toast.success('Community deleted')
      router.push('/dashboard/communities')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete community')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!community) return null

  const isCreator = user?.uid === community.creatorId

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-8">
          <Link
            href="/dashboard/communities"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Communities
          </Link>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="space-y-3">
              <Badge variant="secondary">{community.privacy}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                {community.name}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                {community.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div>
                  <div className="text-lg font-bold tabular-nums">{community.memberCount}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Members</div>
                </div>
                {community.isPaid && (
                  <div>
                    <div className="text-lg font-bold text-green-600">₦{community.price?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">/ month</div>
                  </div>
                )}
                {community.category && (
                  <div>
                    <div className="text-lg font-bold">{community.category}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Category</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[200px]">
              {isCreator ? (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleEditOpen}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant={isMember ? "outline" : "default"}
                  onClick={handleJoinLeave}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isMember ? (
                    "Joined"
                  ) : community.isPaid ? (
                    `Join — ₦${community.price?.toLocaleString()}/mo`
                  ) : (
                    "Join Community"
                  )}
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  <Share className="w-3.5 h-3.5 mr-1.5" /> Share
                </Button>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="feed" className="w-full">
              <div className="flex justify-start mb-6">
                <TabsList>
                  <TabsTrigger value="feed">Feed</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="feed">
                {isMember ? (
                  <div className="space-y-4">
                    <div className="border border-dashed rounded-lg p-8 text-center">
                      <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-sm font-semibold">Post to the community</h3>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Start a conversation with members.
                      </p>
                      <Button variant="outline" size="sm">
                        New Post <Plus className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                    <div className="py-16 text-center border rounded-lg">
                      <p className="text-sm text-muted-foreground">No activity yet</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 px-8 text-center border rounded-lg space-y-4">
                    <Shield className="w-10 h-10 text-muted-foreground mx-auto" />
                    <h2 className="text-xl font-bold tracking-tight">Members only</h2>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                      Join this community to access the feed and engage with members.
                    </p>
                    <Button onClick={handleJoinLeave} disabled={actionLoading}>
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Community"}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">About</p>
                    <h3 className="text-base font-bold tracking-tight">Mission</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{community.description}</p>
                  </div>
                  <div className="space-y-4 border-l pl-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Community Rules</p>
                    <ul className="space-y-4">
                      {[
                        "Respect all members and their perspectives.",
                        "No spam, solicitation, or self-promotion.",
                        "Keep posts relevant to the community topic.",
                      ].map((rule, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-primary font-mono text-xs mt-0.5 shrink-0">0{i + 1}</span>
                          <p className="text-sm text-muted-foreground leading-snug">{rule}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="members">
                <div className="py-16 text-center border rounded-lg">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-sm font-semibold">Member list is private</h3>
                  <p className="text-xs text-muted-foreground mt-1">Only admins can view the full registry.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Creator</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                  {community.creatorName?.[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{community.creatorName}</div>
                  <div className="text-xs text-muted-foreground">Founder</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</p>
              <div className="space-y-2">
                {[
                  { label: "Visibility", value: community.privacy },
                  { label: "Engagement", value: "Moderate" },
                  { label: "Growth", value: "+12% / mo" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-5 space-y-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <h4 className="text-sm font-semibold leading-snug">Support this community</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Member contributions keep this community independent and growing.
                </p>
                <Button variant="outline" size="sm" className="w-full">Learn More</Button>
              </CardContent>
            </Card>

            {isMember && !isCreator && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={handleJoinLeave}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Community
              </Button>
            )}
          </aside>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete community?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{community?.name}</strong> and remove all members. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete Community
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}