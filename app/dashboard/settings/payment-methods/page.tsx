'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function PaymentMethodsPage() {
  const { user } = useAuth()
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)

  const handleAddPaymentMethod = async () => {
    if (!user?.uid) {
      toast.error('You must be logged in to manage payment methods')
      return
    }

    try {
      setIsOpeningPortal(true)

      const response = await fetch('/api/create-customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open payment methods')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Error opening payment methods portal:', error)
      toast.error('Unable to open payment methods. Please try again.')
    } finally {
      setIsOpeningPortal(false)
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Payment Methods</h1>
        <p className="text-sm text-muted-foreground">Add, remove, and update your cards in secure billing.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage payment methods</CardTitle>
          <CardDescription>
            Use the billing portal to add new cards, set a default payment method, or remove old ones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-48" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                We store payment details securely with our billing provider. You can manage your saved methods there.
              </p>
              <Button onClick={handleAddPaymentMethod} disabled={isOpeningPortal}>
                {isOpeningPortal ? 'Opening Billing Portal...' : 'Add payment method'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
