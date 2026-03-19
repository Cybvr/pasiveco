'use client'

import { Badge } from '@/components/ui/badge'
import { Bell, MessageSquare, Rss, UserPlus } from 'lucide-react'

const notifications = [
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

export default function NotificationsPage() {
  return (
    <div className="space-y-3">
      {notifications.map((item) => (
        <div key={item.id} className="rounded-xl border bg-card p-3 shadow-sm sm:p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2">
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm font-medium leading-5">{item.title}</p>
            </div>
            <Badge variant={item.status === 'new' ? 'default' : 'outline'} className="shrink-0">{item.status === 'new' ? 'New' : 'Seen'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{item.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">{item.time}</p>
        </div>
      ))}
    </div>
  )
}
