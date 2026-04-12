"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Users, Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { getUserCommunities, getAllCommunities } from "@/services/communityService"
import { Community } from "@/types/community"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getGlobalFeed, Post } from "@/services/postService"
import { Activity } from "lucide-react"
import StarRating from "@/components/products/StarRating"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

function CommunitiesPageContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [myCommunities, setMyCommunities] = useState<Community[]>([])
  const [exploreCommunities, setExploreCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [globalPosts, setGlobalPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const [my, all, global] = await Promise.all([
          getUserCommunities(user.uid),
          getAllCommunities(),
          getGlobalFeed(user.uid)
        ])
        setMyCommunities(my || [])
        const explore = (all || []).filter(c => !my.some(m => m.id === c.id))
        setExploreCommunities(explore)
        setGlobalPosts(global || [])
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
  }, [searchParams])

  const matchesSearch = (community: Community) => {
    const normalizedQuery = searchQuery.toLowerCase()
    return (
      community.name.toLowerCase().includes(normalizedQuery) ||
      community.description.toLowerCase().includes(normalizedQuery)
    )
  }

  const filteredMyCommunities = myCommunities.filter(matchesSearch)
  const filteredExplore = exploreCommunities.filter(matchesSearch)
  const hasActiveSearch = !!searchQuery
  const popularSpaces = [...myCommunities, ...exploreCommunities]
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 5)

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
      {/* Main layout: content left, sidebar right */}
      <div className="flex gap-6 items-start">
        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 pb-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Latest</h2>
              <Link href="/dashboard/communities/explore" className="shrink-0">
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                  Explore
                </Button>
              </Link>
            </div>

            {globalPosts.length > 0 ? (
              <div className="space-y-3">
                {globalPosts.map(post => {
                  const community = [...myCommunities, ...exploreCommunities].find(c => c.id === post.communityId)
                  const authorHandle = (post.authorUsername || post.authorSlug || "").replace(/^@/, "").trim()
                  const authorHref = authorHandle ? `/${authorHandle}` : null
                  const postHref = `/dashboard/communities/${community?.slug || post.communityId}/spaces/${post.id}`
                  return (
                    <div key={post.id}>
                      <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          {community ? (
                            <Link
                              href={`/dashboard/communities/${community.id}`}
                              className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-md uppercase tracking-wide transition-colors hover:bg-primary/10"
                            >
                              {community.name}
                            </Link>
                          ) : (
                            <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-md uppercase tracking-wide">
                              Space
                            </span>
                          )}
                        </div>
                        <Link href={postHref} className="mb-3 block text-sm leading-relaxed transition-colors hover:text-foreground/80">
                          {post.message}
                          {post.mediaUrl && (
                            <div className="mt-2 overflow-hidden rounded-lg border border-border/40">
                              <img src={post.mediaUrl} alt="Shared media" className="h-auto max-h-[300px] w-full object-contain" />
                            </div>
                          )}
                        </Link>
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                          {authorHref ? (
                            <Link href={authorHref} className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={post.authorImage} />
                                <AvatarFallback className="text-[10px] font-bold">
                                  {post.authorName?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] font-semibold">{post.authorName}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={post.authorImage} />
                                <AvatarFallback className="text-[10px] font-bold">
                                  {post.authorName?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] font-semibold">{post.authorName}</span>
                            </div>
                          )}
                          <Link href={postHref} className="text-[10px] text-muted-foreground font-medium italic transition-colors hover:text-foreground">
                            {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
                <Activity className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-bold">Quiet for now</h3>
                <p className="text-xs text-muted-foreground mt-1">Join spaces to see the latest activity from members.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col gap-5 w-48 shrink-0 sticky top-4">
          {/* Search */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Search Spaces</p>
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

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Popular</p>
            <div className="space-y-0.5">
              {popularSpaces.map((community) => (
                <Link
                  key={community.id}
                  href={`/dashboard/communities/${community.id}`}
                  className="flex items-center gap-2 rounded-md px-1 py-1.5 transition-colors hover:bg-accent/50"
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={community.image || community.bannerImage} alt={community.name} />
                    <AvatarFallback className="text-[10px] font-semibold">
                      {community.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium leading-none text-foreground">{community.name}</p>
                    <p className="mt-1 text-[10px] leading-none text-muted-foreground">
                      {community.memberCount.toLocaleString()} {community.memberCount === 1 ? "member" : "members"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Clear search */}
          {hasActiveSearch && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 text-left transition-colors"
            >
              Clear search
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}

export default function CommunitiesPage() {
  return (
    <Suspense fallback={<div className="space-y-6 animate-in fade-in duration-500" />}>
      <CommunitiesPageContent />
    </Suspense>
  )
}

function CommunityCard({ community, isMember }: { community: Community, isMember: boolean }) {
  const communityImage = community.image || community.bannerImage

  return (
    <Link href={`/dashboard/communities/${community.id}`}>
      <Card className="h-full border-border/50 overflow-hidden">
        <div className="h-20 sm:h-28 bg-gradient-to-br from-primary/20 to-primary/5 relative">
          {communityImage ? (
            <img src={communityImage} className="w-full h-full object-cover" alt={community.name} />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardHeader className="pb-2 px-3">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-sm line-clamp-2 leading-tight">{community.name}</CardTitle>
            {isMember && (
              <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                Member
              </span>
            )}
          </div>
          <CardDescription className="line-clamp-2 min-h-[2rem] mt-1 text-xs">
            {community.description}
          </CardDescription>
          <div className="mt-1.5 min-h-[18px]">
            {(community.rating || 0) > 0 ? (
              <StarRating rating={community.rating} count={community.reviewsCount} className="scale-90 origin-left" />
            ) : null}
          </div>
        </CardHeader>
        <CardFooter className="mt-1 flex h-9 items-center justify-between border-t border-border/30 px-3 pt-0 pb-2 text-xs text-muted-foreground">
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
