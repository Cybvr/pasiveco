'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { demoUserId, userNotifications } from '@/lib/user-activity-data'

export default function NotificationsPage() {
  const notifications = userNotifications.filter((notification) => notification.userId === demoUserId)

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
            <Bell className="h-3.5 w-3.5" /> {notifications.length} updates
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
