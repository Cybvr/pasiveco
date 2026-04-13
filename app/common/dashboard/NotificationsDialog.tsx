'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import NotificationsList, {
  getUnreadNotificationsCount,
  type NotificationAudience,
} from './NotificationsList'
import { useNotifications } from './useNotifications'

interface NotificationsDialogProps {
  audience?: NotificationAudience
  viewAllHref: string
}

export default function NotificationsDialog({
  audience,
  viewAllHref,
}: NotificationsDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { items, markAllRead, markingAllRead } = useNotifications(audience)
  const unreadNotifications = getUnreadNotificationsCount(items)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 ? (
            <span
              className="absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-primary px-1 py-0.5 text-[10px] font-bold leading-none text-primary-foreground"
              aria-label={`${unreadNotifications} unread notifications`}
            >
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(85vh,540px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[400px]">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3 pr-10">
          <DialogTitle className="text-sm font-semibold text-foreground/90">
            Notifications
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <NotificationsList items={items} />
        </ScrollArea>
        <div className="flex items-center gap-2 border-t bg-muted/20 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 flex-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => {
              setOpen(false)
              router.push(viewAllHref)
            }}
          >
            View all
          </Button>
          {unreadNotifications > 0 ? (
            <>
              <div className="h-4 w-[1px] bg-border/60" />
              <Button
                variant="ghost"
                size="sm"
                className="h-9 flex-1 text-xs font-semibold text-primary hover:bg-primary/5 hover:text-primary/80"
                onClick={() => void markAllRead()}
                disabled={markingAllRead}
              >
                {markingAllRead ? 'Marking...' : 'Mark all read'}
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
