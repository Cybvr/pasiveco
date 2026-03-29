import { Skeleton } from '@/components/ui/skeleton'

export function HomeSkeleton() {
  return (
    <div className="space-y-6">
      {/* Earnings Balance Skeleton */}
      <div className="px-1">
        <Skeleton className="h-24 w-full rounded-2xl border border-border/40" />
      </div>

      {/* Quick Links Grid Skeleton (Mobile) */}
      <div className="px-1 md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`link-skel-${i}`} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Your Products Row Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="flex gap-4 overflow-hidden px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`prod-skel-${i}`} className="w-[200px] space-y-2 shrink-0">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Communities Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="flex gap-4 overflow-hidden px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`comm-skel-${i}`} className="w-[200px] space-y-2 shrink-0">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliate Network Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="flex gap-4 overflow-hidden px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`aff-skel-${i}`} className="w-[200px] space-y-2 shrink-0">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
