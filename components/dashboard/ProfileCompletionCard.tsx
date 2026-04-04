import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/currency'
import { updateUser } from '@/services/userService'
import { createTransaction } from '@/services/transactionsService'
import { toast } from '@/hooks/use-toast'

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
    { label: 'Complete your bio', completed: Boolean(user?.bio && user.bio.trim().length > 0), href: '/dashboard/settings/account' },
    { label: 'Add a product', completed: productsLength > 0, href: '/dashboard/products?new=1' },
    { label: 'Connect payout account', completed: hasBankingDetails, href: '/dashboard/settings/payment-method' },
  ], [hasBankingDetails, productsLength, user?.profilePicture, user?.photoURL, user?.bio])

  const completedSteps = profileSteps.filter((step) => step.completed).length
  const totalSteps = profileSteps.length
  const profileProgress = Math.round((completedSteps / totalSteps) * 100)
  const [isClaiming, setIsClaiming] = useState(false)
  const maxBonus = currency === 'NGN' ? 2500 : 2.5

  if (profileProgress >= 100 && user?.hasClaimedProfileBonus) return null

  const handleClaimBonus = async () => {
    if (!user?.uid || isClaiming) return

    try {
      setIsClaiming(true)

      await createTransaction({
        sellerId: user.uid,
        productId: 'bonus-profile-completion',
        productName: 'Profile Completion Bonus',
        customerName: 'Pasive Rewards',
        customerEmail: 'rewards@pasive.co',
        reference: `BNS_${Date.now()}_${user.uid.slice(0, 5)}`,
        amount: maxBonus,
        currency,
        couponDiscount: 0,
        affiliate: 'bonus',
        yourProfit: maxBonus,
        customCharge: 0,
        payoutDate: null,
        status: 'success',
      })

      await updateUser(user.uid, { hasClaimedProfileBonus: true })

      toast({
        title: 'Bonus Claimed!',
        description: `${formatCurrency(maxBonus, currency)} has been added to your earnings.`,
      })

      if (user) {
        user.hasClaimedProfileBonus = true
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to claim your bonus. Try again.',
        variant: 'destructive',
      })
    } finally {
      setIsClaiming(false)
    }
  }

  if (profileProgress >= 100) {
    return (
      <Button className="w-full" onClick={handleClaimBonus} disabled={isClaiming}>
        {isClaiming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isClaiming ? 'Claiming...' : `Claim ${formatCurrency(maxBonus, currency)} bonus`}
      </Button>
    )
  }

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
          {profileProgress}% complete - unlock {formatCurrency(maxBonus, currency)} bonus
        </p>
        <Button asChild className="w-full">
          <Link href={profileSteps.find((step) => !step.completed)?.href || '/dashboard/settings/account'}>
            Continue setup
          </Link>
        </Button>
      </div>
    </div>
  )
}
