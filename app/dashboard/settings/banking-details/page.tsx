'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { getBankingDetails, saveBankingDetails } from '@/services/bankingDetailsService'

interface Bank {
  name: string
  code: string
}

type Country = 'nigeria' | 'ghana' | 'kenya' | 'south africa'

const COUNTRIES: { value: Country; label: string; currency: string }[] = [
  { value: 'nigeria', label: 'Nigeria', currency: 'NGN' },
  { value: 'ghana', label: 'Ghana', currency: 'GHS' },
  { value: 'kenya', label: 'Kenya', currency: 'KES' },
  { value: 'south africa', label: 'South Africa', currency: 'ZAR' },
]

const initialForm = {
  country: 'nigeria' as Country,
  bankName: '',
  bankCode: '',
  accountName: '',
  accountNumber: '', // phone number for Kenya M-PESA
}

// Kenya payouts go to M-PESA (phone number), not a bank account number
const isKenyaMobileMoney = (country: Country) => country === 'kenya'

export default function BankingDetailsPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [banks, setBanks] = useState<Bank[]>([])
  const [banksLoading, setBanksLoading] = useState(false)
  const [bankSearch, setBankSearch] = useState('')
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false)
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const bankDropdownRef = useRef<HTMLDivElement>(null)
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  const fetchBanks = async (country: Country) => {
    setBanksLoading(true)
    setBanks([])
    try {
      const res = await fetch(`/api/banks?country=${encodeURIComponent(country)}`)
      const json = await res.json()
      if (json.status && Array.isArray(json.data)) {
        setBanks(json.data.map((b: { name: string; code: string }) => ({ name: b.name, code: b.code })))
      }
    } catch {
      toast.error('Failed to load bank list')
    } finally {
      setBanksLoading(false)
    }
  }

  useEffect(() => {
    void fetchBanks(formData.country)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(e.target as Node)) {
        setBankDropdownOpen(false)
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setFormData(initialForm)
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const saved = await getBankingDetails(user.uid)
        if (saved) {
          const country = (saved.country as Country) ?? 'nigeria'
          setFormData({
            country,
            bankName: saved.bankName ?? '',
            bankCode: saved.bankCode ?? '',
            accountName: saved.accountName ?? '',
            accountNumber: saved.accountNumber ?? '',
          })
          void fetchBanks(country)
        }
      } catch {
        toast.error('Failed to load banking details')
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [user])

  const isMobileMoney = isKenyaMobileMoney(formData.country)

  const hasCompletedDetails = useMemo(
    () =>
      Boolean(
        formData.bankName.trim() &&
          formData.accountName.trim() &&
          formData.accountNumber.trim()
      ),
    [formData]
  )

  const filteredBanks = useMemo(
    () => banks.filter((b) => b.name.toLowerCase().includes(bankSearch.toLowerCase())),
    [banks, bankSearch]
  )

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setFormData((curr) => ({ ...curr, [field]: value }))
  }

  const handleSelectCountry = (country: Country) => {
    setFormData((curr) => ({ ...curr, country, bankName: '', bankCode: '', accountNumber: '' }))
    setCountryDropdownOpen(false)
    setBankSearch('')
    void fetchBanks(country)
  }

  const handleSelectBank = (bank: Bank) => {
    setFormData((curr) => ({ ...curr, bankName: bank.name, bankCode: bank.code }))
    setBankDropdownOpen(false)
    setBankSearch('')
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
    } catch {
      toast.error('Failed to save banking details')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Skeleton className="h-48 w-full max-w-3xl rounded-xl" />
  }

  const selectedCountryLabel = COUNTRIES.find((c) => c.value === formData.country)?.label ?? ''

  return (
    <Card className="max-w-3xl">
      <CardContent className="space-y-4 pt-6">
        {/* Country */}
        <div className="space-y-2">
          <Label>Country</Label>
          <div className="relative" ref={countryDropdownRef}>
            <button
              type="button"
              onClick={() => setCountryDropdownOpen((o) => !o)}
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <span>{selectedCountryLabel}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
            {countryDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                <ul className="py-1">
                  {COUNTRIES.map((c) => (
                    <li
                      key={c.value}
                      onClick={() => handleSelectCountry(c.value)}
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Bank / provider */}
          <div className="space-y-2">
            <Label>{isMobileMoney ? 'Mobile money provider' : 'Bank name'}</Label>
            <div className="relative" ref={bankDropdownRef}>
              <button
                type="button"
                onClick={() => setBankDropdownOpen((o) => !o)}
                disabled={banksLoading}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className={formData.bankName ? 'text-foreground' : 'text-muted-foreground'}>
                  {banksLoading ? 'Loading...' : formData.bankName || 'Select'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
              {bankDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                  <div className="flex items-center border-b px-3">
                    <Search className="h-4 w-4 shrink-0 opacity-50" />
                    <input
                      autoFocus
                      className="flex h-9 w-full bg-transparent py-1 pl-2 text-sm outline-none placeholder:text-muted-foreground"
                      placeholder="Search..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                    />
                  </div>
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {filteredBanks.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-muted-foreground">No results</li>
                    ) : (
                      filteredBanks.map((bank) => (
                        <li
                          key={bank.code}
                          onClick={() => handleSelectBank(bank)}
                          className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          {bank.name}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Account name */}
          <div className="space-y-2">
            <Label htmlFor="account-name">Account name</Label>
            <Input
              id="account-name"
              placeholder="Jane Creator"
              value={formData.accountName}
              onChange={(e) => handleChange('accountName', e.target.value)}
            />
          </div>
        </div>

        {/* Account number / phone */}
        <div className="space-y-2">
          <Label htmlFor="account-number">
            {isMobileMoney ? 'M-PESA phone number' : 'Account number'}
          </Label>
          <Input
            id="account-number"
            inputMode="numeric"
            placeholder={isMobileMoney ? '+254722000000' : '0123456789'}
            value={formData.accountNumber}
            onChange={(e) =>
              handleChange(
                'accountNumber',
                isMobileMoney
                  ? e.target.value.replace(/[^\d+]/g, '').slice(0, 15)
                  : e.target.value.replace(/\D/g, '').slice(0, 16)
              )
            }
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : hasCompletedDetails ? 'Save Banking Details' : 'Add Banking Details'}
        </Button>
      </CardContent>
    </Card>
  )
}
