'use client'

import NotificationsList from '@/app/common/dashboard/NotificationsList'
import { useNotifications } from '@/app/common/dashboard/useNotifications'

export default function NotificationsPage() {
  const { items } = useNotifications()

  return <NotificationsList items={items} className="rounded-xl border bg-background" />
}
