'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'

import PricingPlans from '@/app/common/website/PricingPlans'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function UpgradeCta({
  isCollapsed = false,
  className,
  open,
  onOpenChange,
}: {
  isCollapsed?: boolean
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { user, trialDaysLeft, isTrialing } = useAuth()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof open === 'boolean' && typeof onOpenChange === 'function'
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={isCollapsed ? 'icon' : 'sm'}
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300',
          isCollapsed ? 'mx-auto h-8 w-8' : 'rounded-md px-2 py-1.5 text-xs font-semibold',
          className
        )}
        title={isCollapsed ? 'Upgrade' : undefined}
      >
        <span className={cn('flex w-full items-center', isCollapsed ? 'justify-center' : 'justify-between')}>
          <span className="flex min-w-0 items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span className="truncate">Upgrade</span>}
          </span>
          {!isCollapsed && (user?.plan?.toLowerCase() === 'free' || !user?.plan) && isTrialing ? (
            <span className="whitespace-nowrap rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold">
              {trialDaysLeft} days left
            </span>
          ) : null}
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex max-h-[90vh] w-[96vw] max-w-6xl flex-col gap-0 overflow-hidden p-0">
          <div className="shrink-0 border-b p-4 sm:p-6">
            <DialogHeader className="pr-8">
              <DialogTitle>Upgrade your plan</DialogTitle>
              <DialogDescription>
                Pick the plan that fits your business and unlock more tools as you grow.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <PricingPlans currentPlan={user?.plan?.toLowerCase() ?? 'free'} embedded />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
