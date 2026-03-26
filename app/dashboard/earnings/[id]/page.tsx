"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Receipt } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc, Timestamp } from "firebase/firestore"
import { Transaction } from "@/types/transaction"
import { formatCurrency } from "@/utils/currency"

function formatDate(val: any) {
  if (!val) return "—"
  if (val instanceof Timestamp) return val.toDate().toLocaleString()
  if (val?.toDate) return val.toDate().toLocaleString()
  return String(val)
}

export default function EarningDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    const fetchTx = async () => {
      try {
        const docRef = doc(db, "transactions", id)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setTransaction({ id: snap.id, ...snap.data() } as Transaction)
        } else {
          setError("Transaction not found.")
        }
      } catch (e: any) {
        setError(e.message || "Failed to load transaction.")
      } finally {
        setLoading(false)
      }
    }
    fetchTx()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            Transaction Details
          </h1>
          <p className="break-all font-mono text-xs text-muted-foreground">{id}</p>
        </div>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Details unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : transaction ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                <span>Order Summary</span>
                <Badge variant={
                  transaction.status === "success" ? "default" :
                  transaction.status === "pending" ? "outline" : "destructive"
                }>
                  {transaction.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-muted-foreground">Product</p>
                  <p className="break-words font-medium">{transaction.productName || "—"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground">Reference</p>
                  <p className="font-mono text-xs break-all">{transaction.reference || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(transaction.amount, transaction.currency as any || "NGN")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Your Profit (90%)</p>
                  <p className="font-semibold text-green-600">{formatCurrency(transaction.yourProfit || 0, transaction.currency as any || "NGN")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payout</p>
                  <p className="font-medium">{transaction.payoutDate ? formatDate(transaction.payoutDate) : <span className="text-orange-500 text-xs">Processing</span>}</p>
                </div>
                {transaction.affiliate && (
                  <div className="min-w-0">
                    <p className="text-muted-foreground">Affiliate</p>
                    <Badge variant="secondary" className="max-w-full break-all">{transaction.affiliate}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-muted-foreground">Name</p>
                <p className="break-words font-medium">{transaction.customerName || "—"}</p>
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground">Email</p>
                <p className="break-all font-medium">{transaction.customerEmail || "—"}</p>
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground">Phone</p>
                <p className="break-all font-medium">{transaction.customerPhone || "—"}</p>
              </div>
              {transaction.variation && (
                <div className="min-w-0">
                  <p className="text-muted-foreground">Variation</p>
                  <p className="break-words font-medium">{transaction.variation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settlement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Amount</span>
                <span>{formatCurrency(transaction.amount, transaction.currency as any || "NGN")}</span>
              </div>
              {transaction.couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coupon Discount</span>
                  <span className="text-destructive">-{formatCurrency(transaction.couponDiscount, transaction.currency as any || "NGN")}</span>
                </div>
              )}
              {transaction.customCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custom Charge</span>
                  <span>{formatCurrency(transaction.customCharge, transaction.currency as any || "NGN")}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Net Profit</span>
                <span className="text-green-600">{formatCurrency(transaction.yourProfit || 0, transaction.currency as any || "NGN")}</span>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
