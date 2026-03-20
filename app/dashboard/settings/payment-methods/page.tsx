'use client'

import { useEffect, useMemo, useState } from 'react'
import { Landmark, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { getBankingDetails, saveBankingDetails } from '@/services/bankingDetailsService'

const initialForm = {
  bankName: '',
  accountName: '',
  accountNumber: '',
}

export default function BankingDetailsPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadBankingDetails = async () => {
      if (!user?.uid) {
        setFormData(initialForm)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const savedDetails = await getBankingDetails(user.uid)
        if (savedDetails) {
          setFormData({
            bankName: savedDetails.bankName,
            accountName: savedDetails.accountName,
            accountNumber: savedDetails.accountNumber,
          })
        } else {
          setFormData(initialForm)
        }
      } catch (error) {
        console.error('Error loading banking details:', error)
        toast.error('Failed to load banking details')
      } finally {
        setIsLoading(false)
      }
    }

    void loadBankingDetails()
  }, [user])

  const hasCompletedDetails = useMemo(
    () => Boolean(formData.bankName.trim() && formData.accountName.trim() && formData.accountNumber.trim()),
    [formData]
  )

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async () => {
    if (!user?.uid) {
      toast.error('You must be logged in to save banking details')
      return
    }

    if (!hasCompletedDetails) {
      toast.error('Please complete all banking details fields')
      return
    }

    setIsSaving(true)
    try {
      await saveBankingDetails(user.uid, formData)
      toast.success('Banking details saved')
    } catch (error) {
      console.error('Error saving banking details:', error)
      toast.error('Failed to save banking details')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Banking Details</h1>
        <p className="text-sm text-muted-foreground">
          Save the bank account you want Pasive to use for withdrawals. This information is stored on your
          Firestore <span className="font-medium text-foreground">users</span> record.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Withdrawal bank account
          </CardTitle>
          <CardDescription>
            Add the bank name, account name, and account number that should receive payouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank name</Label>
              <Input
                id="bank-name"
                placeholder="Access Bank"
                value={formData.bankName}
                onChange={(event) => handleChange('bankName', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-name">Account name</Label>
              <Input
                id="account-name"
                placeholder="Jane Creator"
                value={formData.accountName}
                onChange={(event) => handleChange('accountName', event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-number">Account number</Label>
            <Input
              id="account-number"
              inputMode="numeric"
              placeholder="0123456789"
              value={formData.accountNumber}
              onChange={(event) => handleChange('accountNumber', event.target.value.replace(/\D/g, '').slice(0, 16))}
            />
          </div>

          <div className="rounded-2xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4" />
              Firestore sync
            </div>
            <p>
              Saving this form updates <span className="font-medium text-foreground">users/{user?.uid}</span> with both a
              <span className="font-medium text-foreground"> bankingDetails </span> object and top-level bank fields for
              compatibility with the rest of the app.
            </p>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : hasCompletedDetails ? 'Save Banking Details' : 'Add Banking Details'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
