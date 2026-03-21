"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Shield, Calendar, Share, MoreVertical, LogOut, Check, Loader2, Info, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { getCommunity, isCommunityMember, joinCommunity, leaveCommunity } from "@/services/communityService"
import { Community } from "@/types/community"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner" // Assuming toast is available, if not I'll check components/ui

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
      if (!id || typeof id !== 'string') return
      try {
        const data = await getCommunity(id)
        if (!data) {
          router.push('/dashboard/communities')
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
        // Confirm leave? Maybe just leave for now
        await leaveCommunity(community.id, user.uid)
        setIsMember(false)
        setCommunity(prev => prev ? {...prev, memberCount: prev.memberCount - 1} : null)
        // toast.success("Left community")
      } else {
        await joinCommunity(community.id, user.uid)
        setIsMember(true)
        setCommunity(prev => prev ? {...prev, memberCount: prev.memberCount + 1} : null)
        // toast.success("Joined community!")
      }
    } catch (error: any) {
      console.error("Error joining/leaving community:", error)
      // toast.error(error.message || "Action failed")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-8 w-32" />
        <div className="h-64 bg-muted rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
             <Skeleton className="h-40 w-full rounded-2xl" />
             <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
             <Skeleton className="h-60 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!community) return null

  const isCreator = user?.uid === community.creatorId

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/communities" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Communities
        </Link>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" className="rounded-full shadow-sm">
             <Share className="w-4 h-4" />
           </Button>
           <Button variant="outline" size="icon" className="rounded-full shadow-sm">
             <MoreVertical className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <div className="relative group">
        <div className="h-64 md:h-80 w-full bg-gradient-to-tr from-muted/50 to-primary/20 rounded-3xl overflow-hidden border border-border shadow-inner">
          {community.bannerImage && (
            <img src={community.bannerImage} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-1000" alt="" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex items-end p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-6">
              <div className="flex gap-6 items-center">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] bg-card border-2 border-background shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                  {community.image ? (
                    <img src={community.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Users className="w-10 h-10 md:w-16 md:h-16 text-primary/40" />
                  )}
                </div>
                <div>
                   <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground drop-shadow-sm">{community.name}</h1>
                   <div className="flex items-center gap-4 mt-2 text-muted-foreground font-medium">
                     <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {community.memberCount} members</span>
                     <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Since {community.createdAt.toDate().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                   </div>
                </div>
              </div>
              <div className="flex gap-3">
                {isCreator ? (
                  <Button className="rounded-full px-8 h-12 shadow-xl hover:scale-105 transition-transform" variant="secondary">
                    Admin Tools
                  </Button>
                ) : (
                  <Button 
                    variant={isMember ? "outline" : "default"}
                    className={`rounded-full px-8 h-12 shadow-xl hover:scale-105 transition-transform ${isMember ? 'bg-background hover:bg-muted' : ''}`}
                    onClick={handleJoinLeave}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : isMember ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Joined
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Join Community
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="feed" className="rounded-lg px-8 data-[state=active]:shadow-sm">Feed</TabsTrigger>
              <TabsTrigger value="about" className="rounded-lg px-8 data-[state=active]:shadow-sm">About</TabsTrigger>
              <TabsTrigger value="members" className="rounded-lg px-8 data-[state=active]:shadow-sm">Members</TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed" className="space-y-6 pt-2">
              {isMember ? (
                <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold">No activity yet</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                    This community is just getting started. Be the first to post something!
                  </p>
                  <Button className="mt-6 rounded-full px-8" variant="outline">
                    Post to Community
                  </Button>
                </div>
              ) : (
                <Card className="border-none shadow-xl bg-gradient-to-b from-primary/5 to-transparent border border-primary/10 overflow-hidden text-center py-16 px-8 rounded-3xl">
                  <Shield className="w-14 h-14 text-primary/40 mx-auto mb-6" />
                  <CardTitle className="text-2xl mb-2">Member-Only Content</CardTitle>
                  <CardDescription className="text-lg max-w-md mx-auto mb-8">
                    Join this community to see the feed, participate in discussions, and connect with other members.
                  </CardDescription>
                  <Button className="rounded-full px-12 h-14 text-lg font-bold shadow-2xl hover:scale-105 transition-transform" onClick={handleJoinLeave}>
                    Join this Community now
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-6 pt-4">
               <div className="prose prose-zinc dark:prose-invert max-w-none">
                 <h3 className="text-2xl font-bold">About {community.name}</h3>
                 <p className="text-muted-foreground text-lg leading-relaxed">
                   {community.description}
                 </p>
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                       <h4 className="font-bold flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-primary" /> Community Rules</h4>
                       <ul className="text-sm space-y-2 text-muted-foreground">
                         <li>Be respectful to all members</li>
                         <li>No spam or self-promotion</li>
                         <li>Post relevant content only</li>
                       </ul>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                       <h4 className="font-bold flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-primary" /> Privacy & Guidelines</h4>
                       <p className="text-sm text-muted-foreground">
                         This is a {community.privacy} community. All content shared here should align with the community's theme and purpose.
                       </p>
                    </div>
                 </div>
               </div>
            </TabsContent>

            <TabsContent value="members" className="pt-4">
              <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/10 rounded-3xl border border-border/30">
                <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Members list is hidden</h3>
                <p className="text-muted-foreground mt-1">Only admins can see the full list of members for privacy.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
           <Card className="rounded-3xl border-border/50 shadow-lg overflow-hidden">
             <CardHeader className="bg-muted/30 border-b border-border/50">
               <CardTitle className="text-lg flex items-center gap-2">
                 <Shield className="w-4 h-4 text-primary" />
                 Moderation
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                     C
                   </div>
                   <div>
                     <p className="text-sm font-bold">Creator</p>
                     <p className="text-xs text-muted-foreground">{community.creatorName}</p>
                   </div>
                </div>
                <div className="pt-2">
                   <p className="text-xs text-muted-foreground">
                     The creator manages content and membership for this community.
                   </p>
                </div>
             </CardContent>
           </Card>

           <Card className="rounded-3xl border-border/50 shadow-lg overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50">
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-muted-foreground">Active Members</span>
                       <span className="font-bold">{community.memberCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-muted-foreground">Posts / month</span>
                       <span className="font-bold">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-muted-foreground">Type</span>
                       <span className="capitalize font-bold">{community.privacy}</span>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {isMember && !isCreator && (
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={handleJoinLeave}>
                <LogOut className="w-4 h-4 mr-2" />
                Leave Community
              </Button>
           )}
        </div>
      </div>
    </div>
  )
}
