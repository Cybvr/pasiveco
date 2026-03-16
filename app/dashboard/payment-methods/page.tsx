import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Payment Methods</h1>
        <p className="text-muted-foreground">Add and manage your withdrawal methods.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add withdrawal type</CardTitle>
          <CardDescription>Connect a payout destination for future withdrawals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="method-name">Method name</Label>
            <Input id="method-name" placeholder="Bank transfer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">Account details</Label>
            <Input id="account" placeholder="Checking •••• 1234" />
          </div>
          <Button>Add method</Button>
        </CardContent>
      </Card>
    </div>
  )
}
