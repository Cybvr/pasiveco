
"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  getAuth,
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth"
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from "firebase/firestore"
import { ChevronLeft, Smartphone } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
    confirmationResult: ConfirmationResult | undefined;
  }
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'social' | 'phone' | 'otp'>('social')
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    }
  }, [])

  const setupRecaptcha = (containerId: string) => {
    if (window.recaptchaVerifier) return window.recaptchaVerifier;
    
    auth.useDeviceLanguage();
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
      'callback': () => {},
      'expired-callback': () => {
         setError('Captcha expired. Please try again.')
      }
    });
    return window.recaptchaVerifier;
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    setLoading(true)
    setError('')
    
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
          updatedAt: new Date(),
          plan: 'free',
          isAdmin: false,
          role: 'user',
          username: (result.user.email || '').split('@')[0],
          bio: '',
          profilePicture: result.user.photoURL || '',
          slug: (result.user.email || '').split('@')[0],
        })
      }
      onClose()
      router.push('/dashboard')
    } catch (err: any) {
      setError('Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const verifier = setupRecaptcha('recaptcha-anchor')
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier)
      window.confirmationResult = confirmationResult
      setStep('otp')
    } catch (err: any) {
      console.error(err)
      setError('Failed to send SMS. verify number format (+234...)')
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (!window.confirmationResult) {
      setError('Session expired. Go back.')
      return
    }

    try {
      const result = await window.confirmationResult.confirm(otp)
      const userRef = doc(db, 'users', result.user.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          phoneNumber: result.user.phoneNumber,
          createdAt: new Date(),
          updatedAt: new Date(),
          plan: 'free',
          isAdmin: false,
          role: 'user',
          username: (result.user.phoneNumber || '').slice(-6),
          slug: (result.user.phoneNumber || '').slice(-6),
        })
      }
      onClose()
      router.push('/dashboard')
    } catch (err: any) {
      setError('Invalid code.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPhoneNumber('')
    setOtp('')
    setError('')
    setStep('social')
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = undefined
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
        resetForm()
      }
    }}>
      <DialogContent className="w-[calc(100%-32px)] sm:max-w-[400px] rounded-lg bg-background p-5 sm:p-6 border shadow-xl flex flex-col gap-5 selection:bg-black selection:text-white">
        
        <div id="recaptcha-anchor"></div>

        <DialogHeader className="space-y-1.5 text-center sm:text-left">
           <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
             {step === 'social' ? 'Welcome to Pasive' : step === 'phone' ? 'Phone Login' : 'Enter One-Time Key'}
           </DialogTitle>
           {step === 'social' && (
             <p className="text-sm text-muted-foreground">
               Quickly access your dashboard with social login
             </p>
           )}
           {step === 'phone' && (
             <p className="text-sm text-muted-foreground">
               Enter your number with country code (+234...)
             </p>
           )}
        </DialogHeader>

        <div className="space-y-5">
          {step === 'social' ? (
            <div className="space-y-4 text-center sm:text-left">
              <Button 
                onClick={handleGoogleSignIn} 
                disabled={loading}
                className="w-full h-12 rounded-md font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              <button 
                onClick={() => setStep('phone')}
                className="inline-block text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2 hover:underline hover:text-black transition-all flex items-center justify-center gap-2 mx-auto sm:mx-0"
              >
                <Smartphone className="w-3 h-3" /> or use phone number
              </button>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setStep('social')}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-black mb-5 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>

              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" required placeholder="+234 800 000 0000" className="h-10 rounded-md" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                  {error && <div className="p-2.5 bg-red-50 rounded-md text-[11px] font-medium text-red-600 border border-red-100">{error}</div>}
                  <Button type="submit" disabled={loading} className="w-full h-11 rounded-md font-semibold text-sm">
                    {loading ? 'Sending SMS...' : 'Send Verification Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5 text-center">
                    <Label htmlFor="otp">6-Digit Code</Label>
                    <Input 
                        id="otp" 
                        type="text" 
                        required 
                        maxLength={6} 
                        placeholder="••••••" 
                        className="h-12 rounded-md text-center text-2xl tracking-[0.5em] font-bold" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                    />
                  </div>
                  {error && <div className="p-2.5 bg-red-100 rounded-md text-[11px] font-medium text-red-600">{error}</div>}
                  <Button type="submit" disabled={loading} className="w-full h-11 rounded-md font-semibold text-sm">
                    {loading ? 'Verifying...' : 'Authenticate'}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="text-[10px] text-center text-muted-foreground">
          By continuing, you agree to our <button className="underline hover:text-black">Terms of Service</button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
