"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  getAuth,
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { ArrowRight, Star, Disc, ChevronLeft, Smartphone } from "lucide-react"
import { createReferral } from '@/services/referralService'

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
    confirmationResult: ConfirmationResult | undefined;
  }
}

async function syncToLoops(email?: string, firstName?: string, userId?: string, phoneNumber?: string) {
  try {
    await fetch('/api/loops/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, userId, phoneNumber, source: 'register' }),
    })
  } catch (err) {
    console.warn('[Loops] Failed to sync contact:', err)
  }
}

async function handleAIPendingOnboarding(uid: string, fallbackName: string, fallbackIdentifier: string, fallbackEmail?: string) {
    const pendingDataRaw = localStorage.getItem("pending_onboarding_ai")
    const pendingData = pendingDataRaw ? JSON.parse(pendingDataRaw) : null
    
    const userData = {
        email: fallbackEmail || pendingData?.profile?.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: 'free',
        displayName: pendingData?.profile?.name || fallbackName,
        profilePicture: '',
        isActive: true,
        isAdmin: false,
        role: 'user',
        username: fallbackIdentifier || 'user_' + uid.slice(0, 5),
        bio: pendingData?.profile?.bio || '',
        slug: fallbackIdentifier || 'user_' + uid.slice(0, 5),
        brandPreferences: pendingData?.profile?.brandVoice || '',
        category: pendingData?.profile?.category || '',
        links: [],
        socialLinks: []
    }

    await setDoc(doc(db, 'users', uid), userData)
    syncToLoops(userData.email, userData.displayName, uid)

    // ── Referral attribution ──────────────────────────────────────────────────
    const inviterUid = localStorage.getItem('ref_inviter_uid')
    if (inviterUid && inviterUid !== uid) {
        await createReferral(inviterUid, uid, userData.displayName).catch(console.warn)
        localStorage.removeItem('ref_inviter_uid')
    }
    // ─────────────────────────────────────────────────────────────────────────

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
                    status: 'active',
                    details: { deliveryMode: 'silent_email' }
                } as any)
            } catch (err) { console.error(err) }
        }
    }
    localStorage.removeItem("pending_onboarding_ai")
}

function RegisterContent() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'social' | 'phone' | 'otp'>('social')
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextHref = searchParams.get('next') || '/dashboard'

  // Persist the referrer uid from ?ref= so it survives the OTP multi-step flow
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) localStorage.setItem('ref_inviter_uid', ref)
  }, [searchParams])

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
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { 'size': 'invisible' });
    return window.recaptchaVerifier;
  }

  const handleGoogleRegister = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, provider)
      const userSnap = await getDoc(doc(db, 'users', result.user.uid))
      if (!userSnap.exists()) {
        await handleAIPendingOnboarding(
            result.user.uid, 
            result.user.displayName || '', 
            (result.user.email || '').split('@')[0],
            result.user.email || ''
        )
      }
      router.push(nextHref)
    } catch (err) {
      setError('Google registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const verifier = setupRecaptcha('recaptcha-anchor-reg')
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier)
      window.confirmationResult = confirmationResult
      setStep('otp')
    } catch (err) {
      setError('Invalid phone format (+234...)')
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
    if (!window.confirmationResult) return;

    try {
      const result = await window.confirmationResult.confirm(otp)
      const userSnap = await getDoc(doc(db, 'users', result.user.uid))
      if (!userSnap.exists()) {
        await handleAIPendingOnboarding(
            result.user.uid,
            'New Creator', 
            (result.user.phoneNumber || '').slice(-6)
        )
      }
      router.push(nextHref)
    } catch (err) {
      setError('Invalid OTP code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-foreground selection:text-background font-sans relative">
      
      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-anchor-reg" className="absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"></div>

      {/* ── Form Section: Left ── */}
      <main className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-sm space-y-10">
          
          <div className="space-y-4">
            <div className="lg:hidden mb-12">
               <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                  Pasive<span className="text-primary italic font-light">co.</span>
               </h1>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.9]">
              {step === 'social' ? (
                <>Join <br/><span className="opacity-40 italic font-light">the house</span></>
              ) : step === 'phone' ? (
                <>Phone <br/><span className="opacity-40 italic font-light">Verification</span></>
              ) : (
                <>Enter <br/><span className="opacity-40 italic font-light">OTP Key</span></>
              )}
            </h2>
          </div>

          <div className="space-y-6">
            {step === 'social' ? (
              <div className="space-y-6">
                <Button 
                  onClick={handleGoogleRegister} 
                  disabled={loading}
                  className="w-full h-14 rounded-none bg-foreground text-background hover:bg-foreground/90 transition-all text-lg font-bold flex items-center justify-center gap-4 px-8"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                  Register with Google
                </Button>

                <button 
                  onClick={() => setStep('phone')}
                  className="w-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-black flex items-center justify-center gap-2 pt-4 transition-colors"
                >
                  <Smartphone className="w-3 h-3" /> or use your phone number
                </button>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => setStep('social')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-black mb-8 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {step === 'phone' ? (
                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone-reg" className="text-[10px] uppercase font-bold tracking-widest opacity-60">Mobile Number (+234...)</Label>
                      <Input id="phone-reg" type="tel" required placeholder="+234 800 000 0000" className="h-14 rounded-none border-2 border-muted focus:border-foreground transition-all text-lg" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-none font-bold text-lg">
                      {loading ? 'Sending SMS...' : 'Initialize Registry'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-2 text-center">
                      <Label htmlFor="otp-reg" className="text-[10px] uppercase font-bold tracking-widest opacity-60">On-Time Access Key</Label>
                      <Input 
                        id="otp-reg" 
                        type="text" 
                        required 
                        maxLength={6} 
                        placeholder="••••••" 
                        className="h-20 rounded-none text-center text-4xl tracking-[0.5em] font-black border-2 border-muted focus:border-foreground" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-none font-bold text-lg">
                      {loading ? 'Confirming...' : 'Validate & Join'}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 animate-in fade-in duration-300">
                 <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest leading-none">{error}</p>
              </div>
            )}
          </div>

          <div className="pt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 group">
               <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Member already?</p>
               <Link 
                  href={`/auth/login?next=${encodeURIComponent(nextHref)}`} 
                  className="text-lg font-black tracking-tight flex items-center gap-2"
                >
                  Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            
            <Link href="/" className="text-[10px] uppercase tracking-[0.3em] font-mono opacity-40 hover:opacity-100 transition-opacity">
              Back to home
            </Link>
          </div>

        </div>
      </main>

      {/* ── Visual Section: Right ── */}
      <section className="relative hidden lg:flex flex-col items-center justify-center p-12 bg-zinc-950 overflow-hidden group border-l">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/login-creator.png"
            alt="Creator Visual"
            fill
            className="object-cover opacity-50 transition-transform duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-zinc-950/40" />
        </div>

        <div className="relative z-10 w-full max-w-xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-700 text-[10px] uppercase tracking-widest text-zinc-400 rounded-none bg-zinc-950/80 backdrop-blur">
              <Disc className="w-3 h-3 animate-spin duration-3000" /> Authorized Access Only
            </div>
            <h1 className="text-7xl xl:text-8xl font-black leading-[0.85] tracking-tighter text-zinc-100 uppercase">
              Identify <br />
              <span className="italic font-light opacity-50 block mt-2 text-5xl xl:text-6xl">yourself</span>
            </h1>
          </div>
          
          <div className="pt-12 border-t border-zinc-800 flex justify-between items-center text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">
            <p>Pasive Registry</p>
            <p>System v2.5</p>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 text-zinc-100/5 pointer-events-none select-none">
            <Star className="w-40 h-40" />
        </div>
      </section>
    </div>
  )
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center font-black uppercase tracking-tighter lg:text-3xl">Initializing...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
