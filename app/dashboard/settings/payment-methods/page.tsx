'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  { id: 'pm_1', brand: 'Visa', last4: '4242', exp: '10/28', holder: 'Primary', isDefault: true },
  { id: 'pm_2', brand: 'Mastercard', last4: '4444', exp: '07/27', holder: 'Team' },
]

export default function PaymentMethodsPage() {
  const { user } = useAuth()
  const [methods, setMethods] = useState<PaymentMethod[]>(starterMethods)
  const [name, setName] = useState('')
  const [last4, setLast4] = useState('')

  const defaultMethod = useMemo(
    () => methods.find((m) => m.isDefault),
    [methods]
  )

  const addMethod = () => {
    const digits = last4.replace(/\D/g, '').slice(0, 4)

    if (!name.trim() || digits.length !== 4) {
      toast.error('Enter name + 4 digits')
      return
    }

    setMethods((curr) => [
      ...curr,
      {
        id: `pm_${Date.now()}`,
        brand: 'Card',
        last4: digits,
        exp: 'MM/YY',
        holder: name.trim(),
      },
    ])

    setName('')
    setLast4('')
    toast.success('Added')
  }

  const setDefault = (id: string) => {
    setMethods((curr) =>
      curr.map((m) => ({ ...m, isDefault: m.id === id }))
    )
  }

  const remove = (id: string) => {
    setMethods((curr) => curr.filter((m) => m.id !== id))
  }

  return (
    <div className="max-w-xl space-y-6 p-4 md:p-6">
      <h1 className="text-lg font-semibold">Payment methods</h1>

      {/* LIST */}
      {!user ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : methods.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved methods</p>
      ) : (
        <div className="divide-y rounded-md border">
          {methods.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              {/* LEFT */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {m.brand} •••• {m.last4}
                  </p>
                  {m.isDefault && <Badge variant="secondary">Default</Badge>}
                </div>

                <p className="text-xs text-muted-foreground">
                  {m.holder} · {m.exp}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-1">
                {!m.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDefault(m.id)}
                  >
                    Default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(m.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD */}
      <div className="space-y-3">
        <Separator />

        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Card name"
          />
          <Input
            value={last4}
            onChange={(e) => setLast4(e.target.value)}
            inputMode="numeric"
            maxLength={4}
            placeholder="Last 4"
            className="md:max-w-[120px]"
          />
          <Button onClick={addMethod}>Add</Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Default:{" "}
          {defaultMethod
            ? `${defaultMethod.brand} •••• ${defaultMethod.last4}`
            : 'None'}
        </p>
      </div>
    </div>
  )
}
