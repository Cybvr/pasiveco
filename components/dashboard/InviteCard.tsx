'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, Users, Gift, Clock, CircleCheck, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getReferralsForUser, type Referral } from '@/services/referralService'
import { formatCurrency } from '@/utils/currency'

interface InviteCardProps {
  userId: string
  username?: string
  currency: string
}

export default function InviteCard({ userId, username, currency }: InviteCardProps) {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  // Build invite link — use uid as fallback if no username yet
  const inviteHandle = username || userId
  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/register?ref=${encodeURIComponent(inviteHandle)}`
      : `/auth/register?ref=${encodeURIComponent(inviteHandle)}`

  useEffect(() => {
    getReferralsForUser(userId)
      .then(setReferrals)
      .finally(() => setLoading(false))
  }, [userId])

  const qualified = referrals.filter(r => r.status === 'qualified')
  const pending = referrals.filter(r => r.status === 'pending')

  const rewardPerQualified = currency === 'NGN' ? 5000 : 5
  const totalEarned = qualified.length * rewardPerQualified

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => { })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Pasive',
        text: "I'm building an income on Pasive — join using my link and let's both earn!",
        url: inviteLink,
      }).catch(() => { })
    } else {
      copyLink()
    }
  }

  return (
    <div className="w-full flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden">

      {/* Header */}
      <div className="p-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">Invite friends, earn money</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                Get paid when your friend adds a photo, bio, first product, and payout account.</p>
            </div>
          </div>
          {qualified.length > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {formatCurrency(totalEarned, currency as any).replace('.00', '')} earned
            </Badge>
          )}
        </div>
      </div>

      {/* Stats row */}
      {!loading && referrals.length > 0 && (
        <div className="grid grid-cols-2 divide-x divide-border/40 border-b border-border/60">
          <div className="flex flex-col items-center py-3 gap-0.5">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Clock className="h-3 w-3" />
              <span className="text-sm font-bold">{pending.length}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Pending</p>
          </div>
          <div className="flex flex-col items-center py-3 gap-0.5">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <CircleCheck className="h-3 w-3" />
              <span className="text-sm font-bold">{qualified.length}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Qualified</p>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Invite link box */}
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
          <p className="flex-1 truncate text-[11px] font-mono text-muted-foreground">
            {inviteLink.replace(/^https?:\/\//, '')}
          </p>
          <button
            onClick={copyLink}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy link"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 font-semibold gap-1.5" onClick={shareLink}>
            <Share2 className="h-3.5 w-3.5" /> Share invite
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 font-semibold gap-1.5"
            onClick={copyLink}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
        </div>

        {/* Pending invites list */}
        {pending.length > 0 && (
          <div className="mt-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Pending</p>
            <div className="flex flex-col gap-1">
              {pending.slice(0, 3).map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground font-medium truncate max-w-[140px]">
                      {r.inviteeDisplayName || 'New creator'}
                    </span>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-bold px-1.5 py-0 rounded-full">
                    setting up
                  </Badge>
                </div>
              ))}
              {pending.length > 3 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">+{pending.length - 3} more pending</p>
              )}
            </div>
          </div>
        )}

        {/* Qualified list */}
        {qualified.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Qualified</p>
            <div className="flex flex-col gap-1">
              {qualified.slice(0, 3).map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-emerald-500/5 px-3 py-1.5 border border-emerald-500/10">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span className="text-xs text-foreground font-medium truncate max-w-[140px]">
                      {r.inviteeDisplayName || 'Creator'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    +{formatCurrency(rewardPerQualified, currency as any).replace('.00', '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
