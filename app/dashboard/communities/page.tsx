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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {myCommunities.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Your Communities</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {myCommunities.map(community => (
              <CommunityCard key={community.id} community={community} isMember={true} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Explore</h2>
          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/dashboard/communities/create">
              <Button>
                <Plus className="w-4 h-4" />
                New
              </Button>
            </Link>
          </div>
        </div>

        {filteredExplore.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExplore.map(community => (
              <CommunityCard key={community.id} community={community} isMember={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-dashed">
            <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-medium">No communities found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
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
        </CardHeader>
        <CardFooter className="px-4 pt-0 pb-3 flex justify-between items-center text-xs text-muted-foreground border-t border-border/30 mt-2 h-10">
          <span>{community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </CardFooter>
      </Card>
    </Link>
  )
}
