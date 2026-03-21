"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Plus, ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getAllCommunities } from "@/services/communityService"
import { Community } from "@/types/community"
import { useAuth } from "@/hooks/useAuth"

export default function CommunityDiscovery() {
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        // Fetch all public communities for discovery
        const allCommunities = await getAllCommunities()
        setCommunities(allCommunities || [])
      } catch (error) {
        console.error("Failed to load communities:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCommunities()
  }, [])

  if (loading) return null // Hide while loading to avoid layout shift

  return (
    <section className="space-y-3 py-2 -mx-1">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Trending Communities
        </h2>
        <Link href="/dashboard/communities" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          Explore all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {communities.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 pb-4 px-1">
            {communities.slice(0, 8).map((community) => (
              <Link key={community.id} href={`/dashboard/communities/${community.id}`} className="w-[100px] block group">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-background ring-2 ring-muted/10 bg-muted group-hover:ring-primary/30 transition-all">
                    {community.image ? (
                      <img src={community.image} alt={community.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Users className="h-6 w-6 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <div className="w-full text-center">
                    <p className="truncate text-[11px] font-bold text-foreground leading-tight">{community.name}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">{community.memberCount} members</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      ) : (
        <div className="px-1">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">No Communities yet</p>
              <p className="text-[11px] text-muted-foreground">Be the first to create a community.</p>
            </div>
            <Button asChild size="sm" variant="secondary" className="h-8 rounded-full text-xs font-bold gap-1.5">
              <Link href="/dashboard/communities/create">
                <Plus className="h-3 w-3" />
                Create Community
              </Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
