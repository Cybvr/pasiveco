"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Plus, Users, Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { getUserCommunities, getAllCommunities } from "@/services/communityService"
import { Community } from "@/types/community"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { POPULAR_COMMUNITY_CATEGORIES } from "@/lib/communityCategories"

export default function CommunitiesPage() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const [myCommunities, setMyCommunities] = useState<Community[]>([])
    const [exploreCommunities, setExploreCommunities] = useState<Community[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
    const [activeCategory, setActiveCategory] = useState<string>(searchParams.get("category") || "")
    const [activeTag, setActiveTag] = useState<string>(searchParams.get("tag") || "")

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return
            try {
                const [my, all] = await Promise.all([
                    getUserCommunities(user.uid),
                    getAllCommunities(),
                ])
                setMyCommunities(my || [])
                const explore = (all || []).filter(c => !my.some(m => m.id === c.id))
                setExploreCommunities(explore)
            } catch (error) {
                console.error("Error fetching communities:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user])

    useEffect(() => {
        setSearchQuery(searchParams.get("q") || "")
        setActiveCategory(searchParams.get("category") || "")
        setActiveTag(searchParams.get("tag") || "")
    }, [searchParams])

    const allVisibleCommunities = [...myCommunities, ...exploreCommunities]
    const availableCategories = Array.from(
        new Set(
            [...POPULAR_COMMUNITY_CATEGORIES, ...allVisibleCommunities.map((community) => community.category || "").filter(Boolean)]
        )
    )
    const availableTags = Array.from(
        new Set(
            allVisibleCommunities.flatMap((community) => community.tags || [])
        )
    ).sort((a, b) => a.localeCompare(b))

    const matchesFilters = (community: Community) => {
        const normalizedQuery = searchQuery.toLowerCase()
        const matchesSearch =
            community.name.toLowerCase().includes(normalizedQuery) ||
            community.description.toLowerCase().includes(normalizedQuery) ||
            (community.category || "").toLowerCase().includes(normalizedQuery) ||
            (community.tags || []).some((tag) => tag.toLowerCase().includes(normalizedQuery))

        const matchesCategory = !activeCategory || community.category === activeCategory
        const matchesTag = !activeTag || (community.tags || []).includes(activeTag)

        return matchesSearch && matchesCategory && matchesTag
    }

    const filteredMyCommunities = myCommunities.filter(matchesFilters)
    const filteredExplore = exploreCommunities.filter(matchesFilters)
    const hasActiveFilters = !!(activeCategory || activeTag || searchQuery)

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                    <Skeleton className="h-9 w-36 shrink-0" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Explore</h1>
                </div>
                <Link href="/dashboard/communities/create" className="shrink-0">
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Create
                    </Button>
                </Link>
            </div>

            {/* Categories - Horizontal Scroll */}
            <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveCategory("")}
                        className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!activeCategory
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground hover:bg-muted/80"
                            }`}
                    >
                        All
                    </button>
                    {availableCategories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setActiveCategory((current) => current === category ? "" : category)}
                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${activeCategory === category
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground hover:bg-muted/80"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main layout: content left, sidebar right */}
            <div className="flex gap-6 items-start">
                {/* Content */}
                <div className="min-w-0 flex-1">
                    {myCommunities.length > 0 && (
                        <section className="space-y-3 mb-6">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Your Spaces</h2>
                            {filteredMyCommunities.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {filteredMyCommunities.map(community => (
                                        <CommunityCard key={community.id} community={community} isMember={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed bg-muted/5 px-4 py-8 text-center text-sm text-muted-foreground">
                                    No joined spaces match the current filters.
                                </div>
                            )}
                        </section>
                    )}

                    <section className="space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Explore New Networks</h2>
                        {filteredExplore.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                {filteredExplore.map(community => (
                                    <CommunityCard key={community.id} community={community} isMember={false} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 rounded-2xl border-2 border-dashed bg-muted/5">
                                <Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                                <h3 className="text-sm font-bold">No new networks found</h3>
                                <p className="text-muted-foreground text-xs mt-1">
                                    {searchQuery ? `Nothing matches "${searchQuery}"` : "You've joined all available spaces!"}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right sidebar — desktop only */}
                <aside className="hidden lg:flex flex-col gap-5 w-48 shrink-0 sticky top-4">
                    {/* Search */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Search</p>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Name or niche..."
                                className="pl-8 h-8 text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    {availableTags.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Tag</p>
                            <div className="flex flex-col gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveTag("")}
                                    className={`text-left rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${!activeTag
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    All tags
                                </button>
                                {availableTags.slice(0, 5).map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setActiveTag((current) => current === tag ? "" : tag)}
                                        className={`text-left rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${activeTag === tag
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() => { setActiveCategory(""); setActiveTag(""); setSearchQuery("") }}
                            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 text-left transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </aside>
            </div>
        </div>
    )
}

function CommunityCard({ community, isMember }: { community: Community, isMember: boolean }) {
    return (
        <Link href={`/dashboard/communities/${community.id}`}>
            <Card className="h-full border-border/50 overflow-hidden">
                <CardHeader className="relative pb-2 px-3">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8 border border-border/30">
                                {community.image ? (
                                    <AvatarImage src={community.image} alt={community.name} />
                                ) : (
                                    <AvatarFallback>
                                        <Users className="w-4 h-4" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <CardTitle className="text-sm line-clamp-2 leading-tight">{community.name}</CardTitle>
                        </div>
                    </div>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                        {community.description}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex h-9 items-center justify-between border-t border-border/30 px-3 pt-0 pb-2 text-xs text-muted-foreground">
                    <span>{community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}</span>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                            {community.isPaid ? `₦${(community.price || 0).toLocaleString()}/mo` : 'Free'}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}