"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
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
  const pathname = usePathname()
  const { user, realUser, loading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isContentRoute = pathname.startsWith('/admin/content')

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
    <div className="h-screen overflow-hidden bg-muted/20">
      <div className="mx-auto flex h-full w-full max-w-[1600px] min-w-0 overflow-hidden">
        <aside className={cn(
          "hidden h-full shrink-0 border-r bg-card transition-all duration-300 lg:block",
          isCollapsed ? "w-16" : "w-52"
        )}>
          <Sidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />
        </aside>

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden pb-20 md:pb-0">
          <div className="z-40 shrink-0 bg-background/95 backdrop-blur">
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

          <main
            className={cn(
              "min-h-0 flex-1 overflow-x-hidden p-4 md:p-6",
              isContentRoute ? "overflow-hidden" : "overflow-y-auto"
            )}
          >
            <div
              className={cn(
                "mx-auto w-full max-w-full min-w-0",
                isContentRoute && "h-full"
              )}
            >
              {children}
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </div>
    </div>
  )
}
