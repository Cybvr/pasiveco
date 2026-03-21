"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Shield, Share, MoreVertical, LogOut, Loader2, Plus, Globe, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { getCommunity, isCommunityMember, joinCommunity, leaveCommunity } from "@/services/communityService"
import { Community } from "@/types/community"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function CommunityDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [community, setCommunity] = useState<Community | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== "string") return
      try {
        const data = await getCommunity(id)
        if (!data) {
          router.push("/dashboard/communities")
          return
        }
        setCommunity(data)
        if (user) {
          const member = await isCommunityMember(id, user.uid)
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

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-40 w-full rounded-none" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-16 w-full rounded-none" />
            <Skeleton className="h-96 w-full rounded-none" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-none" />
            <Skeleton className="h-48 w-full rounded-none" />
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
      <div className="bg-zinc-950 border-b border-zinc-800 text-zinc-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-8">
          <Link
            href="/dashboard/communities"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-mono text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Communities
          </Link>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center px-2 py-0.5 border border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 bg-zinc-900/50">
                {community.privacy}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                {community.name}
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                {community.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div>
                  <div className="text-lg font-bold text-primary tabular-nums">{community.memberCount}</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-0.5">Members</div>
                </div>
                {community.isPaid && (
                  <div>
                    <div className="text-lg font-bold text-emerald-400">₦{community.price?.toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-0.5">/ month</div>
                  </div>
                )}
                <div>
                  <div className="text-lg font-bold text-zinc-300">Mar 2026</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-0.5">Founded</div>
                </div>
                {community.category && (
                  <div>
                    <div className="text-lg font-bold text-zinc-300">{community.category}</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-0.5">Category</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[200px]">
              {isCreator ? (
                <Button className="rounded-none h-10 px-6 text-sm font-semibold bg-primary text-primary-foreground">
                  Admin Panel
                </Button>
              ) : (
                <Button
                  variant={isMember ? "outline" : "default"}
                  className={cn(
                    "rounded-none h-10 px-6 text-sm font-semibold transition-all",
                    isMember
                      ? "border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900"
                      : "bg-primary text-primary-foreground"
                  )}
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
                <Button
                  variant="outline"
                  className="flex-1 rounded-none border-zinc-800 h-9 hover:bg-zinc-900 gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
                >
                  <Share className="w-3.5 h-3.5" /> Share
                </Button>
                <Button
                  variant="outline"
                  className="rounded-none border-zinc-800 w-9 h-9 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 shrink-0"
                >
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
              <TabsList className="bg-transparent border-b border-zinc-200 dark:border-zinc-800 w-full justify-start rounded-none h-auto p-0 mb-8 overflow-x-auto">
                {["feed", "about", "members"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all capitalize"
                  >
                    {tab === "feed" ? "Feed" : tab === "about" ? "About" : "Members"}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="feed" className="focus-visible:outline-none">
                {isMember ? (
                  <div className="space-y-4">
                    <div className="border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
                      <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                      <h3 className="text-sm font-semibold">Post to the community</h3>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Start a conversation with members.
                      </p>
                      <Button className="rounded-none px-6 text-xs font-semibold" variant="outline">
                        New Post <Plus className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                    <div className="py-16 text-center border border-zinc-100 dark:border-zinc-900">
                      <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest">No activity yet</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative py-16 px-8 text-center bg-zinc-950 text-zinc-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50 pointer-events-none" />
                    <div className="relative z-10 space-y-4">
                      <Shield className="w-10 h-10 text-primary mx-auto opacity-60" />
                      <h2 className="text-xl font-bold tracking-tight">Members only</h2>
                      <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                        Join this community to access the feed and engage with members.
                      </p>
                      <Button
                        className="rounded-none h-10 px-8 text-sm font-semibold bg-primary text-primary-foreground"
                        onClick={handleJoinLeave}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Community"}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about" className="focus-visible:outline-none animate-in fade-in duration-300">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="text-[10px] uppercase tracking-widest text-primary font-bold">About</div>
                    <h3 className="text-base font-bold tracking-tight">Mission</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{community.description}</p>
                  </div>

                  <div className="space-y-4 border-l border-zinc-200 dark:border-zinc-800 pl-8">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Community Rules</div>
                    <ul className="space-y-4">
                      {[
                        "Respect all members and their perspectives.",
                        "No spam, solicitation, or self-promotion.",
                        "Keep posts relevant to the community topic.",
                      ].map((rule, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-primary font-mono text-[10px] mt-0.5 shrink-0">0{i + 1}</span>
                          <p className="text-sm text-zinc-400 leading-snug">{rule}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="members" className="focus-visible:outline-none">
                <div className="py-16 text-center border border-zinc-200 dark:border-zinc-800">
                  <Users className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold">Member list is private</h3>
                  <p className="text-xs text-muted-foreground mt-1">Only admins can view the full registry.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">Creator</div>
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-bold shrink-0 group-hover:border-primary transition-colors">
                  {community.creatorName?.[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{community.creatorName}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Founder</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">Details</div>
              <div className="space-y-2">
                {[
                  { label: "Visibility", value: community.privacy },
                  { label: "Engagement", value: "Moderate" },
                  { label: "Growth", value: "+12% / mo", accent: true },
                ].map(({ label, value, accent }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2"
                  >
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className={cn("text-xs font-semibold uppercase", accent && "text-primary")}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Card className="rounded-none border-none bg-zinc-950 text-zinc-100 p-5 space-y-3 relative overflow-hidden">
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary/20 blur-xl pointer-events-none" />
                <Globe className="w-5 h-5 text-primary opacity-60" />
                <h4 className="text-sm font-semibold leading-snug">Support this community</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Member contributions keep this community independent and growing.
                </p>
                <Button
                  size="sm"
                  className="w-full rounded-none bg-zinc-100 text-zinc-950 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 h-8"
                >
                  Learn More
                </Button>
              </Card>
            </div>

            {isMember && !isCreator && (
              <Button
                variant="ghost"
                className="w-full text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded-none font-mono text-[10px] uppercase tracking-widest h-8"
                onClick={handleJoinLeave}
              >
                <LogOut className="w-3 h-3 mr-1.5" />
                Leave Community
              </Button>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}