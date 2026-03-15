"use client"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/app/common/dashboard/Sidebar"
import { cn } from "@/lib/utils"
import OnboardingModal from "@/app/common/OnboardingModal"
import { useAuth } from "@/hooks/useAuth"
import { getUserProfile } from "@/services/userProfilesService"

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isEditRoute = pathname === "/dashboard/edit"
  const isSettingsRoute = pathname.startsWith("/dashboard/settings")

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid)
          // Show onboarding if profile exists but certain fields are missing
          // This assumes 'gender' is one of the new fields we're collecting
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

  if (isEditRoute) {
    return (
      <>
        <main>{children}</main>
        <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      </>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar - Full height on desktop */}
      <aside className={cn(
        "hidden md:block border-r flex-shrink-0 h-full overflow-y-auto bg-card transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      </aside>

      {/* Main content area (Content only, Header removed as per request) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  )
}
