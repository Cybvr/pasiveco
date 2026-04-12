"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, ChevronDown, CreditCard, Keyboard, Landmark, Loader2, MoreVertical, Pencil, Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"
import { BankingDetails, deletePayoutAccount, getPayoutAccounts, savePayoutAccount, setDefaultPayoutAccount } from "@/services/bankingDetailsService"
import { PaymentSettings, defaultPaymentSettings, getPaymentSettings, savePaymentSettings } from "@/services/paymentMethodService"

interface Bank {
  name: string
  code: string
}

type Country =
  | "nigeria"
  | "ghana"
  | "kenya"
  | "south africa"
  | "uganda"
  | "tanzania"
  | "rwanda"
  | "egypt"
  | "senegal"
  | "ivory coast"
  | "cameroon"
  | "united states"
  | "united kingdom"
  | "europe"

const COUNTRIES: { value: Country; label: string; currency: string; gateway: "flutterwave" | "stripe_connect" }[] = [
  { value: "nigeria", label: "Nigeria", currency: "NGN", gateway: "flutterwave" },
  { value: "ghana", label: "Ghana", currency: "GHS", gateway: "flutterwave" },
  { value: "kenya", label: "Kenya", currency: "KES", gateway: "flutterwave" },
  { value: "south africa", label: "South Africa", currency: "ZAR", gateway: "flutterwave" },
  { value: "uganda", label: "Uganda", currency: "UGX", gateway: "flutterwave" },
  { value: "tanzania", label: "Tanzania", currency: "TZS", gateway: "flutterwave" },
  { value: "rwanda", label: "Rwanda", currency: "RWF", gateway: "flutterwave" },
  { value: "egypt", label: "Egypt", currency: "EGP", gateway: "flutterwave" },
  { value: "senegal", label: "Senegal", currency: "XOF", gateway: "flutterwave" },
  { value: "ivory coast", label: "Ivory Coast", currency: "XOF", gateway: "flutterwave" },
  { value: "cameroon", label: "Cameroon", currency: "XAF", gateway: "flutterwave" },
  { value: "united states", label: "United States (Stripe)", currency: "USD", gateway: "stripe_connect" },
  { value: "united kingdom", label: "United Kingdom (Stripe)", currency: "GBP", gateway: "stripe_connect" },
  { value: "europe", label: "Europe (Stripe)", currency: "EUR", gateway: "stripe_connect" },
]

const initialBankingForm = { country: "nigeria" as Country, bankName: "", bankCode: "", accountName: "", accountNumber: "" }
const isKenyaMobileMoney = (country: Country) => country === "kenya"

export default function PaymentMethodsPage() {
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
  const [resolvingAccountName, setResolvingAccountName] = useState(false)
  const [accountResolveError, setAccountResolveError] = useState("")
  const [accountNameResolved, setAccountNameResolved] = useState(false)
  const bankDropdownRef = useRef<HTMLDivElement>(null)
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  const selectedCountry = COUNTRIES.find((country) => country.value === bankingForm.country)
  const isStripeCountry = selectedCountry?.gateway === "stripe_connect"
  const isMobileMoney = isKenyaMobileMoney(bankingForm.country)
  const filteredBanks = useMemo(() => banks.filter((bank) => bank.name.toLowerCase().includes(bankSearch.toLowerCase())), [banks, bankSearch])

  useEffect(() => {
    if (!user?.uid) return

    const loadData = async () => {
      try {
        const [paymentSettings, accounts] = await Promise.all([getPaymentSettings(user.uid), getPayoutAccounts(user.uid)])
        setSettings(paymentSettings)
        setPayoutAccounts(accounts)
      } catch {
        toast.error("Failed to load payment settings")
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
    setBanks([])
    try {
      const res = await fetch(`/api/banks?country=${encodeURIComponent(country)}`)
      const contentType = res.headers.get("content-type") || ""
      const json = contentType.includes("application/json") ? await res.json() : null
      if (!res.ok) throw new Error(json?.message || "Unable to load banks")
      if (json?.status && Array.isArray(json.data)) setBanks(json.data.map((bank: { name: string; code: string }) => ({ name: bank.name, code: bank.code })))
      else throw new Error(json?.message || "Unable to load banks")
    } catch {
      setBanksLoadFailed(true)
    } finally {
      setBanksLoading(false)
    }
  }

  useEffect(() => {
    void fetchBanks(bankingForm.country)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) setBankDropdownOpen(false)
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) setCountryDropdownOpen(false)
    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (isStripeCountry || manualBankEntry) {
      setResolvingAccountName(false)
      setAccountNameResolved(false)
      return
    }

    const trimmedAccountNumber = bankingForm.accountNumber.trim()
    const trimmedBankCode = bankingForm.bankCode.trim()

    if (!trimmedBankCode || trimmedAccountNumber.length < 10) {
      setResolvingAccountName(false)
      setAccountResolveError("")
      setAccountNameResolved(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        setResolvingAccountName(true)
        setAccountResolveError("")
        const res = await fetch("/api/banks/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: bankingForm.country, bankCode: trimmedBankCode, accountNumber: trimmedAccountNumber }),
          signal: controller.signal,
        })
        const contentType = res.headers.get("content-type") || ""
        const json = contentType.includes("application/json") ? await res.json() : null
        if (!res.ok || !json?.success) throw new Error(json?.message || "Unable to resolve account name")
        setBankingForm((current) => {
          if (current.bankCode !== trimmedBankCode || current.accountNumber.trim() !== trimmedAccountNumber) return current
          return { ...current, accountName: json.data.accountName || "" }
        })
        setAccountNameResolved(true)
      } catch (error: any) {
        if (error.name === "AbortError") return
        setAccountResolveError(error.message || "Unable to resolve account name")
        setAccountNameResolved(false)
      } finally {
        setResolvingAccountName(false)
      }
    }, 500)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [bankingForm.accountNumber, bankingForm.bankCode, bankingForm.country, isStripeCountry, manualBankEntry])

  const toggleMethod = (method: "card" | "bank") => {
    setSettings((prev) => ({ ...prev, acceptedMethods: { ...prev.acceptedMethods, [method]: !prev.acceptedMethods[method] } }))
  }

  const handleSavePaymentSettings = async () => {
    if (!user?.uid) return
    setSettingsSaving(true)
    try {
      await savePaymentSettings(user.uid, settings)
      toast.success("Checkout methods updated")
    } catch {
      toast.error("Failed to save checkout methods")
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleSelectCountry = (country: Country) => {
    const gateway = COUNTRIES.find((item) => item.value === country)?.gateway || "flutterwave"
    setBankingForm({ country, bankName: "", bankCode: "", accountName: "", accountNumber: "" })
    setBankSearch("")
    setManualBankEntry(false)
    setCountryDropdownOpen(false)
    setAccountResolveError("")
    setAccountNameResolved(false)
    if (gateway === "flutterwave") void fetchBanks(country)
  }

  const handleEdit = (account: BankingDetails) => {
    setBankingForm({
      country: (account.country as Country) || "nigeria",
      bankName: account.bankName,
      bankCode: account.bankCode || "",
      accountName: account.accountName,
      accountNumber: account.accountNumber,
    })
    setEditingId(account.id || null)
    setAddingNew(true)
    setManualBankEntry(!account.bankCode)
    setAccountResolveError("")
    setAccountNameResolved(false)
  }

  const handleDelete = async (accountId: string) => {
    if (!user?.uid) return
    try {
      await deletePayoutAccount(user.uid, accountId)
      setPayoutAccounts((current) => current.filter((account) => account.id !== accountId))
      toast.success("Payout account removed")
    } catch {
      toast.error("Unable to remove payout account")
    }
  }

  const handleSetDefault = async (accountId: string) => {
    if (!user?.uid) return
    try {
      await setDefaultPayoutAccount(user.uid, accountId)
      setPayoutAccounts((current) => current.map((account) => ({ ...account, isDefault: account.id === accountId })))
      toast.success("Default payout account updated")
    } catch {
      toast.error("Unable to update default account")
    }
  }

  const handleStripeConnect = async () => {
    if (!user?.email) return
    setBankingSaving(true)
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          country: bankingForm.country === "united kingdom" ? "GB" : bankingForm.country === "europe" ? "DE" : "US",
        }),
      })
      const json = await res.json()
      if (json.success && json.url) window.location.href = json.url
      else toast.error(json.error || "Failed to start Stripe onboarding")
    } catch {
      toast.error("Unable to start Stripe onboarding")
    } finally {
      setBankingSaving(false)
    }
  }

  const handleSaveBankingDetails = async () => {
    if (!user?.uid) return
    setBankingSaving(true)
    try {
      const payload: BankingDetails = {
        ...bankingForm,
        country: bankingForm.country,
        payoutGateway: isStripeCountry ? "stripe_connect" : "flutterwave",
        id: editingId || undefined,
        isDefault: editingId ? payoutAccounts.find((account) => account.id === editingId)?.isDefault : payoutAccounts.length === 0,
      }
      await savePayoutAccount(user.uid, payload)
      setPayoutAccounts(await getPayoutAccounts(user.uid))
      setAddingNew(false)
      setEditingId(null)
      setManualBankEntry(false)
      setBankingForm(initialBankingForm)
      setAccountResolveError("")
      toast.success("Payout account saved")
    } catch (error: any) {
      console.error("Save banking error:", error)
      toast.error(error.message || "Failed to save payout account")
    } finally {
      setBankingSaving(false)
    }
  }

  if (settingsLoading || bankingLoading) {
    return <div className="max-w-3xl space-y-4 py-6"><Skeleton className="h-28 w-full rounded-xl" /><Skeleton className="h-40 w-full rounded-xl" /></div>
  }

  return (
    <div className="max-w-3xl space-y-10">
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Payout Accounts</h2>
          <p className="text-sm text-muted-foreground">Choose where your earnings land when you request a withdrawal.</p>
        </div>

        {payoutAccounts.map((account) => (
          <div key={account.id} className={`flex items-center justify-between rounded-lg border bg-background p-4 ${account.isDefault ? "border-primary/30 ring-1 ring-primary/5" : ""}`}>
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded ${account.isDefault ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><Landmark className="h-5 w-5" /></div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{account.bankName}</span>
                  {account.isDefault && <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Default</span>}
                </div>
                <p className="text-xs text-muted-foreground">{account.accountName} - {account.accountNumber}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 p-1 text-xs">
                {!account.isDefault && <DropdownMenuItem onClick={() => handleSetDefault(account.id!)}>Set as Default</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => handleEdit(account)}><Pencil className="mr-2 h-3.5 w-3.5" />Edit Account</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(account.id!)} className="text-destructive">Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {!addingNew ? (
          <div className="flex justify-start">
            <Button size="sm" variant="outline" className="h-9 rounded-lg px-4 font-medium" onClick={() => { setAddingNew(true); setEditingId(null); setManualBankEntry(false); setBankingForm(initialBankingForm); setAccountResolveError(""); setAccountNameResolved(false) }}>
              <Plus className="mr-2 h-4 w-4" />Add Payout Account
            </Button>
          </div>
        ) : (
          <div className="space-y-5 rounded-lg border bg-muted/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{editingId ? "Edit payout account" : "Add payout account"}</h3>
                <p className="text-xs text-muted-foreground">{manualBankEntry ? "Use manual entry if your bank is missing from the list." : "Select a bank and we will try to resolve the account name for you."}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px] font-bold uppercase text-primary" onClick={() => { setManualBankEntry((current) => !current); setAccountNameResolved(false) }}>
                {manualBankEntry ? <Landmark className="h-3 w-3" /> : <Keyboard className="h-3 w-3" />}
                {manualBankEntry ? "Use Bank List" : "Type Bank"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-bold uppercase opacity-50">Country</Label>
                <div className="relative" ref={countryDropdownRef}>
                  <button onClick={() => setCountryDropdownOpen((current) => !current)} className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm">
                    {selectedCountry?.label}<ChevronDown className="h-4 w-4 opacity-40" />
                  </button>
                  {countryDropdownOpen && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded border bg-popover p-1 text-left shadow-lg">
                      {COUNTRIES.map((country) => (
                        <button key={country.value} onClick={() => handleSelectCountry(country.value)} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent">{country.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isStripeCountry ? (
                <div className="space-y-4 rounded-lg border border-dashed bg-primary/5 p-6 text-center md:col-span-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><CreditCard className="h-6 w-6" /></div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Stripe Connect</h4>
                    <p className="text-sm text-muted-foreground">Connect Stripe to accept payout transfers to your bank account in USD, GBP, or EUR regions.</p>
                  </div>
                  <Button size="sm" className="font-medium" onClick={handleStripeConnect} disabled={bankingSaving}>
                    {bankingSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {bankingSaving ? "Redirecting..." : "Connect with Stripe"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-50">{isMobileMoney ? "Provider" : "Bank"}</Label>
                    {manualBankEntry ? (
                      <Input
                        className="h-10 text-sm"
                        placeholder={isMobileMoney ? "e.g. M-Pesa" : "e.g. GTBank"}
                        value={bankingForm.bankName}
                        onChange={(event) => {
                          setBankingForm((current) => ({ ...current, bankName: event.target.value, bankCode: "", accountName: "" }))
                          setAccountNameResolved(false)
                        }}
                      />
                    ) : (
                      <div className="relative" ref={bankDropdownRef}>
                        <button onClick={() => setBankDropdownOpen((current) => !current)} className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-left text-sm">
                          <span className="truncate">{banksLoading ? "Loading banks..." : bankingForm.bankName || "Select bank"}</span>
                          <ChevronDown className="h-4 w-4 opacity-40" />
                        </button>
                        {bankDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-full rounded border bg-popover p-1 text-left shadow-xl">
                            <div className="mb-1 flex items-center border-b px-3 py-2">
                              <Search className="h-4 w-4 opacity-30" />
                              <input autoFocus className="h-8 w-full bg-transparent pl-2 text-xs outline-none" placeholder="Search bank" value={bankSearch} onChange={(event) => setBankSearch(event.target.value)} />
                            </div>
                            <div className="max-h-52 overflow-y-auto">
                              {banksLoading && <div className="px-3 py-2 text-xs text-muted-foreground">Loading banks...</div>}
                              {!banksLoading && banksLoadFailed && <div className="px-3 py-2 text-xs text-destructive">Could not load banks. You can type the bank manually instead.</div>}
                              {!banksLoading && !banksLoadFailed && filteredBanks.map((bank) => (
                                <button
                                  key={`${bank.code}-${bank.name}`}
                                  onClick={() => {
                                    setBankingForm((current) => ({ ...current, bankName: bank.name, bankCode: bank.code, accountName: "" }))
                                    setAccountResolveError("")
                                    setAccountNameResolved(false)
                                    setBankDropdownOpen(false)
                                  }}
                                  className="w-full rounded px-3 py-1.5 text-left text-xs hover:bg-accent"
                                >
                                  {bank.name}
                                </button>
                              ))}
                              {!banksLoading && !banksLoadFailed && filteredBanks.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No bank found for "{bankSearch}".</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-50">Account Number</Label>
                    <Input
                      className="h-10 text-sm"
                      inputMode="numeric"
                      value={bankingForm.accountNumber}
                      onChange={(event) => {
                        const nextValue = event.target.value.replace(/\D/g, "")
                        setBankingForm((current) => ({ ...current, accountNumber: nextValue, accountName: current.bankCode ? "" : current.accountName }))
                        setAccountResolveError("")
                        setAccountNameResolved(false)
                      }}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] font-bold uppercase opacity-50">Account Name</Label>
                        {accountNameResolved && !manualBankEntry && bankingForm.bankCode && bankingForm.accountName && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />Verified
                          </span>
                        )}
                      </div>
                      {resolvingAccountName && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />Checking…
                        </span>
                      )}
                    </div>
                    <Input
                      className="h-10 text-sm"
                      readOnly={!manualBankEntry}
                      value={bankingForm.accountName}
                      onChange={(event) => {
                        setBankingForm((current) => ({ ...current, accountName: event.target.value }))
                        setAccountNameResolved(false)
                      }}
                    />
                    {accountResolveError && <p className="text-xs text-destructive">{accountResolveError}</p>}
                  </div>
                </>
              )}
            </div>

            {!isStripeCountry && (
              <div className="flex gap-2">
                <Button size="sm" className="h-9 px-6 font-medium" onClick={handleSaveBankingDetails} disabled={bankingSaving}>
                  {bankingSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {bankingSaving ? "Saving..." : "Save Account"}
                </Button>
                <Button size="sm" variant="ghost" className="h-9 px-4 font-medium" onClick={() => { setAddingNew(false); setEditingId(null); setManualBankEntry(false); setBankingForm(initialBankingForm); setAccountResolveError(""); setAccountNameResolved(false) }}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="space-y-4 border-t border-dashed pt-8">
        <div className="space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Store Checkout Methods</h2>
          <p className="text-sm text-muted-foreground">Choose which payment methods buyers can use on your product checkout.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => toggleMethod("card")} className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${settings.acceptedMethods.card ? "border-primary bg-primary/[0.03]" : "hover:border-muted-foreground/30"}`}>
            <CreditCard className={`h-5 w-5 ${settings.acceptedMethods.card ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-sm font-semibold">Card</span>
            {settings.acceptedMethods.card && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
          </button>
          <button onClick={() => toggleMethod("bank")} className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${settings.acceptedMethods.bank ? "border-primary bg-primary/[0.03]" : "hover:border-muted-foreground/30"}`}>
            <Landmark className={`h-5 w-5 ${settings.acceptedMethods.bank ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-sm font-semibold">Bank</span>
            {settings.acceptedMethods.bank && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Button size="sm" className="h-9 px-6 font-medium" onClick={handleSavePaymentSettings} disabled={settingsSaving}>
            {settingsSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {settingsSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </section>
    </div>
  )
}
