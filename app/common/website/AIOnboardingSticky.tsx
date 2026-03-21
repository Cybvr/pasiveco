"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Loader2, Wand2, ShoppingBag, User as UserIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const AIOnboardingSticky = () => {
  const [emailValue, setEmailValue] = useState("")
  const [whatIDo, setWhatIDo] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [aiData, setAiData] = useState<any>(null)
  const router = useRouter()

  const popularDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "me.com", "live.com", "aol.com"];
  const isValidPopularEmail = emailValue.includes("@") && popularDomains.some(domain => emailValue.toLowerCase().endsWith(domain));

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!isValidPopularEmail) {
      toast.error("Please provide a valid personal email (like Gmail or Yahoo) to continue!");
      return;
    }

    if (!whatIDo.trim() || whatIDo.length < 5) {
      toast.error("Tell us a bit more about what you do so I can design your brand!");
      return;
    }

    setIsGenerating(true)
    const combinedInput = `My email is ${emailValue}, and I ${whatIDo}`;
    
    try {
      const res = await fetch("/api/onboarding-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: combinedInput }),
      })

      if (!res.ok) throw new Error("Failed to generate")
      const data = await res.json()
      setAiData(data)
      setShowResult(true)
      toast.success("AI has designed your brand!")
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong. Try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-8 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-3xl pointer-events-auto"
        >
          <div className="bg-background/80 backdrop-blur-2xl border border-border/50 shadow-xl rounded-2xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm md:text-base font-medium text-foreground/80 pl-2">
              <span className="whitespace-nowrap italic opacity-60">Hi, my email is</span>
              <div className="relative inline-flex items-center">
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  placeholder="david@gmail.com"
                  className={`bg-muted/40 border-b border-border/50 focus:border-primary outline-none px-2 py-0.5 w-32 md:w-48 transition-colors placeholder:text-muted-foreground/30 text-foreground rounded-md text-xs md:text-sm ${isValidPopularEmail ? 'border-green-500/50 text-green-600' : ''}`}
                />
                {isValidPopularEmail && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-1 shrink-0" />
                )}
              </div>
              <span className="whitespace-nowrap italic opacity-60">, and I</span>
              <input
                type="text"
                value={whatIDo}
                onChange={(e) => setWhatIDo(e.target.value)}
                placeholder="teach fitness..."
                className="bg-muted/40 hover:bg-muted/60 border-b border-border/50 focus:border-primary outline-none px-2 py-0.5 flex-1 min-w-[150px] transition-colors placeholder:text-muted-foreground/30 text-foreground rounded-md text-xs md:text-sm"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !isValidPopularEmail || !whatIDo.trim()}
              className={`rounded-xl px-6 h-10 transition-all font-bold text-sm gap-2 shadow-md ${
                isValidPopularEmail && whatIDo.trim() ? "bg-primary text-primary-foreground scale-105" : "bg-muted text-muted-foreground opacity-50"
              }`}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Start Selling
            </Button>
          </div>
        </motion.div>
      </div>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-3xl gap-0 p-0 overflow-hidden border-none shadow-3xl bg-background rounded-3xl">
          <div className="max-h-[85vh] overflow-y-auto">
            {/* Hero Preview */}
            <div className="relative h-48 bg-muted overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
               <div className="absolute bottom-6 left-8 flex items-end gap-5">
                  <div className="w-24 h-24 rounded-2xl bg-background border-4 border-background shadow-lg flex items-center justify-center text-primary">
                    <UserIcon className="w-12 h-12" />
                  </div>
                  <div className="pb-2 space-y-1">
                    <h2 className="text-2xl font-bold">{aiData?.profile?.name}</h2>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-wider">
                      {aiData?.profile?.category}
                    </Badge>
                  </div>
               </div>
            </div>

            <div className="p-8 pt-6 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Brand Vision</h3>
                  <p className="text-lg font-medium leading-relaxed italic text-foreground/80">
                    "{aiData?.profile?.bio}"
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tone & Strategy</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiData?.profile?.brandVoice}
                  </p>
                </div>
              </div>

              <hr className="border-border/50" />

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  First Products to Launch
                </h3>
                <div className="grid gap-3">
                  {aiData?.products?.map((product: any, idx: number) => (
                    <div key={idx} className="group p-4 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{product.name}</h4>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-background border text-muted-foreground">
                            {product.productType.replace("-", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold">₦{Number(product.price).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => {
                    localStorage.setItem("pending_onboarding_ai", JSON.stringify(aiData));
                    router.push(`/auth/register?onboarding=ai`);
                  }}
                  size="lg" 
                  className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-lg gap-2 shadow-xl hover:scale-[1.02] transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Selling My Products
                </Button>
                <Button 
                  variant="outline" 
                   size="lg"
                  onClick={() => setShowResult(false)}
                  className="h-14 rounded-2xl px-8 border-border"
                >
                  Edit My Intro
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AIOnboardingSticky
