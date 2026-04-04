import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/currency'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getDisplayAvatar } from '@/lib/avatar'

interface ProfileCompletionCardProps {
  user: any
  hasBankingDetails: boolean
  productsLength: number
  availableBalance: number
  currency: string
}

export default function ProfileCompletionCard({
  user,
  hasBankingDetails,
  productsLength,
  availableBalance,
  currency,
}: ProfileCompletionCardProps) {
  const profileSteps = useMemo(() => [
    { label: 'Add profile photo', completed: Boolean(user?.profilePicture || user?.photoURL), href: '/dashboard/settings/account' },
    { label: 'Write your bio', completed: Boolean(user?.bio), href: '/dashboard/settings/account' },
    { label: 'Add a product', completed: productsLength > 0, href: '/dashboard/products?new=1' },
    { label: 'Connect payout account', completed: hasBankingDetails, href: '/dashboard/settings/payment-method' },
    { label: 'Set your niche', completed: Boolean(user?.category), href: '/dashboard/settings/account' },
  ], [hasBankingDetails, productsLength, user?.profilePicture, user?.photoURL, user?.bio, user?.category])

  const completedSteps = profileSteps.filter(s => s.completed).length
  const totalSteps = profileSteps.length
  const profileProgress = Math.round((completedSteps / totalSteps) * 100)

  const maxBonus = currency === 'NGN' ? 5000 : 5
  const currentEarned = (completedSteps / totalSteps) * maxBonus

  if (profileProgress >= 100) return null

  return (
    <div className="w-full md:max-w-sm shrink-0 flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getDisplayAvatar({ image: user?.profilePicture || user?.photoURL || '', displayName: user?.displayName || user?.username, handle: user?.username })} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{user?.displayName || user?.username}</p>
            <p className="text-xs text-muted-foreground">{profileProgress}% profile completion</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-foreground leading-tight">{completedSteps}/{totalSteps} done</p>
          <p className="text-[10px] text-muted-foreground">
            {formatCurrency(currentEarned, currency as any).replace('.00', '')} earned
          </p>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
          Complete your profile
        </p>

        <div className="flex flex-col gap-1.5 flex-1">
          {profileSteps.map((step, index) => (
            <Link
              key={step.label}
              href={step.href}
              className="group flex items-center gap-2.5 rounded-xl border border-border/40 px-3 py-2 hover:bg-muted/20 transition-colors"
            >
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${step.completed
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-primary/40 group-hover:border-primary text-muted-foreground'
                }`}>
                {step.completed ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold leading-none">{index + 1}</span>
                )}
              </div>
              <span className={`flex-1 text-xs font-medium ${step.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {step.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground leading-tight">Unlock payouts at 100%</p>
            <p className="text-xs font-bold text-primary leading-tight">{formatCurrency(maxBonus, currency as any).replace('.00', '')} bonus</p>
          </div>
          <Button asChild size="sm">
            <Link href={profileSteps.find(s => !s.completed)?.href || '/dashboard/settings/account'}>
              Start earning <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}