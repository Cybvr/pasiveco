"use client"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/app/common/dashboard/Sidebar"
import { cn } from "@/lib/utils"
import OnboardingModal from "@/app/common/OnboardingModal"
import { useAuth } from "@/hooks/useAuth"
import { getUserProfile } from "@/services/userProfilesService"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const isEditRoute = pathname === "/dashboard/edit"

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

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  if (isEditRoute) {
    return (
      <>
        <main>{children}</main>
        <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      </>
    )
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Mobile Header */}
      <header className="flex md:hidden items-center justify-between px-4 h-14 border-b bg-card">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar isCollapsed={false} onToggle={() => {}} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
           <span className="text-lg font-black tracking-tighter">pasive</span>
        </div>
        <div className="w-10" /> {/* Spacer for centering logo if needed */}
      </header>

      {/* Sidebar - Desktop only */}
      <aside className={cn(
        "hidden md:block border-r flex-shrink-0 h-full overflow-y-auto bg-card transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      </aside>

      {/* Main content area */}
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
