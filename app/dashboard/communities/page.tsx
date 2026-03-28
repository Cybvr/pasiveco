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
        // Filter out communities user is already part of for explore
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
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communities</h1>
          <p className="text-sm text-muted-foreground">Hub for networking and sharing.</p>
        </div>
        <Link href="/dashboard/communities/create">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Community
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutGrid className="w-3.5 h-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="w-3.5 h-3.5" /> Recent Activity
            {globalPosts.length > 0 && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 m-0">
          {myCommunities.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Your Communities</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {myCommunities.map(community => (
                  <CommunityCard key={community.id} community={community} isMember={true} />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Explore New Networks</h2>
              <div className="relative w-full md:w-72">
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredExplore.map(community => (
                  <CommunityCard key={community.id} community={community} isMember={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl border-2 border-dashed bg-muted/5">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Social Stream</h2>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Live</span>
            </div>
            
            {globalPosts.length > 0 ? (
              <div className="space-y-4">
                {globalPosts.map(post => {
                  const community = [...myCommunities, ...exploreCommunities].find(c => c.id === post.communityId);
                  return (
                    <div key={post.id} className="relative">
                      {community && (
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                      )}
                      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-md uppercase tracking-wide">
                              {community?.name || 'Community'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-4">{post.message}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-border/30">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                               {post.authorName?.[0] || 'U'}
                             </div>
                             <span className="text-[11px] font-semibold">{post.authorName}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium italic">Just now</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
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
  return (
    <Link href={`/dashboard/communities/${community.id}`}>
      <Card className="h-full border-border/50 overflow-hidden">
        <div className="h-20 bg-gradient-to-br from-primary/20 to-primary/5 relative">
          {community.bannerImage && (
            <img src={community.bannerImage} className="w-full h-full object-cover" alt="" />
          )}
          <div className="absolute -bottom-5 left-4 p-1 bg-background rounded-lg border border-border shadow-sm">
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
              {community.image ? (
                <img src={community.image} className="w-full h-full object-cover" alt="" />
              ) : (
                <Users className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        <CardHeader className="pt-8 pb-3 px-4">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-sm md:text-base line-clamp-2 leading-tight">{community.name}</CardTitle>
            {isMember && (
              <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                Member
              </span>
            )}
          </div>
          <CardDescription className="line-clamp-2 min-h-[2rem] mt-1 text-xs">
            {community.description}
          </CardDescription>
          <div className="mt-2 min-h-[20px]">
            {(community.rating || 0) > 0 ? (
              <StarRating rating={community.rating} count={community.reviewsCount} className="scale-90 origin-left" />
            ) : null}
          </div>
        </CardHeader>
        <CardFooter className="mt-2 flex h-10 items-center justify-between border-t border-border/30 px-4 pt-0 pb-3 text-xs text-muted-foreground">
          <span>{community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}</span>
          <div className="flex items-center gap-3">
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
