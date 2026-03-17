'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle2, CreditCard, Megaphone, MessageSquare } from 'lucide-react'

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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">Stay on top of your profile updates, payouts, and incoming opportunities.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Recent activity</CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Bell className="h-3.5 w-3.5" /> 4 updates
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
                <Badge variant={item.status === 'new' ? 'default' : 'outline'}>{item.status === 'new' ? 'New' : 'Seen'}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">{item.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
