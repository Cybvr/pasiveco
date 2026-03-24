"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, ShieldAlert, LogOut } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export default function SecurityLock({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isLocked, setIsLocked] = useState(false)
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const router = useRouter()

  const logout = useCallback(async () => {
    await auth.signOut()
    router.push("/auth/login")
  }, [router])

  const checkLock = useCallback(() => {
    if (!user || !user.isPinEnabled) {
        setIsLocked(false)
        return
    }

    const lastActive = localStorage.getItem("lastActive")
    const now = Date.now()

    if (lastActive && now - parseInt(lastActive) > INACTIVITY_TIMEOUT) {
      setIsLocked(true)
    }
  }, [user])

  useEffect(() => {
    if (!user?.isPinEnabled) {
        setIsLocked(false)
        return
    }

    checkLock()

    const updateActivity = () => {
      localStorage.setItem("lastActive", Date.now().toString())
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach(event => window.addEventListener(event, updateActivity))

    // Initial activity set
    updateActivity()

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity))
    }
  }, [user?.isPinEnabled, checkLock])

  const handleVerify = () => {
    if (pin === user?.pin) {
      setIsLocked(false)
      setPin("")
      setError(false)
      localStorage.setItem("lastActive", Date.now().toString())
    } else {
      setError(true)
      setPin("")
    }
  }

  if (isLocked && user?.isPinEnabled) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-card border shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Locked</h2>
            <p className="text-sm text-muted-foreground">
              Enter your 4-digit security PIN to continue.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={`w-12 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                    pin.length > i ? "border-primary bg-primary/5" : "border-muted bg-muted/20"
                  } ${error ? "border-red-500 animate-shake" : ""}`}
                >
                  {pin.length > i ? "•" : ""}
                </div>
              ))}
            </div>

            <Input
              type="tel"
              maxLength={4}
              value={pin}
              autoFocus
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4)
                setPin(val)
                if (val.length === 4) {
                    // Slight delay for visual feedback
                    setTimeout(() => {
                        if (val === user?.pin) {
                            setIsLocked(false)
                            setPin("")
                            setError(false)
                            localStorage.setItem("lastActive", Date.now().toString())
                        } else {
                            setError(true)
                            setPin("")
                            setTimeout(() => setError(false), 500)
                        }
                    }, 100)
                }
              }}
              className="absolute opacity-0 pointer-events-none"
            />

            {error && (
              <p className="text-xs text-red-500 font-medium flex items-center justify-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Incorrect PIN. Please try again.
              </p>
            )}
          </div>

          <div className="pt-4 space-y-2">
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-red-500"
                onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Switch Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
