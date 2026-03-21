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

export default function CommunitiesPage() {
  const { user } = useAuth()
  const [myCommunities, setMyCommunities] = useState<Community[]>([])
  const [exploreCommunities, setExploreCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const [my, all] = await Promise.all([
          getUserCommunities(user.uid),
          getAllCommunities()
        ])
        setMyCommunities(my || [])
        // Filter out communities user is already part of for explore
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
          <p className="text-muted-foreground mt-1">Join creators and fans in private spaces.</p>
        </div>
        <Link href="/dashboard/communities/create">
          <Button className="rounded-full px-6 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            Create Community
          </Button>
        </Link>
      </div>

      {myCommunities.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Your Communities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCommunities.map(community => (
              <CommunityCard key={community.id} community={community} isMember={true} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Explore Communities</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              className="pl-10 rounded-full focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredExplore.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExplore.map(community => (
              <CommunityCard key={community.id} community={community} isMember={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No communities found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "Be the first to create a community!"}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

function CommunityCard({ community, isMember }: { community: Community, isMember: boolean }) {
  return (
    <Link href={`/dashboard/communities/${community.id}`}>
      <Card className="h-full group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 relative">
          {community.bannerImage && (
            <img src={community.bannerImage} className="w-full h-full object-cover" alt="" />
          )}
          <div className="absolute -bottom-6 left-6 p-1 bg-background rounded-xl border border-border shadow-sm group-hover:scale-110 transition-transform">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {community.image ? (
                <img src={community.image} className="w-full h-full object-cover" alt="" />
              ) : (
                <Users className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        <CardHeader className="pt-10 pb-4">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-xl line-clamp-1">{community.name}</CardTitle>
            {isMember && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Member
              </span>
            )}
          </div>
          <CardDescription className="line-clamp-2 min-h-[2.5rem] mt-1">
            {community.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-0 flex justify-between items-center text-sm text-muted-foreground border-t border-border/30 mt-4 h-12">
          <span>{community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </CardFooter>
      </Card>
    </Link>
  )
}
