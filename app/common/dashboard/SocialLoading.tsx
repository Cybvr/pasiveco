import { Skeleton } from '@/components/ui/skeleton'

export function FeedSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={`feed-skeleton-${index}`} className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[88%]" />
            <Skeleton className="h-4 w-[72%]" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DiscoverySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`discovery-tab-skeleton-${index}`} className="h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`discovery-card-skeleton-${index}`} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-background p-2 space-y-1 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={`settings-link-skeleton-${index}`} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
