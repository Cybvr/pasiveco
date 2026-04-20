'use client'

import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, UserRound } from 'lucide-react'

export default function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, stopImpersonating, realUser } = useAuth()

  if (!isImpersonating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="bg-white/20 p-1.5 rounded-full shrink-0">
          <UserRound className="h-4 w-4" />
        </div>
        <p className="text-sm font-medium truncate">
          Viewing as <span className="font-bold underline">{impersonatedUser?.displayName || impersonatedUser?.email}</span>
          <span className="hidden sm:inline opacity-80 ml-2">
            (Logged in as {realUser?.displayName || realUser?.email})
          </span>
        </p>
      </div>
      
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={stopImpersonating}
        className="h-8 bg-white text-blue-600 hover:bg-blue-50 font-bold shrink-0 ml-4"
      >
        <LogOut className="h-3.5 w-3.5 mr-1.5" />
        Stop
      </Button>
    </div>
  )
}
