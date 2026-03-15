"use client"
import type React from "react"
import { usePathname } from "next/navigation"
import Header from "@/app/common/dashboard/Header"
import Sidebar from "@/app/common/dashboard/Sidebar"

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEditRoute = pathname === "/dashboard/edit"
  const isSettingsRoute = pathname.startsWith("/dashboard/settings")

  if (isEditRoute) {
    return <main>{children}</main>
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header className="flex-shrink-0" />

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
    </div>
  )
}
