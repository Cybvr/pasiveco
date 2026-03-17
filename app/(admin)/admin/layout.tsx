"use client"
import type React from "react"
import Link from "next/link"
import { Home, Users, QrCode, FileText, Menu } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
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
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    if (href === "/admin") return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-64 border-r bg-background lg:block">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-3">
              <Image src="/images/monster.png" alt="Pasive Logo" width={28} height={28} />
              <div>
                <p className="text-sm font-semibold leading-none">Pasive</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </Link>
          </div>
          <nav className="space-y-1 p-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActiveRoute(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <div className="flex h-16 items-center border-b px-6">
                      <Link href="/admin" className="flex items-center gap-3">
                        <Image src="/images/monster.png" alt="Pasive Logo" width={28} height={28} />
                        <div>
                          <p className="text-sm font-semibold leading-none">Pasive</p>
                          <p className="text-xs text-muted-foreground">Admin</p>
                        </div>
                      </Link>
                    </div>
                    <nav className="space-y-1 p-3">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                            isActiveRoute(item.href)
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
                <h1 className="text-sm font-medium text-muted-foreground">Admin Console</h1>
              </div>

              <div className="hidden text-sm text-muted-foreground md:block">Manage users and content</div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
