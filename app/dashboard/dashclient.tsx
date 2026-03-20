"use client"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/app/common/dashboard/Sidebar"
import { cn } from "@/lib/utils"
import OnboardingModal from "@/app/common/OnboardingModal"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import MobileBottomNav from "@/app/common/dashboard/MobileBottomNav"
import DashboardHeader from "@/app/common/dashboard/DashboardHeader"

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          const userData = userDoc.data()
          const onboardingCompleted = Boolean(userData?.onboardingCompleted)

          setShowOnboarding(!onboardingCompleted)
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
        <DashboardHeader />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className={cn(
            pathname !== '/dashboard/edit' && "mx-auto max-w-[1600px] p-4 md:p-8",
            pathname === '/dashboard/edit' && "min-h-full"
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
