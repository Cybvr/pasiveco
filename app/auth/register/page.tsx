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
    } catch (error) {
      setError(error.message)
    }
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider)
      const uid = userCredential.user.uid
      const email = userCredential.user.email || ""
      
      // For Google sign-in, check if user doc exists. 
      // If NOT, we process the onboarding
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
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign up was cancelled. Please try again.')
      } else {
        console.error("Google sign in error:", error)
        setError('Unable to sign up. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Register</CardTitle>
          <CardDescription className="text-center">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
              Sign up with Google
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href={`/auth/login?next=${encodeURIComponent(nextHref)}`} className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
