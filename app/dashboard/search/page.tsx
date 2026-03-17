'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function DashboardSearchPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold">Search</h2>
      <div className="rounded-xl border bg-card p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search creators, brands, or topics" />
        </div>
      </div>
    </div>
  )
}
