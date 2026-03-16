import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPayoutById } from "@/lib/payouts"

export default async function PayoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payout = getPayoutById(id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Withdrawal {payout?.id ?? id}</h1>
        <p className="text-muted-foreground">
          {payout ? "Withdrawal details" : "We couldn't find this withdrawal in local data."}
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
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={payout.status === "Completed" ? "default" : "outline"}>{payout.status}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Requested amount: {payout.amount}</p>
              <p>Transfer fee: $0.00</p>
              <p>Sent to destination: {payout.amount}</p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Details unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This ID does not match any withdrawal in the current mock data.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
