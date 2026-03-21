"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Loader2, Wand2, ShoppingBag, User as UserIcon, CheckCircle2, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const AIOnboardingSticky = () => {
  const [emailValue, setEmailValue] = useState("")
  const [whatIDo, setWhatIDo] = useState("")
  const [password, setPassword] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
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
    if (!whatIDo.trim()) {
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
    } catch (err) {
      toast.error("Something went wrong. Try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const finalizeOnboarding = async (user: any, data: any) => {
    const uid = user.uid;
    const email = user.email;

    const userData = {
      email: email,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: 'free',
      displayName: data?.profile?.name || '',
      phoneNumber: '',
      avatar: user.photoURL || '',
      profilePicture: user.photoURL || '',
      emailVerified: user.emailVerified || false,
      isActive: true,
      isAdmin: false,
      role: 'user',
      username: email.split('@')[0],
      bio: data?.profile?.bio || '',
      slug: email.split('@')[0],
      brandPreferences: data?.profile?.brandVoice || '',
      category: data?.profile?.category || '',
      links: [],
      socialLinks: []
    }

    await setDoc(doc(db, 'users', uid), userData)

    if (data?.products?.length) {
      const { createProduct } = await import('@/services/productsService')
      const { slugify } = await import('@/utils/slugify')
      for (const p of data.products) {
        try {
          await createProduct({
            userId: uid,
            name: p.name,
            slug: slugify(p.name),
            description: p.description,
            price: Number(p.price),
            currency: 'NGN',
            category: p.productType,
            images: [],
            thumbnail: '',
            status: 'active',
            tags: [],
            details: { deliveryMode: 'silent_email' }
          } as any)
        } catch (err) { console.error(err) }
      }
    }
  }

  const handleEmailSignup = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setIsSigningUp(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailValue, password)
      await finalizeOnboarding(userCredential.user, aiData)
      toast.success("Welcome! Your house is ready.")
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    setIsSigningUp(true)
    try {
      const userCredential = await signInWithPopup(auth, provider)
      const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid))
      if (!docSnap.exists()) {
        await finalizeOnboarding(userCredential.user, aiData)
      }
      toast.success("Welcome! Your house is ready.")
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSigningUp(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-8 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-3xl pointer-events-auto"
        >
          <div className="bg-background/80 backdrop-blur-2xl border border-border/50 shadow-xl rounded-2xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm md:text-base font-medium text-foreground/80 pl-2">
              <span className="whitespace-nowrap italic opacity-60">Hi, my email is</span>
              <div className="relative inline-flex items-center">
                <input
                  type="email" value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  placeholder="david@gmail.com"
                  className={`bg-muted/40 border-b border-border/50 focus:border-primary outline-none px-2 py-0.5 w-32 md:w-48 transition-colors placeholder:text-muted-foreground/30 text-foreground rounded-md text-xs md:text-sm ${isValidPopularEmail ? 'border-green-500/50 text-green-600' : ''}`}
                />
                {isValidPopularEmail && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-1 shrink-0" />}
              </div>
              <span className="whitespace-nowrap italic opacity-60">, and I</span>
              <input
                type="text" value={whatIDo}
                onChange={(e) => setWhatIDo(e.target.value)}
                placeholder="teach fitness..."
                className="bg-muted/40 hover:bg-muted/60 border-b border-border/50 focus:border-primary outline-none px-2 py-0.5 flex-1 min-w-[150px] transition-colors placeholder:text-muted-foreground/30 text-foreground rounded-md text-xs md:text-sm"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !isValidPopularEmail || !whatIDo.trim()}
              className={`rounded-xl px-6 h-10 transition-all font-bold text-sm gap-2 shadow-md ${isValidPopularEmail && whatIDo.trim() ? "bg-primary text-primary-foreground scale-105" : "bg-muted text-muted-foreground opacity-50"}`}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Start Selling
            </Button>
          </div>
        </motion.div>
      </div>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-3xl gap-0 p-0 overflow-hidden border-none shadow-3xl bg-background rounded-3xl">
          <div className="max-h-[85vh] overflow-y-auto">
            <div className="relative h-44 bg-muted overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
               <div className="absolute bottom-4 left-6 flex items-end gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-background border-4 border-background shadow-lg flex items-center justify-center text-primary">
                    <UserIcon className="w-10 h-10" />
                  </div>
                  <div className="pb-1 space-y-0.5">
                    <h2 className="text-xl font-bold">{aiData?.profile?.name}</h2>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] uppercase font-bold tracking-wider">
                      {aiData?.profile?.category}
                    </Badge>
                  </div>
               </div>
            </div>

            <div className="p-6 pt-4 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The Vision</h3>
                  <p className="text-base font-medium leading-relaxed italic text-foreground/80">"{aiData?.profile?.bio}"</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Products</h3>
                  <div className="space-y-1.5">
                    {aiData?.products?.slice(0, 3).map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30 border border-border/50">
                        <span className="font-bold truncate max-w-[150px]">{p.name}</span>
                        <span className="font-black">₦{Number(p.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 p-6 rounded-3xl border border-border/50 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold">Claim Your House</h3>
                  <p className="text-xs text-muted-foreground">Setup your account to start selling these products.</p>
                </div>

                <div className="grid gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={emailValue} className="pl-10 h-12 rounded-xl bg-background pointer-events-none opacity-60" readOnly />
                    </div>
                    <div className="flex-1 relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="password" placeholder="Create Password" value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-background" 
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleEmailSignup} disabled={isSigningUp || password.length < 6}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg hover:scale-[1.01] transition-all"
                  >
                    {isSigningUp ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    Start Selling Now
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
                  </div>

                  <Button 
                    variant="outline" onClick={handleGoogleSignup} disabled={isSigningUp}
                    className="w-full h-12 rounded-xl border-border hover:bg-muted/50 transition-all font-bold"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 mr-2" alt="Google" />
                    Sign up with Google
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AIOnboardingSticky
