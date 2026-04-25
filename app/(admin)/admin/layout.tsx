"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import MobileBottomNav from "@/app/common/dashboard/MobileBottomNav"
import Sidebar from "@/app/common/dashboard/Sidebar"
import AdminHeader from "./components/header"
import { useAuth } from "@/context/AuthContext"
import { getUser } from "@/services/userService"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, realUser, loading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkAdminAccess = async () => {
      if (loading) return

      const authUser = realUser || user

      if (!authUser) {
        router.replace('/auth/login')
        if (isMounted) {
          setIsAuthorized(false)
          setIsCheckingAccess(false)
        }
        return
      }

      try {
        const profile = await getUser(authUser.uid)
        const canAccessAdmin = Boolean(profile?.isAdmin || profile?.role === 'admin')

        if (!canAccessAdmin) {
          router.replace('/dashboard')
        }

        if (isMounted) {
          setIsAuthorized(canAccessAdmin)
        }
      } catch (error) {
        console.error('Error checking admin access:', error)
        router.replace('/dashboard')
        if (isMounted) {
          setIsAuthorized(false)
        }
      } finally {
        if (isMounted) {
          setIsCheckingAccess(false)
        }
      }
    }

    checkAdminAccess()

    return () => {
      isMounted = false
    }
  }, [loading, router, user, realUser])

  if (loading || isCheckingAccess || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
        <p className="text-sm text-muted-foreground">Checking admin access...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-muted/20">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] min-w-0">
        <aside className={cn(
          "hidden shrink-0 border-r bg-card lg:block transition-all duration-300",
          isCollapsed ? "w-16" : "w-52"
        )}>
          <Sidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-20 md:pb-0">
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur">
            <AdminHeader
              mobileNav={
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Admin Navigation</SheetTitle>
                    </SheetHeader>
                    <Sidebar
                      isCollapsed={false}
                      onToggle={() => { }}
                    />
                  </SheetContent>
                </Sheet>
              }
            />
          </div>

          <main className="flex-1 overflow-x-hidden p-4 md:p-6">
            <div className="mx-auto w-full max-w-full min-w-0">{children}</div>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </div>
    </div>
  )
}
