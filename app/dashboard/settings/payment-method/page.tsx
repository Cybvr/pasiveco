'use client'

import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { getPaymentSettings, savePaymentSettings, PaymentSettings, defaultPaymentSettings } from '@/services/paymentMethodService'
import { toast } from 'sonner'
import { CreditCard, Landmark, Phone, QrCode, Loader2 } from 'lucide-react'

export default function PaymentMethodPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<PaymentSettings>(defaultPaymentSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      try {
        const saved = await getPaymentSettings(user.uid)
        setSettings(saved)
      } catch (error) {
        toast.error('Failed to load payment settings')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  const toggleMethod = (method: 'card' | 'bank') => {
    setSettings(prev => ({
      ...prev,
      acceptedMethods: {
        ...prev.acceptedMethods,
        [method]: !prev.acceptedMethods[method as keyof typeof prev.acceptedMethods]
      }
    }))
  }

  const handleSave = async () => {
    if (!user?.uid) return
    setIsSaving(true)
    try {
      await savePaymentSettings(user.uid, settings)
      toast.success('Payment settings saved')
    } catch (error) {
      toast.error('Failed to save payment settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Accept Payments via Paystack</CardTitle>
          <CardDescription>
            Configure which payment methods you want to accept from your customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 border-b pb-6">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Paystack</Label>
              <p className="text-sm text-muted-foreground">Allow customers to pay using the Paystack gateway.</p>
            </div>
            <Switch
              checked={settings.paystackEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, paystackEnabled: checked }))}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase text-muted-foreground">Accepted Methods</h3>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <Label className="text-base">Card</Label>
                  <p className="text-sm text-muted-foreground">Accept Visa, Mastercard, and Verve cards.</p>
                </div>
              </div>
              <Switch
                checked={settings.acceptedMethods.card}
                onCheckedChange={() => toggleMethod('card')}
                disabled={!settings.paystackEnabled}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <Label className="text-base">Bank</Label>
                  <p className="text-sm text-muted-foreground">Accept direct bank account payments.</p>
                </div>
              </div>
              <Switch
                checked={settings.acceptedMethods.bank}
                onCheckedChange={() => toggleMethod('bank')}
                disabled={!settings.paystackEnabled}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              'Save Payment Methods'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
