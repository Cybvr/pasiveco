import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { payouts } from "@/lib/payouts"

export default function PayoutPage({ params }: { params: { id: string } }) {
  const payout = payouts.find((item) => item.id === params.id)

  if (!payout) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Withdraw</h1>
        <p className="text-muted-foreground">Withdrawal details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold">{payout.amount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{payout.date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Method</p>
            <p className="font-medium">{payout.method}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
