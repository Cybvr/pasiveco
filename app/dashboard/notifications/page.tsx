'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, CreditCard, Megaphone, MessageSquare } from 'lucide-react'

const notifications = [
  {
    id: 'n1',
    icon: MessageSquare,
    title: 'New brand inquiry from Prism Labs',
    body: 'They requested your media kit and rates for a short-form campaign.',
    time: '5 minutes ago',
    status: 'new',
  },
  {
    id: 'n2',
    icon: CreditCard,
    title: 'Payout completed',
    body: '$420.00 was transferred to your connected bank account.',
    time: '2 hours ago',
    status: 'done',
  },
  {
    id: 'n3',
    icon: Megaphone,
    title: 'Campaign deadline reminder',
    body: 'Your deliverables for HypeFuel are due tomorrow at 5:00 PM.',
    time: 'Yesterday',
    status: 'new',
  },
  {
    id: 'n4',
    icon: CheckCircle2,
    title: 'Profile update approved',
    body: 'Your updated bio and social links are now live on your page.',
    time: '2 days ago',
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
