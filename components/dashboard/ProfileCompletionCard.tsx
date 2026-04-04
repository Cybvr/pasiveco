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
  currency: string
}

export default function ProfileCompletionCard({
  user,
  hasBankingDetails,
  productsLength,
  currency,
}: ProfileCompletionCardProps) {
  const profileSteps = useMemo(() => [
    { label: 'Add profile photo', completed: Boolean(user?.profilePicture || user?.photoURL), href: '/dashboard/settings/account' },
    { label: 'Verify phone number', completed: Boolean(user?.phoneNumber), href: '/dashboard/settings/account' },
    { label: 'Add a product', completed: productsLength > 0, href: '/dashboard/products?new=1' },
    { label: 'Connect payout account', completed: hasBankingDetails, href: '/dashboard/settings/payment-method' },
  ], [hasBankingDetails, productsLength, user?.profilePicture, user?.photoURL, user?.phoneNumber])

  const completedSteps = profileSteps.filter(s => s.completed).length
  const totalSteps = profileSteps.length
  const profileProgress = Math.round((completedSteps / totalSteps) * 100)

  const maxBonus = currency === 'NGN' ? 5000 : 5
  const currentEarned = (completedSteps / totalSteps) * maxBonus

  // if (profileProgress >= 100) return null

  return (
    <div className="w-full flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground text-sm sm:text-base">Complete your profile</h3>
        <span className="text-[11px] sm:text-xs text-muted-foreground">{completedSteps}/{totalSteps} done</span>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {profileSteps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className={`flex items-center gap-3 text-sm transition-colors ${step.completed ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}`}
          >
            {step.completed ? (
              <div className="flex bg-[#189e68] rounded-full text-white p-0.5 items-center justify-center shrink-0 w-5 h-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              <div className="flex h-5 w-5 rounded-full border border-border items-center justify-center shrink-0"></div>
            )}
            <span className="truncate">{step.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-auto">
        <div className="h-1 w-full bg-muted overflow-hidden flex">
          <div className="h-full bg-[#189e68] transition-all duration-500 ease-out" style={{ width: `${profileProgress}%` }}></div>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-2 mb-4">
          {profileProgress}% complete — unlock 100% payouts
        </p>

        <Button asChild className="w-full">
          <Link href={profileSteps.find(s => !s.completed)?.href || '/dashboard/settings/account'}>
            Start earning
          </Link>
        </Button>
      </div>
    </div>
  )
}