'use client'
import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { getUser, updateUser, type UserIntegrations } from "@/services/userService"
import { useAuth } from "@/hooks/useAuth"
import { Cable, Save, ExternalLink, HelpCircle, Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function IntegrationsSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [integrations, setIntegrations] = useState<UserIntegrations>({})

  useEffect(() => {
    const loadIntegrations = async () => {
      if (!user?.uid) return
      try {
        const profile = await getUser(user.uid)
        if (profile?.integrations) {
          setIntegrations(profile.integrations)
        }
      } catch (error) {
        console.error("Error loading integrations:", error)
      } finally {
        setLoading(false)
      }
    }
    loadIntegrations()
  }, [user])

  const handleSave = async () => {
    if (!user?.uid) return
    setSaving(true)
    try {
      await updateUser(user.uid, { integrations })
      toast({ title: "Settings saved", description: "Your integrations have been updated." })
    } catch (error) {
      console.error("Error saving integrations:", error)
      toast({ title: "Save failed", description: "Please try again later.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading integrations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Cable className="w-6 h-6 text-primary" />
          Business Integrations
        </h2>
        <p className="text-muted-foreground text-sm">
          Connect your favorite tools to track growth and automate your workflow.
        </p>
      </div>

      <Separator className="bg-primary/5" />

      {/* Meta Pixel Section */}
      <Card className="border-primary/10 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 flex items-center justify-center p-2">
                <img src="/images/integrations/meta.svg" alt="Meta" className="w-full h-full object-contain" style={{ filter: 'invert(31%) sepia(94%) font-weight(700) saturate(2581%) hue-rotate(204deg) brightness(97%) contrast(101%)' }} />
              </div>
              <div>
                <CardTitle className="text-base font-black tracking-tight">Meta Pixel</CardTitle>
                <CardDescription className="text-xs">Track sales, ad performance, and retarget visitors.</CardDescription>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href="https://www.facebook.com/business/help/952192354843755" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>How do I find my Pixel ID?</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Meta Pixel ID</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="Ex: 123456789012345" 
                value={integrations.metaPixelId || ''}
                onChange={(e) => setIntegrations(prev => ({ ...prev, metaPixelId: e.target.value }))}
                className="bg-muted/30 border-primary/10 focus:border-primary/50 font-mono text-sm"
              />
              <Button 
                onClick={handleSave} 
                disabled={saving}
                size="sm"
                className="gap-2 font-black uppercase text-[10px] tracking-widest h-10 px-6 shrink-0"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug px-1">
              Once saved, your Meta Pixel will automatically track visits and purchases across your storefront.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mailchimp Section */}
      <Card className="border-primary/10 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE01B]/20 flex items-center justify-center p-2">
                <img src="/images/integrations/mailchimp.svg" alt="Mailchimp" className="w-full h-full object-contain" />
              </div>
              <div>
                <CardTitle className="text-base font-black tracking-tight">Mailchimp</CardTitle>
                <CardDescription className="text-xs">Automatically sync customers to your email list.</CardDescription>
              </div>
            </div>
            <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${integrations.mailchimp?.connected ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground border-primary/5'}`}>
              {integrations.mailchimp?.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">API Key</label>
              <Input 
                type="password"
                placeholder="Ex: 123456789...-us1" 
                value={integrations.mailchimp?.apiKey || ''}
                onChange={(e) => setIntegrations(prev => ({ 
                  ...prev, 
                  mailchimp: { ...(prev.mailchimp || { listId: '', connected: false }), apiKey: e.target.value } 
                }))}
                className="bg-muted/30 border-primary/10 focus:border-primary/50 font-mono text-xs h-9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Audience (List) ID</label>
              <Input 
                placeholder="Ex: a1b2c3d4e5" 
                value={integrations.mailchimp?.listId || ''}
                onChange={(e) => setIntegrations(prev => ({ 
                  ...prev, 
                  mailchimp: { ...(prev.mailchimp || { apiKey: '', connected: false }), listId: e.target.value } 
                }))}
                className="bg-muted/30 border-primary/10 focus:border-primary/50 font-mono text-xs h-9"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="mc-connected"
                checked={integrations.mailchimp?.connected || false}
                onChange={(e) => setIntegrations(prev => ({ 
                  ...prev, 
                  mailchimp: { ...(prev.mailchimp || { apiKey: '', listId: '' }), connected: e.target.checked } 
                }))}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="mc-connected" className="text-xs font-bold cursor-pointer">Enable Mailchimp Sync</label>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              size="sm"
              className="gap-2 font-black uppercase text-[10px] tracking-widest h-9 px-6"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zapier Section */}
      <Card className="border-primary/10 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF4F00]/10 flex items-center justify-center p-2">
                <img src="/images/integrations/zapier.svg" alt="Zapier" className="w-full h-full object-contain" style={{ filter: 'invert(37%) sepia(93%) saturate(3952%) hue-rotate(7deg) brightness(101%) contrast(106%)' }} />
              </div>
              <div>
                <CardTitle className="text-base font-black tracking-tight">Zapier</CardTitle>
                <CardDescription className="text-xs">Send sales data to 5,000+ apps via Webhooks.</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Zapier Webhook URL</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="Ex: https://hooks.zapier.com/hooks/catch/123/abc/" 
                value={integrations.zapierWebhookUrl || ''}
                onChange={(e) => setIntegrations(prev => ({ ...prev, zapierWebhookUrl: e.target.value }))}
                className="bg-muted/30 border-primary/10 focus:border-primary/50 font-mono text-xs h-9"
              />
              <Button 
                onClick={handleSave} 
                disabled={saving}
                size="sm"
                className="gap-2 font-black uppercase text-[10px] tracking-widest h-9 px-6 shrink-0"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug px-1">
              Create a "Webhooks by Zapier" Zap and paste the "Catch Hook" URL here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* TikTok Pixel Section */}
      <Card className="border-primary/10 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center p-2">
                <img src="/images/integrations/tiktok.svg" alt="TikTok" className="w-full h-full object-contain invert" />
              </div>
              <div>
                <CardTitle className="text-base font-black tracking-tight">TikTok Pixel</CardTitle>
                <CardDescription className="text-xs">Track sales and optimize your TikTok ad campaigns.</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">TikTok Pixel ID</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="Ex: C8L5S... (usually a string of letters/numbers)" 
                value={integrations.tiktokPixelId || ''}
                onChange={(e) => setIntegrations(prev => ({ ...prev, tiktokPixelId: e.target.value }))}
                className="bg-muted/30 border-primary/10 focus:border-primary/50 font-mono text-xs h-9"
              />
              <Button 
                onClick={handleSave} 
                disabled={saving}
                size="sm"
                className="gap-2 font-black uppercase text-[10px] tracking-widest h-9 px-6 shrink-0"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Tag Manager Section */}
      <Card className="border-primary/10 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4285F4]/10 flex items-center justify-center p-2">
                <img src="/images/integrations/gtm.svg" alt="GTM" className="w-full h-full object-contain" />
              </div>
              <div>
                <CardTitle className="text-base font-black tracking-tight">Google Tag Manager</CardTitle>
                <CardDescription className="text-xs">Install your GTM container for custom tracking.</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">GTM Container ID</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="Ex: GTM-XXXXXXX" 
                value={integrations.gtmId || ''}
                onChange={(e) => setIntegrations(prev => ({ ...prev, gtmId: e.target.value }))}
                className="bg-muted/30 border-primary/10 focus:border-primary/50 font-mono text-xs h-9"
              />
              <Button 
                onClick={handleSave} 
                disabled={saving}
                size="sm"
                className="gap-2 font-black uppercase text-[10px] tracking-widest h-9 px-6 shrink-0"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ConvertKit Section */}
      <Card className="border-primary/10 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/[0.02] border-b border-primary/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F95F5F]/10 flex items-center justify-center p-2">
                <img src="/images/integrations/convertkit.svg" alt="ConvertKit" className="w-full h-full object-contain" />
              </div>
              <div>
                <CardTitle className="text-base font-black tracking-tight">ConvertKit</CardTitle>
                <CardDescription className="text-xs">Connect your creator-focused email audience.</CardDescription>
              </div>
            </div>
            <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${integrations.convertkit?.connected ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground border-primary/5'}`}>
              {integrations.convertkit?.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ConvertKit API Key</label>
            <Input 
              type="password"
              placeholder="Ex: your_api_key" 
              value={integrations.convertkit?.apiKey || ''}
              onChange={(e) => setIntegrations(prev => ({ 
                ...prev, 
                convertkit: { ...(prev.convertkit || { connected: false }), apiKey: e.target.value } 
              }))}
              className="bg-muted/30 border-primary/10 focus:border-primary/50 font-mono text-xs h-9"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="ck-connected"
                checked={integrations.convertkit?.connected || false}
                onChange={(e) => setIntegrations(prev => ({ 
                  ...prev, 
                  convertkit: { ...(prev.convertkit || { apiKey: '' }), connected: e.target.checked } 
                }))}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="ck-connected" className="text-xs font-bold cursor-pointer">Enable ConvertKit Sync</label>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              size="sm"
              className="gap-2 font-black uppercase text-[10px] tracking-widest h-9 px-6"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
