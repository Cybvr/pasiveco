import Link from 'next/link'
import { Home, Users, BarChart2, Settings, QrCode, File, FileText } from 'lucide-react'
import Image from 'next/image'

const navigation = [
  { name: 'Admin Home', href: '/admin', icon: Home },
  { name: 'QRT Home', href: '/dashboard/', icon: QrCode },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Documents', href: '/admin/cabinet', icon: File },
  { name: 'Content', href: '/admin/content', icon: FileText },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/dashboard/settings/account', icon: Settings }
]

export default function AdminSidebar() {
  return (
    <div className="w-64 border-r bg-card">
      <div className="h-16 border-b flex items-center px-6">
        <Image src="/images/logo.png" alt="Pasive Logo" width={100} height={100} />
      </div>
      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent"
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}