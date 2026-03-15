"use client"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Header from "@/app/common/dashboard/Header"
import Sidebar from "@/app/common/dashboard/Sidebar"
import OnboardingModal from "@/app/common/OnboardingModal"
import { useAuth } from "@/hooks/useAuth"
import { getUserProfile } from "@/services/userProfilesService"

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        {!isSettingsRoute && (
          <div className="hidden md:block w-64 border-r p-4 flex-shrink-0 h-full">
            <Sidebar />
          </div>
        )}

        {/* Content area */}
        <main className="flex-1 overflow-y-auto  lg:p-6 ">
          {children}
        </main>
      </div>
      
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  )
}
