"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

// Fire-and-forget: sync new user to Loops mailing list
async function syncToLoops(email: string, firstName: string, userId: string) {
  try {
    await fetch('/api/loops/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, userId, source: 'register' }),
    })
  } catch (err) {
    console.warn('[Loops] Failed to sync contact:', err)
  }
}

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextHref = searchParams.get('next') || '/dashboard'

  useEffect(() => {
    const pendingDataRaw = localStorage.getItem("pending_onboarding_ai")
    if (pendingDataRaw) {
      const pendingData = JSON.parse(pendingDataRaw)
      if (pendingData?.profile?.email) {
        setEmail(pendingData.profile.email)
      }
    }
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push(nextHref)
      }
    })

    return () => unsubscribe()
  }, [nextHref, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid
      
      // Check for pending AI onboarding data
      const pendingDataRaw = localStorage.getItem("pending_onboarding_ai")
      const pendingData = pendingDataRaw ? JSON.parse(pendingDataRaw) : null

      const userData = {
        email: email,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: 'free',
        displayName: pendingData?.profile?.name || '',
        phoneNumber: '',
        avatar: '',
        profilePicture: '',
        emailVerified: false,
        isActive: true,
        isAdmin: false,
        role: 'user',
        username: email.split('@')[0],
        bio: pendingData?.profile?.bio || '',
        slug: email.split('@')[0],
        brandPreferences: pendingData?.profile?.brandVoice || '',
        category: pendingData?.profile?.category || '',
        links: [],
        socialLinks: []
      }

      // Create user document in Firestore
      await setDoc(doc(db, 'users', uid), userData)

      // Sync to Loops (fire-and-forget)
      syncToLoops(email, userData.displayName || '', uid)

      // Create AI products if any
      if (pendingData?.products?.length) {
        const { createProduct } = await import('@/services/productsService')
        const { slugify } = await import('@/utils/slugify')
        
        for (const p of pendingData.products) {
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
          } catch (err) {
            console.error("Failed to create AI product:", err)
          }
        }
      }

      localStorage.removeItem("pending_onboarding_ai")
      router.push(nextHref)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider)
      const uid = userCredential.user.uid
      const email = userCredential.user.email || ""
      
      const { getDoc, doc } = await import('firebase/firestore')
      const docSnap = await getDoc(doc(db, 'users', uid))
      
      if (!docSnap.exists()) {
         const pendingDataRaw = localStorage.getItem("pending_onboarding_ai")
         const pendingData = pendingDataRaw ? JSON.parse(pendingDataRaw) : null
         
         const userData = {
            email: email,
            createdAt: new Date(),
            updatedAt: new Date(),
            plan: 'free',
            displayName: userCredential.user.displayName || pendingData?.profile?.name || '',
            phoneNumber: '',
            avatar: userCredential.user.photoURL || '',
            profilePicture: userCredential.user.photoURL || '',
            emailVerified: true,
            isActive: true,
            isAdmin: false,
            role: 'user',
            username: email.split('@')[0] || uid.slice(0, 5),
            bio: pendingData?.profile?.bio || '',
            slug: email.split('@')[0] || uid.slice(0, 5),
            brandPreferences: pendingData?.profile?.brandVoice || '',
            category: pendingData?.profile?.category || '',
            links: [],
            socialLinks: []
          }
          
          await setDoc(doc(db, 'users', uid), userData)

          // Sync to Loops (fire-and-forget)
          syncToLoops(email, userData.displayName || '', uid)
          
          if (pendingData?.products?.length) {
            const { createProduct } = await import('@/services/productsService')
            const { slugify } = await import('@/utils/slugify')
            for (const p of pendingData.products) {
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
            }
          }
          localStorage.removeItem("pending_onboarding_ai")
      }
      
      router.push(nextHref)
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign up was cancelled. Please try again.')
      } else {
        console.error("Google sign in error:", error)
        setError('Unable to sign up. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-foreground selection:text-background font-sans overflow-hidden">
      
      {/* ── Visual Section: Desktop Hero ── */}
      <section className="relative hidden lg:flex flex-col items-center justify-center p-12 bg-zinc-950 overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/login-creator.png"
            alt="Creator Visual"
            fill
            className="object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900/50 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-700 text-[10px] uppercase tracking-widest text-zinc-400 rounded-none bg-zinc-950/80 backdrop-blur">
              <Disc className="w-3 h-3 animate-spin duration-3000" /> Platform Initialization
            </div>
            <h1 className="text-7xl xl:text-8xl font-black leading-[0.85] tracking-tighter text-zinc-100 uppercase text-left">
              Start your <br />
              <span className="italic font-light opacity-50 block mt-2">new journey</span>
            </h1>
          </div>
          
          <div className="pt-12 border-t border-zinc-800 flex justify-between items-center text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">
            <p>Pasive Registry</p>
            <p>Access Level: Creator</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-none blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 text-zinc-100/10 pointer-events-none select-none">
            <Star className="w-40 h-40" />
        </div>
      </section>

      {/* ── Form Section ── */}
      <main className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-12">
          
          <div className="space-y-4 text-left">
             {/* Logo for Mobile */}
            <div className="lg:hidden mb-12">
               <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                  Pasive<span className="text-primary italic font-light">co.</span>
               </h1>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.9]">
              Create account <br />
              <span className="opacity-40 italic font-light">to start earning</span>
            </h2>
          </div>

          <div className="space-y-8">
            <Button 
              onClick={handleGoogleSignIn} 
              onMouseEnter={() => setIsGoogleHovered(true)}
              onMouseLeave={() => setIsGoogleHovered(false)}
              className="w-full h-16 rounded-none bg-foreground text-background hover:bg-foreground/90 transition-all font-bold uppercase tracking-widest flex items-center justify-between px-8"
            >
              <div className="flex items-center gap-4 text-lg">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Signup
              </div>
              <ArrowRight className={`w-6 h-6 transition-transform duration-300 ${isGoogleHovered ? 'translate-x-2' : ''}`} />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
                <span className="bg-background px-4 text-muted-foreground">
                  Secure Entry
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest opacity-60">Identity (Email)</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="rounded-none border-2 border-muted hover:border-foreground focus:border-foreground transition-all h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] uppercase font-bold tracking-widest opacity-60">Secret Key (Password)</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="rounded-none border-2 border-muted hover:border-foreground focus:border-foreground transition-all h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <div className="p-3 bg-destructive/10 border-l-2 border-destructive uppercase text-[10px] font-bold tracking-widest text-destructive">{error}</div>}
              <Button type="submit" className="w-full h-16 rounded-none bg-background text-foreground border-2 border-foreground hover:bg-foreground hover:text-background transition-all font-black uppercase tracking-tighter text-xl">
                Create Account
              </Button>
            </form>
          </div>

          <div className="pt-12 border-t border-dashed border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
               <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Already a member?</p>
               <Link 
                  href={`/auth/login?next=${encodeURIComponent(nextHref)}`} 
                  className="text-lg font-black tracking-tight hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            <Link href="/" className="text-[10px] uppercase tracking-[0.3em] font-mono opacity-40 hover:opacity-100 transition-opacity">
              Back to home
            </Link>
          </div>

        </div>

        {/* Decorative subtle blurs */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-none blur-[100px] pointer-events-none -z-10" />
      </main>

    </div>
  )
}
