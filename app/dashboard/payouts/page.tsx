"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { getAffiliateTransactions, getSellerTransactions } from "@/services/transactionsService"
import { createPayoutRequest, getUserPayoutRequests } from "@/services/payoutService"
import { getPayoutAccounts, type BankingDetails } from "@/services/bankingDetailsService"
import { Transaction } from "@/types/transaction"
import { PayoutRequest } from "@/types/payout"
import { useCurrency } from "@/context/CurrencyContext"
import { EXCHANGE_RATE, formatCurrency, type CurrencyCode } from "@/utils/currency"
import { toast } from "sonner"
import { Timestamp } from "firebase/firestore"
import DashboardPagination from "@/components/dashboard/DashboardPagination"

export default function PayoutsPage() {
  const ITEMS_PER_PAGE = 10
  const router = useRouter()
  const { user } = useAuth()
  const { currency } = useCurrency()

  const [sellerTransactions, setSellerTransactions] = useState<Transaction[]>([])
  const [affiliateTransactions, setAffiliateTransactions] = useState<Transaction[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [payoutAccounts, setPayoutAccounts] = useState<BankingDetails[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const formatAccountEnding = (accountNumber?: string | null) => {
    const digits = (accountNumber || "").replace(/\D/g, "")
    if (!digits) return "Account on file"
    return `Account ending in ${digits.slice(-4)}`
  }

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return

      try {
        const [sellerTx, affiliateTx, requests, accounts] = await Promise.all([
          getSellerTransactions(user.uid),
          getAffiliateTransactions(user.uid),
          getUserPayoutRequests(user.uid),
          getPayoutAccounts(user.uid),
        ])

        setSellerTransactions(sellerTx)
        setAffiliateTransactions(affiliateTx)
        setPayoutRequests(requests)
        setPayoutAccounts(accounts)
        
        const defaultAcc = accounts.find(a => a.isDefault) || accounts[0]
        if (defaultAcc) setSelectedAccountId(defaultAcc.id!)
      } catch (error) {
        console.error("Failed to load payouts data:", error)
        toast.error("Failed to load data")
      }
    }

    void load()
  }, [user])

  const convertAmount = (amountValue: number, sourceCurrency?: string) => {
    const source = (sourceCurrency || "NGN").toUpperCase()
    const target = currency.toUpperCase()
    if (source === target) return amountValue
    if (source === "NGN" && target === "USD") return amountValue / EXCHANGE_RATE
    if (source === "USD" && target === "NGN") return amountValue * EXCHANGE_RATE
    return amountValue
  }

  const getEarningValue = (tx: Transaction) => tx.yourProfit || tx.amount || 0

  const summary = useMemo(() => {
    const successfulTransactions = [...sellerTransactions, ...affiliateTransactions].filter(tx => tx.status === "success")
    const totalEarnings = successfulTransactions.reduce((sum, tx) => sum + convertAmount(getEarningValue(tx), tx.currency), 0)
    const pendingPayout = successfulTransactions.filter(tx => !tx.payoutDate).reduce((sum, tx) => sum + convertAmount(getEarningValue(tx), tx.currency), 0)
    const paidOut = successfulTransactions.filter((tx) => tx.payoutDate).reduce((sum, tx) => sum + convertAmount(getEarningValue(tx), tx.currency), 0)

    return { totalEarnings, pendingPayout, paidOut, requests: payoutRequests.length }
  }, [affiliateTransactions, currency, payoutRequests.length, sellerTransactions])

  const stats = [
    { title: "Total Earnings", value: formatCurrency(summary.totalEarnings, currency) },
    { title: "Available for Withdrawal", value: formatCurrency(summary.pendingPayout, currency) },
    { title: "Payout Requests", value: summary.requests.toString() },
  ]

  useEffect(() => { setCurrentPage(1) }, [payoutRequests.length])

  const totalPages = Math.max(1, Math.ceil(payoutRequests.length / ITEMS_PER_PAGE))
  const paginatedPayoutRequests = payoutRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleWithdraw = async () => {
    if (!user?.uid) return
    const account = payoutAccounts.find(a => a.id === selectedAccountId)
    if (!account) { toast.error("Select a withdrawal account"); return }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) { toast.error("Enter a valid amount"); return }
    if (numericAmount > summary.pendingPayout) { toast.error("Insufficient balance"); return }

    const payload = {
      userId: user.uid,
      amount: numericAmount,
      currency,
      status: "pending",
      bankName: account.bankName || null,
      accountName: account.accountName || null,
      accountNumber: account.accountNumber || null,
      recipientCode: account.recipientCode || null,
    }

    setSubmitting(true)
    try {
      const requestId = await createPayoutRequest(payload as any)

      setPayoutRequests(current => [{
        id: requestId,
        ...payload,
        createdAt: Timestamp.now(),
      } as any, ...current])

      setAmount(""); setDialogOpen(false)
      toast.success("Withdrawal submitted")
    } catch {
      toast.error("Failed to submit")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Withdrawals</h1>
        {payoutAccounts.length > 0 ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={summary.pendingPayout <= 0} className="font-bold">Withdraw</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>Available: {formatCurrency(summary.pendingPayout, currency)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold opacity-50">Transfer to</Label>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {payoutAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id!} className="rounded-lg">
                          <div className="flex flex-col items-start py-0.5">
                            <span className="font-bold text-sm tracking-tight">{acc.bankName}</span>
                            <span className="text-[10px] opacity-60 leading-none mt-0.5">{formatAccountEnding(acc.accountNumber)}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <div className="border-t mt-1 p-1">
                        <button
                          onClick={() => { setDialogOpen(false); router.push("/dashboard/settings/payment-method") }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <Pencil className="h-3 w-3" /> Manage Accounts
                        </button>
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-xs uppercase font-bold opacity-50">Amount</Label>
                  <Input id="amount" className="h-11 rounded-xl font-bold" inputMode="decimal" placeholder={formatCurrency(0, currency)} value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={handleWithdraw} disabled={submitting}>
                  {submitting ? "Processing..." : "Confirm Withdrawal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Link href="/dashboard/settings/payment-method">
            <Button className="font-bold">Add Withdrawal Account</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-40 mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-lg font-bold">Withdrawal Methods</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Choose where your earnings land when you cash out.</p>
          </div>
          <Link href="/dashboard/settings/payment-method">
            <Button variant="outline" size="sm" className="font-bold">Manage</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {payoutAccounts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              No withdrawal account added yet.
            </div>
          ) : (
            payoutAccounts.map((account) => (
              <div
                key={account.id}
                className={`flex items-center justify-between rounded-xl border bg-background p-4 ${account.isDefault ? "border-primary/30 ring-1 ring-primary/5" : ""}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{account.bankName}</span>
                    {account.isDefault ? (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {account.accountName} · {formatAccountEnding(account.accountNumber)}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold">Withdrawal History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[11px] uppercase font-bold opacity-50">Amount</TableHead>
              <TableHead className="text-[11px] uppercase font-bold opacity-50">Date</TableHead>
              <TableHead className="text-[11px] uppercase font-bold opacity-50">Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {payoutRequests.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground italic">No withdrawals yet.</TableCell></TableRow>
              ) : (
                paginatedPayoutRequests.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30 transition-colors border-none" onClick={() => router.push(`/dashboard/payouts/${p.id}`)}>
                    <TableCell className="font-bold">{formatCurrency(p.amount, p.currency as CurrencyCode)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : "-"}</TableCell>
                    <TableCell><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{p.status}</span></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && <DashboardPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </CardContent>
      </Card>
    </div>
  )
}
