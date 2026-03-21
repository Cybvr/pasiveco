"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save, Users, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { createCommunity } from "@/services/communityService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CreateCommunityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    privacy: "public" as "public" | "private",
    category: "other",
    price: 0,
    isPaid: false,
    image: "",
    bannerImage: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError("You must be logged in to create a community.")
      return
    }
    
    if (!formData.name.trim()) {
      setError("Please fill in the community name.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const communityId = await createCommunity({
        ...formData,
        creatorId: user.uid,
        creatorName: user.displayName || "Unknown Creator",
        tags: []
      })
      router.push(`/dashboard/communities/${communityId}`)
    } catch (err: any) {
      console.error("Error creating community:", err)
      const isPermissionError = err.message?.toLowerCase().includes("permission") || 
                               err.message?.toLowerCase().includes("insufficient")
      
      if (!isPermissionError) {
        setError(err.message || "Failed to create community. Please try again.")
      }
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/dashboard/communities" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Communities
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Create Community</h1>
        <p className="text-muted-foreground">Start a new space for your community.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-xl border-border/50 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border/50 py-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Community Basics</CardTitle>
            <CardDescription>
              Set the foundation for your community. You can change these details later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-8">
            {error && (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Community Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Creative Rebels Community" 
                maxLength={40}
                required
                className="rounded-xl h-12 text-lg focus-visible:ring-primary/20"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>


            <div className="space-y-3 pt-2">
              <Label>Privacy</Label>
              <RadioGroup 
                defaultValue="public" 
                className="flex flex-col gap-4"
                onValueChange={(val) => setFormData({...formData, privacy: val as 'public' | 'private'})}
              >
                <div className="flex items-start space-x-3 p-4 border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer bg-card">
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="public" className="font-semibold text-base cursor-pointer">Public</Label>
                    <p className="text-sm text-muted-foreground">Anyone can find and join this community.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer bg-card">
                  <RadioGroupItem value="private" id="private" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="private" className="font-semibold text-base cursor-pointer">Private</Label>
                    <p className="text-sm text-muted-foreground">Only invited members can join. Community is hidden from discovery.</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPaid" className="text-base font-semibold">Subscription Based</Label>
                  <p className="text-sm text-muted-foreground">Charge members a monthly fee to access your community.</p>
                </div>
                <Switch 
                  id="isPaid" 
                  checked={formData.isPaid}
                  onCheckedChange={(val) => setFormData({...formData, isPaid: val})}
                />
              </div>
              
              {formData.isPaid && (
                <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="price">Monthly Price (₦)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    placeholder="e.g. 5000" 
                    min="0"
                    required={formData.isPaid}
                    className="rounded-xl h-12 text-lg focus-visible:ring-primary/20"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">Recommended: ₦1,000 - ₦10,000 based on your content value.</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border/50 py-6 px-8 flex justify-between items-center">
            <p className="text-xs text-muted-foreground max-w-[200px]">
              By creating a community, you agree to our Community Guidelines.
            </p>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim() || !user}
              className="rounded-full px-8 h-12 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Community
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
