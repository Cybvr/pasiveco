"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from "firebase/firestore"
import { createRoot } from 'react-dom/client'

export default function Login() {
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextHref = searchParams.get('next') || '/dashboard'

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push(nextHref)
      }
    })

    return () => unsubscribe()
  }, [nextHref, router])

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider)
      const userRef = doc(db, 'users', result.user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date(),
          plan: 'free',
          isAdmin: false
        })
      }
      router.push(nextHref)
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled. Please try again.')
      } else {
        setError('Unable to sign in with Google. Please try again.')
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
          <h1 className="text-3xl font-bold mb-2">Grow your creative business.</h1>
          <p className="text-white/80">Join Pasiveco's community of creators and start earning from your content today.</p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to manage your creator assets</p>
          </div>

          <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="space-y-1 p-0 md:p-6 mb-4 md:mb-0">
              <CardTitle className="text-2xl hidden md:block">Login</CardTitle>
              <CardDescription className="hidden md:block">
                Sign in with Google to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0 md:p-6">
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
                Continue with Google
              </Button>
              
              {error && <p className="text-destructive text-sm font-medium">{error}</p>}
              
              <div className="text-center text-sm pt-2">
                Don&apos;t have an account?{" "}
                <Link 
                  href={`/auth/register?next=${encodeURIComponent(nextHref)}`} 
                  className="font-bold underline text-primary hover:text-primary/80 transition-colors"
                >
                  Create free account
                </Link>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="pt-8 border-t border-dashed mt-8">
                  <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-widest">Developer Tools</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs opacity-50 hover:opacity-100"
                    onClick={async () => {
                      const user = auth.currentUser;
                      if (user) {
                        const UserOnboarding = (await import('../UserOnboarding')).default;
                        const container = document.createElement('div');
                        document.body.appendChild(container);
                        const root = createRoot(container);
                        root.render(
                          <UserOnboarding
                            onComplete={() => {
                              root.unmount();
                              container.remove();
                              window.location.href = '/dashboard';
                            }}
                            userId={user.uid}
                          />
                        );
                      }
                    }}
                  >
                    Test Onboarding Flow
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
