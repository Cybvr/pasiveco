"use client"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/app/common/dashboard/Sidebar"
import { cn } from "@/lib/utils"
import OnboardingModal from "@/app/common/OnboardingModal"
import { useAuth } from "@/hooks/useAuth"
import { getUserProfile } from "@/services/userProfilesService"
import MobileBottomNav from "@/app/common/dashboard/MobileBottomNav"

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid)
          if (profile && !profile.gender) {
            setShowOnboarding(true)
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error)
        }
      }
    }
    checkOnboarding()
  }, [user])

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Sidebar - Desktop only */}
      <aside className={cn(
        "hidden md:block border-r flex-shrink-0 h-full overflow-y-auto bg-card transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-14" : "w-56"
      )}>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
        <main className={cn("flex-1 min-h-0", pathname !== '/dashboard/edit' && "overflow-y-auto")}>
          <div className={cn(
            pathname !== '/dashboard/edit' && "p-4 md:p-8 max-w-[1600px] mx-auto",
            pathname === '/dashboard/edit' && "h-full"
          )}>
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
      
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  )
}
