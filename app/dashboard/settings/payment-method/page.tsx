"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, CreditCard, Landmark, Loader2, Search, CheckCircle2, Pencil, Plus, MoreVertical, Keyboard } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"
import { 
  savePayoutAccount, 
  getPayoutAccounts, 
  deletePayoutAccount, 
  setDefaultPayoutAccount,
  BankingDetails 
} from "@/services/bankingDetailsService"
import {
  defaultPaymentSettings,
  getPaymentSettings,
  PaymentSettings,
  savePaymentSettings,
} from "@/services/paymentMethodService"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Bank {
  name: string
  code: string
}

type Country = "nigeria" | "ghana" | "kenya" | "south africa"

const COUNTRIES: { value: Country; label: string; currency: string }[] = [
  { value: "nigeria", label: "Nigeria", currency: "NGN" },
  { value: "ghana", label: "Ghana", currency: "GHS" },
  { value: "kenya", label: "Kenya", currency: "KES" },
  { value: "south africa", label: "South Africa", currency: "ZAR" },
]

const initialBankingForm = {
  country: "nigeria" as Country,
  bankName: "",
  bankCode: "",
  accountName: "",
  accountNumber: "",
}

const isKenyaMobileMoney = (country: Country) => country === "kenya"

export default function PayoutMethodsPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [settings, setSettings] = useState<PaymentSettings>(defaultPaymentSettings)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)

  const [payoutAccounts, setPayoutAccounts] = useState<BankingDetails[]>([])
  const [bankingLoading, setBankingLoading] = useState(true)
  const [bankingSaving, setBankingSaving] = useState(false)
  const [addingNew, setAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [bankingForm, setBankingForm] = useState(initialBankingForm)
  const [banks, setBanks] = useState<Bank[]>([])
  const [banksLoading, setBanksLoading] = useState(false)
  const [banksLoadFailed, setBanksLoadFailed] = useState(false)
  const [bankSearch, setBankSearch] = useState("")
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false)
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [manualBankEntry, setManualBankEntry] = useState(false)
  const bankDropdownRef = useRef<HTMLDivElement>(null)
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user?.uid) return
    const loadData = async () => {
      try {
        const [paySettings, accounts] = await Promise.all([
          getPaymentSettings(user.uid!),
          getPayoutAccounts(user.uid!)
        ])
        setSettings(paySettings)
        setPayoutAccounts(accounts)
      } catch {
        toast.error("Failed to load")
      } finally {
        setSettingsLoading(false)
        setBankingLoading(false)
      }
    }
    void loadData()
  }, [user])

  const fetchBanks = async (country: Country) => {
    setBanksLoading(true)
    setBanksLoadFailed(false)
    try {
      const res = await fetch(`/api/banks?country=${encodeURIComponent(country)}`)
      const json = await res.json()
      if (json.status && Array.isArray(json.data)) {
        setBanks(json.data.map((bank: { name: string; code: string }) => ({ name: bank.name, code: bank.code })))
      } else setBanksLoadFailed(true)
    } catch {
      setBanksLoadFailed(true)
    } finally {
      setBanksLoading(false)
    }
  }

  useEffect(() => { void fetchBanks(bankingForm.country) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) setBankDropdownOpen(false)
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) setCountryDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const toggleMethod = (method: "card" | "bank") => {
    setSettings((prev) => ({ ...prev, acceptedMethods: { ...prev.acceptedMethods, [method]: !prev.acceptedMethods[method] } }))
  }

  const handleSavePaymentSettings = async () => {
    if (!user?.uid) return
    setSettingsSaving(true)
    try {
      await savePaymentSettings(user.uid, settings)
      toast.success("Updated")
    } catch {
      toast.error("Failed")
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleEdit = (acc: BankingDetails) => {
    setBankingForm({ country: "nigeria", bankName: acc.bankName, bankCode: "", accountName: acc.accountName, accountNumber: acc.accountNumber })
    setEditingId(acc.id!)
    setAddingNew(true)
    setManualBankEntry(true) // Editing shows current bank as text for simplicity
  }

  const handleDelete = async (accId: string) => {
    if (!user?.uid) return
    try {
      await deletePayoutAccount(user.uid, accId)
      setPayoutAccounts(prev => prev.filter(a => a.id !== accId))
      toast.success("Deleted")
    } catch {
      toast.error("Error")
    }
  }

  const handleSetDefault = async (accId: string) => {
    if (!user?.uid) return
    try {
      await setDefaultPayoutAccount(user.uid, accId)
      setPayoutAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === accId })))
      toast.success("Done")
    } catch {
      toast.error("Error")
    }
  }

  const isMobileMoney = isKenyaMobileMoney(bankingForm.country)
  const hasCompletedBankingDetails = useMemo(() => Boolean(bankingForm.bankName.trim() && bankingForm.accountName.trim() && bankingForm.accountNumber.trim()), [bankingForm])
  const filteredBanks = useMemo(() => banks.filter((bank) => bank.name.toLowerCase().includes(bankSearch.toLowerCase())), [banks, bankSearch])
  const handleSelectCountry = (country: Country) => {
    setBankingForm((c) => ({ ...c, country, bankName: "", bankCode: "", accountNumber: "" }))
    setCountryDropdownOpen(false)
    void fetchBanks(country)
  }

  const handleSaveBankingDetails = async () => {
    if (!user?.uid) return
    setBankingSaving(true)
    try {
      const payload: BankingDetails = {
        ...bankingForm,
        id: editingId || undefined,
        isDefault: editingId ? (payoutAccounts.find(a => a.id === editingId)?.isDefault) : payoutAccounts.length === 0
      }
      await savePayoutAccount(user.uid, payload)
      setPayoutAccounts(await getPayoutAccounts(user.uid))
      setAddingNew(false); setEditingId(null); setManualBankEntry(false)
      toast.success("Saved")
    } catch (err: any) {
      console.error("Save banking error:", err)
      toast.error(err.message || "Failed to save account details")
    } finally {
      setBankingSaving(false)
    }
  }

  if (settingsLoading || bankingLoading) return <div className="max-w-2xl py-8 space-y-4"><Skeleton className="h-32 w-full" /></div>

  return (
    <div className="max-w-2xl space-y-8">
      {/* Payout Accounts */}
      <section className="space-y-4">
        {payoutAccounts.map((acc) => (
          <div key={acc.id} className={`flex items-center justify-between p-4 rounded-lg border bg-background ${acc.isDefault ? "border-primary/30 ring-1 ring-primary/5" : ""}`}>
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded flex items-center justify-center ${acc.isDefault ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><Landmark className="h-5 w-5" /></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{acc.bankName}</span>
                  {acc.isDefault && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">Default</span>}
                </div>
                <p className="text-xs text-muted-foreground">{acc.accountName} • {acc.accountNumber}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs w-44 p-1">
                {!acc.isDefault && <DropdownMenuItem onClick={() => handleSetDefault(acc.id!)}>Set as Default</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => handleEdit(acc)}>Edit Account</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(acc.id!)} className="text-destructive">Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {!addingNew ? (
          <div className="flex justify-start">
            <Button size="sm" variant="outline" className="h-9 px-4 rounded-lg font-medium" onClick={() => { setAddingNew(true); setEditingId(null); setBankingForm(initialBankingForm); setManualBankEntry(false) }}>
              <Plus className="h-4 w-4 mr-2" /> Add Payout Account
            </Button>
          </div>
        ) : (
          <div className="p-5 border rounded-lg bg-muted/5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold opacity-60 uppercase tracking-wider">{editingId ? "Edit Account" : "Add New Account"}</h3>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-primary gap-1" onClick={() => setManualBankEntry(!manualBankEntry)}>
                {manualBankEntry ? <><Landmark className="h-3 w-3" /> Use Bank List</> : <><Keyboard className="h-3 w-3" /> Type Bank Manually</>}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] uppercase font-bold opacity-50">Country</Label>
                <div className="relative" ref={countryDropdownRef}>
                  <button onClick={() => setCountryDropdownOpen(!countryDropdownOpen)} className="h-10 w-full rounded-md flex items-center justify-between px-3 border bg-background text-sm">
                    {COUNTRIES.find(c => c.value === bankingForm.country)?.label} <ChevronDown className="h-4 w-4 opacity-40" />
                  </button>
                  {countryDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full border bg-popover rounded shadow-lg p-1 text-left">
                      {COUNTRIES.map(c => (
                        <button key={c.value} onClick={() => handleSelectCountry(c.value)} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent">{c.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold opacity-50">{isMobileMoney ? "Provider" : "Bank"}</Label>
                {manualBankEntry ? (
                  <Input className="h-10 text-sm" placeholder={isMobileMoney ? "e.g. M-Pesa" : "e.g. GTBank"} value={bankingForm.bankName} onChange={e => setBankingForm({...bankingForm, bankName: e.target.value})} />
                ) : (
                  <div className="relative" ref={bankDropdownRef}>
                    <button onClick={() => setBankDropdownOpen(!bankDropdownOpen)} className="h-10 w-full rounded-md flex items-center justify-between px-3 border bg-background text-sm text-left truncate">
                      <span className="truncate">{bankingForm.bankName || "Select"}</span> <ChevronDown className="h-4 w-4 opacity-40" />
                    </button>
                    {bankDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full border bg-popover rounded shadow-xl p-1 text-left">
                        <div className="flex items-center px-3 py-2 border-b mb-1"><Search className="h-4 w-4 opacity-30" /><input autoFocus className="h-8 w-full bg-transparent pl-2 text-xs outline-none" placeholder="Search..." value={bankSearch} onChange={e => setBankSearch(e.target.value)} /></div>
                        <div className="max-h-52 overflow-y-auto">
                          {filteredBanks.map(b => <button key={b.code} onClick={() => { setBankingForm({...bankingForm, bankName: b.name}); setBankDropdownOpen(false) }} className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-accent truncate">{b.name}</button>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold opacity-50">Account Name</Label>
                <Input className="h-10 text-sm" value={bankingForm.accountName} onChange={e => setBankingForm({...bankingForm, accountName: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] uppercase font-bold opacity-50">Account Number</Label>
                <Input className="h-10 text-sm" value={bankingForm.accountNumber} onChange={e => setBankingForm({...bankingForm, accountNumber: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-9 px-6 font-bold" onClick={handleSaveBankingDetails} disabled={bankingSaving}>{bankingSaving? "Saving..." : "Save Account"}</Button>
              <Button size="sm" variant="ghost" className="h-9 px-4 font-bold" onClick={() => { setAddingNew(false); setEditingId(null) }}>Cancel</Button>
            </div>
          </div>
        )}
      </section>

      {/* Store Checkout Methods */}
      <section className="space-y-4 pt-6 mt-8 border-t border-dashed border-muted">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Store Checkout Methods</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => toggleMethod("card")} className={`flex items-center gap-3 p-4 text-left rounded-lg border transition-all ${settings.acceptedMethods.card ? "border-primary bg-primary/[0.03]" : "hover:border-muted-foreground/30"}`}>
            <CreditCard className={`h-5 w-5 ${settings.acceptedMethods.card ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-sm font-bold">Card</span>
            {settings.acceptedMethods.card && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
          </button>
          <button onClick={() => toggleMethod("bank")} className={`flex items-center gap-3 p-4 text-left rounded-lg border transition-all ${settings.acceptedMethods.bank ? "border-primary bg-primary/[0.03]" : "hover:border-muted-foreground/30"}`}>
            <Landmark className={`h-5 w-5 ${settings.acceptedMethods.bank ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-sm font-bold">Bank</span>
            {settings.acceptedMethods.bank && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
          </button>
        </div>
        <div className="flex justify-end pt-2">
          <Button size="sm" className="h-9 px-6 font-bold" onClick={handleSavePaymentSettings} disabled={settingsSaving}>
            {settingsSaving ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </section>
    </div>
  )
}
