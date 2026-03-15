"use client"
import type React from "react"
import Link from "next/link"
import { Home, Users, BarChart2, Settings, QrCode, File, FileText, Bell, Menu, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import UserMenu from "@/app/common/dashboard/user-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigation = [
  { name: "Admin", href: "/admin", icon: Home },
  { name: "Home", href: "/dashboard/", icon: QrCode },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Content", href: "/admin/content", icon: FileText },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeItem, setActiveItem] = useState("/admin")
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo and mobile menu */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-16 p-0">
                <div className="h-16 border-b flex items-center px-6">
                  <Image src="/images/logo.svg" alt="Pasive Logo" width={12} height={12} />
                </div>
                <nav className="p-4 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent"
                      onClick={() => setActiveItem(item.href)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/images/logo.svg" alt="Pasive Logo" width={32} height={32} />
              <span className="text-base font-semibold">Pasive</span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                  activeItem === item.href ? "bg-accent/50 font-medium" : ""
                }`}
                onClick={() => setActiveItem(item.href)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          {/* Mobile dropdown for navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" className="ml-auto mr-2">
                Navigate
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navigation.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link href={item.href} className="flex items-center gap-2 w-full">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* User actions */}
          <div className="flex items-center gap-2">

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">{children}</main>
    </div>
  )
}