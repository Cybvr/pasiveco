'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { discoverUsers } from '@/app/data/deluserData'

export default function DiscoveryPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Discovery</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {discoverUsers.map((creator) => (
          <article key={creator.id} className="rounded-xl border bg-card p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={creator.image} alt={creator.name} />
                <AvatarFallback>{creator.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{creator.name}</p>
                <p className="truncate text-xs text-muted-foreground">{creator.handle}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-[11px] sm:text-xs">{creator.niche}</Badge>
              <span className="text-[11px] text-muted-foreground sm:text-xs">{creator.posts.length} posts</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
