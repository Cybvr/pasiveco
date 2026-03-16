import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { transactions } from "@/lib/wallet"

export default function TransactionPage({ params }: { params: { id: string } }) {
  const transaction = transactions.find((item) => item.id === params.id)

  if (!transaction) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Earning {transaction.id}</h1>
        <p className="text-muted-foreground">Earning transaction details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold">{transaction.amount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{transaction.date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="font-medium">{transaction.customer}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">{transaction.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={transaction.status === "Paid" ? "default" : transaction.status === "Pending" ? "outline" : "destructive"}>
              {transaction.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settlement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Gross amount: {transaction.amount}</p>
          <p>Processing fee: $0.00</p>
          <p>Net amount: {transaction.amount}</p>
        </CardContent>
      </Card>
    </div>
  )
}
