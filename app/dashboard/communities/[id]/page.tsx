"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Users, Shield, Share, LogOut, Loader2, Globe, Pencil, Trash2, ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { getAllCommunities, getCommunity, getCommunityBySlug, getCommunityMembers, isCommunityMember, joinCommunity, leaveCommunity, deleteCommunity, updateCommunity } from "@/services/communityService"
import { Community } from "@/types/community"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import StarRating from "@/components/products/StarRating"
import CommunityReviewSection from "@/components/communities/CommunityReviewSection"
import CommunityFeed from "@/components/communities/CommunityFeed"
import SpaceSettingsDialog, { type SpaceSettingsUpdate } from "@/components/communities/SpaceSettingsDialog"
import { getDisplayAvatar } from "@/lib/avatar"
import { POPULAR_COMMUNITY_CATEGORIES } from "@/lib/communityCategories"
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
    const [browseCategories, setBrowseCategories] = useState<string[]>([])
    const [browseTags, setBrowseTags] = useState<string[]>([])
    const [isMember, setIsMember] = useState(false)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editLoading, setEditLoading] = useState(false)

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

    useEffect(() => {
        const fetchData = async () => {
            if (!id || typeof id !== "string") return
            try {
                let data = await getCommunityBySlug(id)
                if (!data) data = await getCommunity(id)
                if (!data) { router.push("/dashboard/communities"); return }

                const allCommunities = await getAllCommunities()
                const categories = Array.from(
                    new Set(
                        [...POPULAR_COMMUNITY_CATEGORIES, ...allCommunities.map((item) => item.category || "").filter(Boolean)]
                    )
                ).sort((a, b) => a.localeCompare(b))
                const tags = Array.from(
                    new Set(allCommunities.flatMap((item) => item.tags || []))
                ).sort((a, b) => a.localeCompare(b))

                setCommunity(data)
                setBrowseCategories(categories)
                setBrowseTags(tags)
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

    const handleEditSave = async (updateData: SpaceSettingsUpdate) => {
        if (!community) return
        setEditLoading(true)
        try {
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
    const founderProfile = members.find((member) => member.userId === community.creatorId)
    const founderProfileSlug = founderProfile?.slug || founderProfile?.username || null

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Compact Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 shrink-0 rounded-full border border-border/60 md:h-12 md:w-12">
                                <AvatarImage
                                    src={community.image || community.bannerImage || ""}
                                    alt={`${community.name} logo`}
                                    className="object-cover"
                                />
                                <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-background text-xs font-semibold text-primary">
                                    {community.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <nav className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                                    <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => router.push('/dashboard/communities')}>Communities</span>
                                    <ChevronRight className="w-2.5 h-2.5" />
                                </nav>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-base md:text-lg font-bold tracking-tight truncate leading-tight">
                                        {community.name}
                                    </h1>
                                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4">
                                        {community.memberCount} members
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {isCreator ? (
                                <div className="flex items-center gap-1.5">
                                    <Button size="sm" variant="outline" onClick={() => setEditDialogOpen(true)} className="h-8 px-3 text-xs">
                                        <Pencil className="w-3 h-3 mr-1.5" /> Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteDialogOpen(true)}>
                                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    variant={isMember ? "outline" : "default"}
                                    onClick={handleJoinLeave}
                                    disabled={actionLoading}
                                    className="h-8 px-4 text-xs font-semibold"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : isMember ? (
                                        "Joined"
                                    ) : community.isPaid ? (
                                        `Join — ₦${community.price?.toLocaleString()}`
                                    ) : (
                                        "Join Space"
                                    )}
                                </Button>
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
                            <TabsList className="flex items-center justify-start h-auto p-0 bg-transparent border-b rounded-none w-full gap-6 mb-4">
                                <TabsTrigger value="feed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2 text-sm font-medium">Feed</TabsTrigger>
                                <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2 text-sm font-medium">About</TabsTrigger>
                                <TabsTrigger value="members" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2 text-sm font-medium">Members</TabsTrigger>
                                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-2 text-sm font-medium">Reviews</TabsTrigger>
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
                                <div className="p-4 md:p-6 bg-card border border-border/40 rounded-lg space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            Mission & Description
                                        </div>
                                        <p className="text-sm text-foreground/90 leading-relaxed max-w-2xl">
                                            {community.description}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            Space Rules & Guidelines
                                        </div>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                            {[
                                                "Respect all members and their perspectives.",
                                                "No spam, solicitation, or self-promotion.",
                                                "Keep posts relevant to the space topic.",
                                                "Maintain confidentiality of shared discussions.",
                                            ].map((rule, i) => (
                                                <li key={i} className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border border-border/20">
                                                    <span className="text-primary font-mono text-xs mt-0.5 shrink-0">0{i + 1}</span>
                                                    <p className="text-sm text-foreground/80 leading-snug">{rule}</p>
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
                                                    className={`flex items-center gap-3 border-b border-border/40 px-4 py-2 last:border-b-0 ${isClickable ? "cursor-pointer transition-colors hover:bg-muted/40" : ""}`}
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
                                                    <Avatar className="h-8 w-8 border border-border/50">
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
                                <div className="border border-border/40 rounded-lg p-4 bg-card">
                                    <CommunityReviewSection communityId={community.id} user={user} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-4 lg:col-span-1 py-1">
                        {/* Compact Sidebar Stats */}
                        <Card className="border shadow-none bg-card/40 overflow-hidden">
                            <div className="border-b bg-muted/30 p-3 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Members</span>
                                    <span className="font-bold">{community.memberCount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Access</span>
                                    <span className="font-bold capitalize">{community.privacy}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Entry</span>
                                    <span className="font-bold">{community.isPaid ? `₦${community.price?.toLocaleString()}/mo` : 'Free'}</span>
                                </div>
                            </div>
                            <div className="p-3">
                                {community.rating !== undefined && community.rating > 0 && (
                                    <StarRating rating={community.rating} count={community.reviewsCount} className="mb-0" />
                                )}
                            </div>
                        </Card>

                        {(community.category || (community.tags || []).length > 0) && (
                            <Card className="border shadow-none bg-card/40">
                                <CardContent className="space-y-4 p-3">
                                    {community.category && (
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                This Space Category
                                            </div>
                                            <Link href={`/dashboard/communities?category=${encodeURIComponent(community.category)}`} className="inline-flex">
                                                <Badge variant="secondary" className="h-5 rounded-full px-2.5 text-[10px] font-medium">
                                                    {community.category}
                                                </Badge>
                                            </Link>
                                        </div>
                                    )}

                                    {(community.tags || []).length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                This Space Tags
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(community.tags || []).map((tag) => (
                                                    <Link key={tag} href={`/dashboard/communities?tag=${encodeURIComponent(tag)}`}>
                                                        <Badge variant="outline" className="h-5 rounded-full border-border/60 px-2.5 text-[10px] font-medium text-muted-foreground">
                                                            #{tag}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Creator */}
                        <div className="space-y-2 px-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                Space Founder
                            </div>
                            {founderProfileSlug ? (
                                <Link href={`/${founderProfileSlug}`} className="flex items-center gap-2.5 group">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-sm font-semibold shrink-0 group-hover:border-primary/30 transition-colors">
                                        {community.creatorName?.[0]}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold group-hover:text-primary transition-colors">{community.creatorName}</div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-sm font-semibold shrink-0">
                                        {community.creatorName?.[0]}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold">{community.creatorName}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interaction Actions */}
                        <div className="pt-2 space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-8 text-xs font-medium border-border/60 hover:bg-muted/50 transition-all rounded-lg"
                                onClick={() => {
                                    const inviteUrl = `${window.location.origin}/invite/${community.slug}`;
                                    navigator.clipboard.writeText(inviteUrl).then(() => {
                                        toast.success('Invite link copied!');
                                    }).catch(() => {
                                        toast.error('Failed to copy link');
                                    });
                                }}
                            >
                                <Share className="w-3 h-3 mr-2" /> Copy Invite Link
                            </Button>

                            {isMember && !isCreator && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-8 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all rounded-lg"
                                    onClick={handleJoinLeave}
                                >
                                    <LogOut className="w-3 h-3 mr-2" />
                                    Leave Space
                                </Button>
                            )}
                        </div>

                        {(browseCategories.length > 0 || browseTags.length > 0) && (
                            <Card className="border shadow-none bg-card/40">
                                <CardContent className="space-y-4 p-3">
                                    {browseCategories.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                Browse Space Categories
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {browseCategories.map((category) => (
                                                    <Link key={category} href={`/dashboard/communities?category=${encodeURIComponent(category)}`}>
                                                        <Badge variant="secondary" className="h-5 rounded-full px-2.5 text-[10px] font-medium">
                                                            {category}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {browseTags.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                Browse Space Tags
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {browseTags.map((tag) => (
                                                    <Link key={tag} href={`/dashboard/communities?tag=${encodeURIComponent(tag)}`}>
                                                        <Badge variant="outline" className="h-5 rounded-full border-border/60 px-2.5 text-[10px] font-medium text-muted-foreground">
                                                            #{tag}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}


                    </aside>
                </div>
            </div>

            <SpaceSettingsDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                community={community}
                saving={editLoading}
                onSave={handleEditSave}
            />

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
