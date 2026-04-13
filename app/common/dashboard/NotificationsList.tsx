'use client'

import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NotificationAudience = 'creator' | 'admin'
export type NotificationCategory = 'activity' | 'updates'
type NotificationStatus = 'new' | 'done'
type NotificationVisibility = NotificationAudience | 'all'

export interface NotificationItem {
  id: string
  icon: LucideIcon
  title: string
  body: string
  time: string
  status: NotificationStatus
  category: NotificationCategory
  visibility: NotificationVisibility
  threadId?: string
  unreadAmount?: number
}

export const DASHBOARD_NOTIFICATIONS: NotificationItem[] = []

type NotificationFilter = 'all' | NotificationCategory

export function getBaseNotificationsForAudience(audience: NotificationAudience) {
  return DASHBOARD_NOTIFICATIONS.filter(
    (item) => item.visibility === 'all' || item.visibility === audience
  )
}

export function getUnreadNotificationsCount(items: NotificationItem[]) {
  return items.reduce((count, item) => {
    if (item.status !== 'new') return count
    return count + (typeof item.unreadAmount === 'number' ? item.unreadAmount : 1)
  }, 0)
}

interface NotificationsListProps {
  items: NotificationItem[]
  className?: string
}

export default function NotificationsList({
  items,
  className,
}: NotificationsListProps) {
  return (
    <div className={className}>
      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <div className={cn('divide-y divide-border/50', className)}>
          {items.map((item) => (
            <div key={item.id} className="group p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <item.icon className="mt-1 h-4 w-4 shrink-0 text-primary/70" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium leading-none">{item.title}</p>
                    {item.status === 'new' ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" title="New" />
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                    {item.body}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-medium text-muted-foreground/60">{item.time}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
