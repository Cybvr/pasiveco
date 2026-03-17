'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const creators = [
  { id: 'c1', name: 'Ava Brooks', niche: 'Fashion', handle: '@avabrooks', image: 'https://i.pravatar.cc/200?img=5' },
  { id: 'c2', name: 'Jordan Lee', niche: 'Fitness', handle: '@jordanfit', image: 'https://i.pravatar.cc/200?img=13' },
  { id: 'c3', name: 'Sofia Kim', niche: 'Beauty', handle: '@sofiaskins', image: 'https://i.pravatar.cc/200?img=47' },
  { id: 'c4', name: 'Marcus Hill', niche: 'Tech', handle: '@marcustech', image: 'https://i.pravatar.cc/200?img=18' },
  { id: 'c5', name: 'Emily Stone', niche: 'Lifestyle', handle: '@emilydaily', image: 'https://i.pravatar.cc/200?img=32' },
  { id: 'c6', name: 'Noah Park', niche: 'Travel', handle: '@parktravels', image: 'https://i.pravatar.cc/200?img=67' },
]

export default function DiscoveryPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Discovery</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {creators.map((creator) => (
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
            <Badge variant="secondary" className="text-[11px] sm:text-xs">{creator.niche}</Badge>
          </article>
        ))}
      </div>
    </div>
  )
}
