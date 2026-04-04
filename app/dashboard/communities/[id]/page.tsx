"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Users, Shield, Share, LogOut, Loader2, Plus, Globe, Pencil, Trash2, Camera, Settings, UploadCloud, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { getCommunity, getCommunityBySlug, getCommunityMembers, isCommunityMember, joinCommunity, leaveCommunity, deleteCommunity, updateCommunity } from "@/services/communityService"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import StarRating from "@/components/products/StarRating"
import CommunityReviewSection from "@/components/communities/CommunityReviewSection"
import CommunityFeed from "@/components/communities/CommunityFeed"
import { getDisplayAvatar } from "@/lib/avatar"
import { getUser, User } from "@/services/userService"

type CommunityMemberProfile = {
    id: string
    userId: string
    role: "admin" | "moderator" | "member"
    displayName: string
    username?: string
    slug?: string
    profilePicture?: string | null
    photoURL?: string
    category?: string
}

export default function CommunityDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const router = useRouter()
    const [community, setCommunity] = useState<Community | null>(null)
    const [members, setMembers] = useState<CommunityMemberProfile[]>([])
    const [isMember, setIsMember] = useState(false)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        privacy: 'public' as 'public' | 'private',
        category: '',
        price: 0,
        isPaid: false,
        image: '',
        bannerImage: '',
        slug: ''
    })
    const [editLoading, setEditLoading] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
    const [isGeneratingBanner, setIsGeneratingBanner] = useState(false)

    const formatMember = (member: { id: string; userId: string; role: "admin" | "moderator" | "member" }, profile: User | null): CommunityMemberProfile => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        displayName: profile?.displayName?.trim() || profile?.username?.trim() || "Space Member",
        username: profile?.username,
        slug: profile?.slug,
        profilePicture: profile?.profilePicture,
        photoURL: profile?.photoURL,
        category: profile?.category,
    })

    const loadMembers = async (communityId: string) => {
        const communityMembers = await getCommunityMembers(communityId)
        const memberProfiles = await Promise.all(
            communityMembers.map(async (member) => {
                const profile = await getUser(member.userId).catch(() => null)
                return formatMember(member, profile)
            })
        )
        setMembers(memberProfiles)
    }

    const handleGenerateAIImage = async (type: 'image' | 'bannerImage') => {
        if (!editForm.name) {
            toast.error('Please enter a space name to generate an image')
            return
        }

        if (type === 'image') setIsGeneratingAvatar(true)
        else setIsGeneratingBanner(true)

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: editForm.name,
                    productDescription: editForm.description || `A space called ${editForm.name}`,
                    aspectRatio: type === 'bannerImage' ? '16:9' : '1:1'
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Image generation failed')
            }

            const data = await response.json();
            if (data.base64Image) {
                const response = await fetch(`data:image/jpeg;base64,${data.base64Image}`);
                const blob = await response.blob();
                const file = new File([blob], `ai-gen-${uuidv4()}.jpg`, { type: 'image/jpeg' });

                await handleFileUpload(file, type);
                toast.success(`${type === 'image' ? 'Avatar' : 'Banner'} generated successfully!`);
            } else {
                throw new Error('No image returned')
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to generate image');
        } finally {
            if (type === 'image') setIsGeneratingAvatar(false)
            else setIsGeneratingBanner(false)
        }
    }

    const handleFileUpload = async (file: File, type: 'image' | 'bannerImage') => {
        const storage = getStorage()
        const fileRef = ref(storage, `communities/${community?.id}/${type}_${uuidv4()}`)
        try {
            await uploadBytes(fileRef, file)
            const url = await getDownloadURL(fileRef)
            setEditForm(prev => ({ ...prev, [type]: url }))
            toast.success(`${type === 'image' ? 'Avatar' : 'Banner'} uploaded`)
        } catch (err) {
            console.error(err)
            toast.error('Upload failed')
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!id || typeof id !== "string") return
            try {
                let data = await getCommunityBySlug(id)
                if (!data) data = await getCommunity(id)
                if (!data) { router.push("/dashboard/communities"); return }
                setCommunity(data)
                await loadMembers(data.id)
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
                await loadMembers(community.id)
            } else {
                await joinCommunity(community.id, user.uid)
                setIsMember(true)
                setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null)
                await loadMembers(community.id)
            }
        } catch (error: any) {
            console.error("Error joining/leaving community:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleEditOpen = () => {
        if (!community) return
        setEditForm({
            name: community.name,
            description: community.description,
            privacy: community.privacy,
            category: community.category || '',
            price: community.price || 0,
            isPaid: community.isPaid || false,
            image: community.image || '',
            bannerImage: community.bannerImage || '',
            slug: community.slug || ''
        })
        setEditDialogOpen(true)
    }

    const handleEditSave = async () => {
        if (!community) return
        setEditLoading(true)
        try {
            const updateData = {
                name: editForm.name,
                description: editForm.description,
                privacy: editForm.privacy,
                category: editForm.category,
                price: editForm.isPaid ? editForm.price : 0,
                isPaid: editForm.isPaid,
                image: editForm.image,
                bannerImage: editForm.bannerImage,
                slug: editForm.slug
            }
            await updateCommunity(community.id, updateData)
            setCommunity(prev => prev ? { ...prev, ...updateData } : null)
            toast.success('Space updated')
            setEditDialogOpen(false)
        } catch (err) {
            console.error(err)
            toast.error('Failed to update space')
        } finally {
            setEditLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!community) return
        try {
            await deleteCommunity(community.id)
            toast.success('Space deleted')
            router.push('/dashboard/communities')
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete space')
        }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                <Skeleton className="h-28 w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!community) return null

    const isCreator = user?.uid === community.creatorId

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                            <div className="overflow-hidden rounded-xl border border-border/60 bg-muted shrink-0">
                                {community.image ? (
                                    <img
                                        src={community.image}
                                        alt={`${community.name} logo`}
                                        className="h-12 w-12 object-cover md:h-14 md:w-14"
                                    />
                                ) : (
                                    <div className="h-12 w-12 bg-gradient-to-br from-primary/15 via-primary/5 to-background md:h-14 md:w-14" />
                                )}
                            </div>
                            <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight break-words">
                                        {community.name}
                                    </h1>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                                    {community.description}
                                </p>
                                <div className="pt-1">
                                    {community.rating !== undefined && community.rating > 0 ? (
                                        <StarRating rating={community.rating} count={community.reviewsCount} className="mb-0" />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No ratings yet</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full lg:w-auto flex-wrap items-center gap-2 shrink-0">
                            {isCreator ? (
                                <>
                                    <Button size="sm" onClick={handleEditOpen} className="flex-1 sm:flex-none">
                                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                        <Share className="w-3.5 h-3.5 mr-1.5" /> Share
                                    </Button>
                                    <Button variant="destructive" size="sm" className="w-9 p-0" onClick={() => setDeleteDialogOpen(true)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="sm"
                                        variant={isMember ? "outline" : "default"}
                                        onClick={handleJoinLeave}
                                        disabled={actionLoading}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : isMember ? (
                                            "Joined"
                                        ) : community.isPaid ? (
                                            `Join — ₦${community.price?.toLocaleString()}/mo`
                                        ) : (
                                            "Join"
                                        )}
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                        <Share className="w-3.5 h-3.5 mr-1.5" /> Share
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-3">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                    {/* Main content */}
                    <div className="lg:col-span-3 min-w-0">
                        <Tabs defaultValue="feed" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 ">
                                <TabsTrigger value="feed">Feed</TabsTrigger>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="members">Members</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>

                            <TabsContent value="feed" className="mt-0">
                                {isMember || community.privacy === 'public' ? (
                                    <div className="space-y-2">
                                        {!isMember && (
                                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl mb-4 text-center">
                                                <p className="text-sm font-medium text-primary">Previewing Public Feed</p>
                                                <p className="text-xs text-muted-foreground mt-1">Join this space to start posting and interacting!</p>
                                            </div>
                                        )}

                                        <div className="">
                                            <CommunityFeed communityId={community.id} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 px-4 md:px-6 text-center border rounded-lg space-y-3">
                                        <Shield className="w-8 h-8 text-muted-foreground mx-auto" />
                                        <h2 className="text-base font-semibold">Members only</h2>
                                        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                                            This is a private space. Join to access the feed and engage with members.
                                        </p>
                                        <Button size="sm" onClick={handleJoinLeave} disabled={actionLoading}>
                                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Join Space"}
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="about" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-primary uppercase tracking-widest">About</p>
                                        <h3 className="text-base font-semibold">Mission</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{community.description}</p>
                                    </div>
                                    <div className="space-y-3 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Space Rules</p>
                                        <ul className="space-y-3">
                                            {[
                                                "Respect all members and their perspectives.",
                                                "No spam, solicitation, or self-promotion.",
                                                "Keep posts relevant to the space topic.",
                                            ].map((rule, i) => (
                                                <li key={i} className="flex items-start gap-2.5">
                                                    <span className="text-primary font-mono text-xs mt-0.5 shrink-0">0{i + 1}</span>
                                                    <p className="text-sm text-muted-foreground leading-snug">{rule}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="members" className="mt-0">
                                {members.length > 0 ? (
                                    <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
                                        {members.map((member) => {
                                            const handle = member.username ? `@${member.username}` : null
                                            const profileSlug = member.slug || member.username
                                            const isClickable = Boolean(profileSlug)

                                            return (
                                                <div
                                                    key={member.id}
                                                    className={`flex items-center gap-3 border-b border-border/40 px-4 py-3 last:border-b-0 ${isClickable ? "cursor-pointer transition-colors hover:bg-muted/40" : ""}`}
                                                    onClick={isClickable ? () => router.push(`/${profileSlug}`) : undefined}
                                                    onKeyDown={isClickable ? (event) => {
                                                        if (event.key === "Enter" || event.key === " ") {
                                                            event.preventDefault()
                                                            router.push(`/${profileSlug}`)
                                                        }
                                                    } : undefined}
                                                    role={isClickable ? "link" : undefined}
                                                    tabIndex={isClickable ? 0 : undefined}
                                                >
                                                    <Avatar className="h-9 w-9 border border-border/50">
                                                        <AvatarImage
                                                            src={getDisplayAvatar({
                                                                image: member.profilePicture || member.photoURL || "",
                                                                displayName: member.displayName,
                                                                handle: member.username || member.userId,
                                                            })}
                                                            alt={member.displayName}
                                                        />
                                                        <AvatarFallback>{member.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-sm font-medium">{member.displayName}</p>
                                                            {member.role !== "member" && (
                                                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] capitalize">
                                                                    {member.role}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <p className="truncate text-xs text-muted-foreground">
                                            {[handle, member.category].filter(Boolean).join(" • ") || "Space member"}
                                                        </p>
                                                    </div>

                                                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                        {member.role}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-10 md:py-12 text-center border rounded-lg px-4">
                                        <Users className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm font-medium">No members to show yet</p>
                                            <p className="text-sm text-muted-foreground mt-1">Space members will appear here as people join.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-0">
                                <div className="border border-border/40 rounded-xl p-4 md:p-6 bg-card">
                                    <CommunityReviewSection communityId={community.id} user={user} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-4 lg:col-span-1">
                        {/* Creator */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Creator</p>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                                    {community.creatorName?.[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">{community.creatorName}</div>
                                    <div className="text-xs text-muted-foreground">Founder</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-3 pt-4 border-t">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-base font-semibold tabular-nums">{community.memberCount}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Members</div>
                                </div>
                                {community.category && (
                                    <div className="border-l pl-3 min-w-0">
                                        <div className="text-base font-semibold truncate">{community.category}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">Category</div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center border-t pt-3">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Subscription</span>
                                <span className="text-sm font-semibold">
                                    {community.isPaid ? `₦${community.price?.toLocaleString() || 0}/mo` : 'Free'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center border-t pt-3">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Visibility</span>
                                <Badge variant="secondary" className="text-xs capitalize font-medium">
                                    {community.privacy}
                                </Badge>
                            </div>
                        </div>

                        {/* Support card */}
                        <Card className="border">
                            <CardContent className="p-4 space-y-2">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <p className="text-sm font-medium leading-snug">Support this space</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Member contributions keep this space independent and growing.
                                </p>
                            </CardContent>
                        </Card>

                        {isMember && !isCreator && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-muted-foreground hover:text-destructive"
                                onClick={handleJoinLeave}
                            >
                                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                                Leave Space
                            </Button>
                        )}
                    </aside>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl h-[88vh] w-[calc(100vw-1rem)] sm:w-full flex flex-col p-0">
                    <DialogHeader className="px-5 py-4 border-b">
                        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                            <Settings className="w-4 h-4 text-primary" />
                            Space Settings
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1">
                        <div className="px-4 md:px-5 py-5 space-y-6">

                            {/* Banner */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Banner Image</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] gap-1.5"
                                        onClick={() => handleGenerateAIImage('bannerImage')}
                                        disabled={isGeneratingBanner || !editForm.name}
                                    >
                                        {isGeneratingBanner ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                        {isGeneratingBanner ? 'Generating...' : 'Generate with AI'}
                                    </Button>
                                </div>
                                <div
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="relative h-24 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-muted/30 cursor-pointer overflow-hidden transition-all group"
                                >
                                    {editForm.bannerImage ? (
                                        <img src={editForm.bannerImage} className="w-full h-full object-cover" alt="Banner" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted/40">
                                            <UploadCloud className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <p className="text-white text-xs font-semibold uppercase tracking-wider">Change Banner</p>
                                    </div>
                                </div>
                                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'bannerImage')} />
                            </div>

                            {/* Avatar + Name */}
                            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                                <div className="space-y-1.5 shrink-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Logo</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-6 w-6 p-0 rounded-full"
                                            onClick={() => handleGenerateAIImage('image')}
                                            disabled={isGeneratingAvatar || !editForm.name}
                                            title="Generate Logo with AI"
                                        >
                                            {isGeneratingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                    <div
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="relative w-14 h-14 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-muted/30 cursor-pointer overflow-hidden transition-all group"
                                    >
                                        {editForm.image ? (
                                            <img src={editForm.image} className="w-full h-full object-cover" alt="Logo" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-muted/40">
                                                <Camera className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    </div>
                                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')} />
                                </div>

                                <div className="flex-1 space-y-1.5">
                                    <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Space Name</Label>
                                    <Input
                                        value={editForm.name}
                                        onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                        className="h-9 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Slug + Category */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">URL Slug</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">pasive.co/</span>
                                        <Input
                                            value={editForm.slug}
                                            onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))}
                                            className="h-9 pl-[4.5rem] text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Category</Label>
                                    <Select value={editForm.category} onValueChange={v => setEditForm(p => ({ ...p, category: v }))}>
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue placeholder="Select topic" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["Art", "Design", "Music", "Business", "Tech", "Health", "Personal Growth", "Education", "Other"].map(cat => (
                                                <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Description</Label>
                                <Textarea
                                    rows={2}
                                    value={editForm.description}
                                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                    className="text-sm resize-none"
                                    placeholder="What is this space about?"
                                />
                            </div>

                            <div className="h-px bg-border" />

                            {/* Privacy */}
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Privacy</Label>
                                <RadioGroup
                                    value={editForm.privacy}
                                    onValueChange={v => setEditForm(p => ({ ...p, privacy: v as 'public' | 'private' }))}
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

                            {/* Paid toggle */}
                            <div className="p-4 border rounded-lg space-y-3 bg-card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">Paid Subscription</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Charge monthly membership fees</p>
                                    </div>
                                    <Switch checked={editForm.isPaid} onCheckedChange={v => setEditForm(p => ({ ...p, isPaid: v }))} />
                                </div>

                                {editForm.isPaid && (
                                    <div className="pt-1 animate-in fade-in slide-in-from-top-1">
                                        <Label className="text-xs uppercase font-semibold tracking-widest text-muted-foreground">Monthly Fee (₦)</Label>
                                        <Input
                                            type="number"
                                            value={editForm.price}
                                            onChange={e => setEditForm(p => ({ ...p, price: Number(e.target.value) }))}
                                            className="h-9 text-sm mt-1.5"
                                        />
                                    </div>
                                )}
                            </div>

                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-4 md:px-5 py-4 border-t gap-2 bg-muted/20">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button size="sm" className="w-full sm:w-auto" onClick={handleEditSave} disabled={editLoading}>
                            {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete AlertDialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete space?</AlertDialogTitle>
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
                            Delete Space
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
