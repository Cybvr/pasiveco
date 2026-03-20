'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    return <Skeleton className="h-48 w-full max-w-3xl rounded-xl" />
  }

  return (
    <Card className="max-w-3xl">
      <CardContent className="space-y-4 pt-6">
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

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : hasCompletedDetails ? 'Save Banking Details' : 'Add Banking Details'}
        </Button>
      </CardContent>
    </Card>
  )
}

