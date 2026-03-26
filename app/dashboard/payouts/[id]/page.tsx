"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPayoutRequestById } from "@/services/payoutService"
import { PayoutRequest } from "@/types/payout"
import { formatCurrency, type CurrencyCode } from "@/utils/currency"

export default function PayoutPage() {
  const params = useParams<{ id: string }>()
  const [payout, setPayout] = useState<PayoutRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return

      try {
        const result = await getPayoutRequestById(params.id)
        setPayout(result)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [params?.id])

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">
            Loading withdrawal details...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Withdrawal {payout?.id ?? params?.id}</h1>
        <p className="text-muted-foreground">
          {payout ? "Withdrawal request details" : "We couldn't find this withdrawal request."}
        </p>
      </div>

      {payout ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(payout.amount, payout.currency as CurrencyCode)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested on</p>
                <p className="font-medium">
                  {payout.createdAt?.toDate ? payout.createdAt.toDate().toLocaleString() : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">
                  {payout.bankName} ({payout.accountNumber})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={payout.status === "paid" ? "default" : "outline"} className="capitalize">
                  {payout.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Requested amount: {formatCurrency(payout.amount, payout.currency as CurrencyCode)}</p>
              <p>Transfer fee: {formatCurrency(0, payout.currency as CurrencyCode)}</p>
              <p>Sent to destination: {formatCurrency(payout.amount, payout.currency as CurrencyCode)}</p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Details unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This ID does not match any stored withdrawal request.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
