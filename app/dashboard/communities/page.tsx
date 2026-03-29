"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Users, Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { getUserCommunities, getAllCommunities } from "@/services/communityService"
import { Community } from "@/types/community"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CommunityFeed from "@/components/communities/CommunityFeed"
import { getGlobalFeed, Post } from "@/services/postService"
import { MessageSquare, LayoutGrid, Activity } from "lucide-react"
import StarRating from "@/components/products/StarRating"

export default function CommunitiesPage() {
  const { user } = useAuth()
  const [myCommunities, setMyCommunities] = useState<Community[]>([])
  const [exploreCommunities, setExploreCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
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

  const filteredExplore = exploreCommunities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    <div className="space-y-4 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Communities</h1>
          <p className="text-sm text-muted-foreground">Hub for networking and sharing.</p>
        </div>
        <Link href="/dashboard/communities/create" className="shrink-0">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Create
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <LayoutGrid className="w-3.5 h-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 text-xs sm:text-sm">
            <Activity className="w-3.5 h-3.5" /> Recent Activity
            {globalPosts.length > 0 && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5 m-0">
          {myCommunities.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Your Communities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myCommunities.map(community => (
                  <CommunityCard key={community.id} community={community} isMember={true} />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Explore New Networks</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or niche..."
                  className="pl-10 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredExplore.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredExplore.map(community => (
                  <CommunityCard key={community.id} community={community} isMember={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl border-2 border-dashed bg-muted/5">
                <Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-bold">No new networks found</h3>
                <p className="text-muted-foreground text-xs mt-1">
                  {searchQuery ? `Nothing matches "${searchQuery}"` : "You've joined all available communities!"}
                </p>
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="activity" className="m-0 max-w-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Social Stream</h2>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Live</span>
            </div>

            {globalPosts.length > 0 ? (
              <div className="space-y-3">
                {globalPosts.map(post => {
                  const community = [...myCommunities, ...exploreCommunities].find(c => c.id === post.communityId)
                  return (
                    <div key={post.id} className="relative">
                      {community && (
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                      )}
                      <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-md uppercase tracking-wide">
                            {community?.name || 'Community'}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed mb-3">{post.message}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.authorImage} />
                              <AvatarFallback className="text-[10px] font-bold">
                                {post.authorName?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-semibold">{post.authorName}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium italic">Just now</span>
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
                <p className="text-xs text-muted-foreground mt-1">Join communities to see the latest activity from members.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
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