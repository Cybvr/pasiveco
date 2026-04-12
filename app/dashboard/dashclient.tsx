"use client"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/app/common/dashboard/Sidebar"
import { cn } from "@/lib/utils"
import UserOnboarding from "@/app/auth/UserOnboarding"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import MobileBottomNav from "@/app/common/dashboard/MobileBottomNav"
import DashboardHeader from "@/app/common/dashboard/DashboardHeader"
import SecurityLock from "@/app/common/dashboard/SecurityLock"

function getDashboardPageTitle(pathname: string) {
  const dashboardTitle = "Dashboard | Pasive"

  const routes: Array<{ match: (path: string) => boolean; title: string }> = [
    { match: (path) => path === "/dashboard", title: "Dashboard" },
    { match: (path) => path === "/dashboard/analytics", title: "Analytics" },
    { match: (path) => path === "/dashboard/audience", title: "Audience" },
    { match: (path) => path === "/dashboard/bookings", title: "Bookings" },
    { match: (path) => path === "/dashboard/communities", title: "Spaces" },
    { match: (path) => path === "/dashboard/communities/create", title: "Create Space" },
    { match: (path) => path === "/dashboard/communities/explore", title: "Explore Spaces" },
    { match: (path) => path.startsWith("/dashboard/communities/") && path.includes("/spaces/"), title: "Space Thread" },
    { match: (path) => path.startsWith("/dashboard/communities/"), title: "Space Details" },
    { match: (path) => path === "/dashboard/customers", title: "Customers" },
    { match: (path) => path === "/dashboard/discovery", title: "Discovery" },
    { match: (path) => path.startsWith("/dashboard/discovery/"), title: "Discovery Category" },
    { match: (path) => path === "/dashboard/earnings", title: "Earnings" },
    { match: (path) => path.startsWith("/dashboard/earnings/"), title: "Earnings Details" },
    { match: (path) => path === "/dashboard/edit", title: "Edit Profile" },
    { match: (path) => path === "/dashboard/help", title: "Help & Support" },
    { match: (path) => path.startsWith("/dashboard/help/"), title: "Help Article" },
    { match: (path) => path === "/dashboard/library", title: "Library" },
    { match: (path) => path.startsWith("/dashboard/library/"), title: "Library Item" },
    { match: (path) => path === "/dashboard/manager", title: "Manager" },
    { match: (path) => path.startsWith("/dashboard/manager/"), title: "Manager Chat" },
    { match: (path) => path === "/dashboard/messages", title: "Messages" },
    { match: (path) => path === "/dashboard/network", title: "Network" },
    { match: (path) => path === "/dashboard/notifications", title: "Notifications" },
    { match: (path) => path === "/dashboard/payouts", title: "Withdrawals" },
    { match: (path) => path.startsWith("/dashboard/payouts/"), title: "Withdrawal Details" },
    { match: (path) => path === "/dashboard/posts/new", title: "New Post" },
    { match: (path) => path.startsWith("/dashboard/posts/"), title: "Post Details" },
    { match: (path) => path === "/dashboard/products", title: "Products" },
    { match: (path) => path === "/dashboard/products/new", title: "New Product" },
    { match: (path) => path.startsWith("/dashboard/products/"), title: "Product Details" },
    { match: (path) => path === "/dashboard/settings", title: "Settings" },
    { match: (path) => path === "/dashboard/settings/account", title: "My Profile" },
    { match: (path) => path === "/dashboard/settings/analytics", title: "Analytics Settings" },
    { match: (path) => path === "/dashboard/settings/appearance", title: "Appearance" },
    { match: (path) => path === "/dashboard/settings/domains", title: "Domains" },
    { match: (path) => path === "/dashboard/settings/earnings", title: "Earnings Settings" },
    { match: (path) => path.startsWith("/dashboard/settings/earnings/"), title: "Earnings Settings Details" },
    { match: (path) => path === "/dashboard/settings/members", title: "Members" },
    { match: (path) => path === "/dashboard/settings/notifications", title: "Notification Settings" },
    { match: (path) => path === "/dashboard/settings/payment-method", title: "Payout Methods" },
    { match: (path) => path === "/dashboard/settings/plan-billing", title: "Plan & Billing" },
    { match: (path) => path === "/dashboard/settings/security", title: "Security" },
    { match: (path) => path === "/dashboard/settings/withdrawals", title: "Withdrawal Settings" },
    { match: (path) => path.startsWith("/dashboard/settings/withdrawals/"), title: "Withdrawal Settings Details" },
    { match: (path) => path === "/dashboard/wallet", title: "Wallet" },
    { match: (path) => path.startsWith("/dashboard/wallet/"), title: "Wallet Details" },
  ]

  const matchedRoute = routes.find((route) => route.match(pathname))
  return matchedRoute ? `${matchedRoute.title} | Dashboard | Pasive` : dashboardTitle
}

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isManager = pathname.startsWith('/dashboard/manager')
  
  useEffect(() => {
    document.title = getDashboardPageTitle(pathname)
  }, [pathname])

  useEffect(() => {
    const SESSION_KEY = 'onboarding_checked'
    if (sessionStorage.getItem(SESSION_KEY)) return

    const checkOnboarding = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          const userData = userDoc.data()
          const onboardingCompleted = Boolean(userData?.onboardingCompleted)
          sessionStorage.setItem(SESSION_KEY, '1')
          setShowOnboarding(!onboardingCompleted)
        } catch (error) {
          console.error("Error checking onboarding status:", error)
        }
      }
    }
    checkOnboarding()
  }, [user])

  const handleOnboardingClose = async () => {
    setShowOnboarding(false)
    // Persist the dismissal so the popup never reappears
    if (user?.uid) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        }, { merge: true })
      } catch (e) {
        console.error("Failed to persist onboarding dismissal:", e)
      }
    }
  }

  return (
    <SecurityLock>
      {isManager ? (
        <div className="h-screen overflow-hidden bg-background">
          <main className="h-full">{children}</main>
        </div>
      ) : (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
          {/* Sidebar - Desktop only */}
          <aside className={cn(
            "hidden md:block border-r flex-shrink-0 h-full overflow-y-auto bg-card transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-12" : "w-48"
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
        </div>
      )}

      {showOnboarding && user?.uid && (
        <UserOnboarding 
          onComplete={handleOnboardingClose} 
          userId={user.uid}
          displayName={user.displayName || ''}
        />
      )}
    </SecurityLock>
  )
}
