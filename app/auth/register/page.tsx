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
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Image Section */}
      <div className="relative w-full md:w-1/2 h-[300px] md:h-screen overflow-hidden">
        <Image
          src="/images/login-creator.png"
          alt="Nigerian Content Creator"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
        <div className="absolute bottom-6 left-6 text-white max-w-sm">
          <h1 className="text-3xl font-bold mb-2">Start your journey today.</h1>
          <p className="text-white/80">Join thousands of Nigerian creators building their future on Pasiveco.</p>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground mt-2">Join the community of passive income enthusiasts</p>
          </div>

          <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="space-y-1 p-0 md:p-6 mb-6 md:mb-0">
              <CardTitle className="text-2xl hidden md:block">Register</CardTitle>
              <CardDescription className="hidden md:block">
                Choose your preferred way to sign up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-0 md:p-6">
              <Button 
                onClick={handleGoogleSignIn} 
                variant="outline" 
                className="w-full h-12 text-lg font-medium flex items-center justify-center gap-3 transition-all hover:bg-accent"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground font-medium tracking-wider">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    className="h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-destructive text-sm font-medium">{error}</p>}
                <Button type="submit" className="w-full h-11 text-lg font-bold bg-primary hover:scale-[1.01] transition-transform">
                  Create Account
                </Button>
              </form>
              <div className="text-center text-sm pt-4">
                Already have an account?{" "}
                <Link 
                  href={`/auth/login?next=${encodeURIComponent(nextHref)}`} 
                  className="font-bold underline text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
