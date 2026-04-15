'use client'

import { useState } from 'react'
import { Copy, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface InviteCardProps {
  userId: string
  username?: string
}

export default function InviteCard({ userId, username }: InviteCardProps) {
  const [copied, setCopied] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const inviteHandle = username || userId
  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/register?ref=${encodeURIComponent(inviteHandle)}`
      : `/auth/register?ref=${encodeURIComponent(inviteHandle)}`

  const displayLink = inviteLink.replace(/^https?:\/\//, '')

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => { })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Join me on Pasive',
          text: "I'm building an income on Pasive — join using my link and let's both earn!",
          url: inviteLink,
        })
        .catch(() => { })
    } else {
      copyLink()
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="grid h-full w-full min-w-0 grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-2xl border border-border/60 bg-card p-2 text-left whitespace-normal transition-colors hover:bg-muted/30 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:p-2.5"
        >
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl sm:h-14 sm:w-14">
            {imageFailed ? (
              <Gift className="h-4 w-4 text-primary" />
            ) : (
              <img
                src="/images/cards/gift.png"
                alt=""
                className="h-full w-full object-contain"
                onError={() => setImageFailed(true)}
              />
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
              Invite & Earn
            </p>
            <p className="whitespace-normal text-[11px] leading-relaxed text-muted-foreground">
              Invite friends and earn rewards when they finish setup.
            </p>
          </div>

          <span className="text-xs font-semibold text-primary">
            Invite
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite & Earn</DialogTitle>
          <DialogDescription>
            Share your invite link and earn rewards when friends finish setting up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex min-w-0 overflow-hidden rounded-md">
            <Input
              readOnly
              value={displayLink}
              title={displayLink}
              className="min-w-0 h-10 flex-1 rounded-r-none border-r-0 bg-muted/10 text-sm text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 shrink-0 rounded-l-none border-l-0 px-3"
              onClick={copyLink}
              aria-label={copied ? 'Copied' : 'Copy invite link'}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Button type="button" className="w-full" onClick={shareLink}>
            {copied ? 'Copied' : 'Share invite link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
