'use client'

import { Bell, MessageSquare, Rss, UserPlus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  icon: LucideIcon
  title: string
  body: string
  time: string
  status: 'new' | 'done'
}

export const DASHBOARD_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    icon: Bell,
    title: 'A creator you follow published a new post',
    body: 'Lin Xia shared a new post in your feed about her spring capsule picks.',
    time: '5 minutes ago',
    status: 'new',
  },
  {
    id: 'n2',
    icon: UserPlus,
    title: 'You have a new subscriber',
    body: 'Jordan Miles subscribed to your page and can now get your latest updates.',
    time: '22 minutes ago',
    status: 'new',
  },
  {
    id: 'n3',
    icon: MessageSquare,
    title: 'You received a new message',
    body: 'Amara Okafor sent you a message asking about your current rates and availability.',
    time: '1 hour ago',
    status: 'new',
  },
  {
    id: 'n4',
    icon: Rss,
    title: 'New Pasive blog update',
    body: 'Pasive published a new blog post with platform updates, creator tips, and product news.',
    time: 'Yesterday',
    status: 'done',
  },
]

export default function NotificationsList({ className }: { className?: string }) {
  return (
    <div className={cn('divide-y divide-border/50', className)}>
      {DASHBOARD_NOTIFICATIONS.map((item) => (
        <div key={item.id} className="group transition-colors hover:bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <item.icon className="mt-1 h-4 w-4 shrink-0 text-primary/70" />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none truncate">{item.title}</p>
                {item.status === 'new' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" title="New" />
                )}
              </div>
              <p className="text-[13px] leading-snug text-muted-foreground line-clamp-2">
                {item.body}
              </p>
              <p className="text-[11px] text-muted-foreground/60 font-medium">{item.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
