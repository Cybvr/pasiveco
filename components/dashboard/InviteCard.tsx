'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface InviteCardProps {
  userId: string
  username?: string
  currency: string
}

export default function InviteCard({ userId, username, currency }: InviteCardProps) {
  const [copied, setCopied] = useState(false)

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
    <div className="flex h-full w-full min-w-0 flex-col rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
      <div className="flex h-full min-w-0 flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
              Invite & Earn
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Invite friends to Pasive and earn rewards when they complete their profile.
            </p>
          </div>

          <div className="flex min-w-0 overflow-hidden rounded-md">
            <Input
              readOnly
              value={displayLink}
              title={displayLink}
              className="min-w-0 flex-1 rounded-r-none border-r-0 bg-muted/10 text-sm text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              variant="outline"
              className="h-auto shrink-0 rounded-l-none border-l-0 px-4 text-sm"
              onClick={copyLink}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <Button className="w-full" onClick={shareLink}>
          Share invite link
        </Button>
      </div>
    </div>
  )
}
