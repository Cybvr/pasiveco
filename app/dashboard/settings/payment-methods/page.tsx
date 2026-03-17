'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

type PaymentMethod = {
  id: string
  brand: string
  last4: string
  exp: string
  holder: string
  isDefault?: boolean
}

const starterMethods: PaymentMethod[] = [
  { id: 'pm_1', brand: 'Visa', last4: '4242', exp: '10/28', holder: 'Primary card', isDefault: true },
  { id: 'pm_2', brand: 'Mastercard', last4: '4444', exp: '07/27', holder: 'Team card' },
]

export default function PaymentMethodsPage() {
  const { user } = useAuth()
  const [methods, setMethods] = useState<PaymentMethod[]>(starterMethods)
  const [newCardName, setNewCardName] = useState('')
  const [newCardLast4, setNewCardLast4] = useState('')

  const defaultMethod = useMemo(() => methods.find((method) => method.isDefault), [methods])

  const handleAddPrototypeMethod = () => {
    if (!newCardName.trim() || newCardLast4.trim().length !== 4) {
      toast.error('Add a card nickname and 4-digit ending to continue')
      return
    }

    const normalizedLast4 = newCardLast4.replace(/\D/g, '').slice(0, 4)

    if (normalizedLast4.length !== 4) {
      toast.error('Card ending must be 4 numbers')
      return
    }

    setMethods((current) => [
      ...current,
      {
        id: `pm_proto_${Date.now()}`,
        brand: 'Card',
        last4: normalizedLast4,
        exp: 'MM/YY',
        holder: newCardName.trim(),
      },
    ])

    setNewCardName('')
    setNewCardLast4('')
    toast.success('Prototype method added to the UI')
  }

  const handleSetDefault = (id: string) => {
    setMethods((current) =>
      current.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    )
    toast.success('Prototype default updated')
  }

  const handleRemove = (id: string) => {
    setMethods((current) => current.filter((method) => method.id !== id))
    toast.success('Prototype method removed')
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Payment Methods</h1>
          <p className="text-sm text-muted-foreground">UI prototype for card management flow.</p>
        </div>
        <Badge variant="secondary">Prototype</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved methods</CardTitle>
          <CardDescription>Preview how customers can pick, set default, and remove cards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-48" />
            </div>
          ) : methods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cards in this prototype yet.</p>
          ) : (
            methods.map((method) => (
              <div key={method.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {method.brand} •••• {method.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.holder} · Expires {method.exp}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault ? (
                      <Badge>Default</Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                        Set default
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(method.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add method</CardTitle>
          <CardDescription>Local-only form to demo add-card behavior without billing portal redirects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="card-name">Card nickname</Label>
              <Input
                id="card-name"
                value={newCardName}
                onChange={(event) => setNewCardName(event.target.value)}
                placeholder="Ops team card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-last4">Card ending</Label>
              <Input
                id="card-last4"
                value={newCardLast4}
                onChange={(event) => setNewCardLast4(event.target.value)}
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Default: {defaultMethod ? `${defaultMethod.brand} •••• ${defaultMethod.last4}` : 'No default selected'}
            </p>
            <Button onClick={handleAddPrototypeMethod}>Add payment method</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
