'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  MessageSquare,
  Rss,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type NotificationAudience = 'creator' | 'admin'
export type NotificationCategory = 'activity' | 'news'
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
}

export const DASHBOARD_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    icon: Bell,
    title: 'A creator you follow published a new post',
    body: 'Lin Xia shared a new post in your feed about her spring capsule picks.',
    time: '5 minutes ago',
    status: 'new',
    category: 'activity',
    visibility: 'creator',
  },
  {
    id: 'n2',
    icon: UserPlus,
    title: 'You have a new subscriber',
    body: 'Jordan Miles subscribed to your page and can now get your latest updates.',
    time: '22 minutes ago',
    status: 'new',
    category: 'activity',
    visibility: 'creator',
  },
  {
    id: 'n3',
    icon: MessageSquare,
    title: 'You received a new message',
    body: 'Amara Okafor sent you a message asking about your current rates and availability.',
    time: '1 hour ago',
    status: 'new',
    category: 'activity',
    visibility: 'creator',
  },
  {
    id: 'n5',
    icon: Rss,
    title: 'New Pasive blog update',
    body: 'Pasive published a new blog post with platform updates, creator tips, and product news.',
    time: 'Yesterday',
    status: 'done',
    category: 'news',
    visibility: 'all',
  },
]

type NotificationFilter = 'all' | NotificationCategory

export function getBaseNotificationsForAudience(audience: NotificationAudience) {
  return DASHBOARD_NOTIFICATIONS.filter(
    (item) => item.visibility === 'all' || item.visibility === audience
  )
}

export function getUnreadNotificationsCount(items: NotificationItem[]) {
  return items.filter((item) => item.status === 'new').length
}

interface NotificationsListProps {
  items: NotificationItem[]
  className?: string
  showTabs?: boolean
}

export default function NotificationsList({
  items,
  className,
  showTabs = true,
}: NotificationsListProps) {
  const [activeTab, setActiveTab] = useState<NotificationFilter>('all')
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items
    return items.filter((item) => item.category === activeTab)
  }, [activeTab, items])

  useEffect(() => {
    if (activeTab === 'all') return

    const stillHasItems = items.some((item) => item.category === activeTab)
    if (!stillHasItems) {
      setActiveTab('all')
    }
  }, [activeTab, items])

  const counts = useMemo(
    () => ({
      all: items.length,
      activity: items.filter((item) => item.category === 'activity').length,
      news: items.filter((item) => item.category === 'news').length,
    }),
    [items]
  )

  return (
    <div className={className}>
      {showTabs ? (
        <div className="border-b px-4 py-3">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as NotificationFilter)}>
            <TabsList className="grid w-full grid-cols-3 rounded-lg border bg-muted/30 p-1">
              <TabsTrigger value="all" className="rounded-md px-3 py-1.5 text-xs font-medium">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-md px-3 py-1.5 text-xs font-medium">
                Activity ({counts.activity})
              </TabsTrigger>
              <TabsTrigger value="news" className="rounded-md px-3 py-1.5 text-xs font-medium">
                News ({counts.news})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      ) : null}

      {filteredItems.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No notifications in this section yet.
        </div>
      ) : (
        <div className={cn('divide-y divide-border/50', !showTabs && className)}>
          {filteredItems.map((item) => (
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
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground/50">
                      {item.category}
                    </span>
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
