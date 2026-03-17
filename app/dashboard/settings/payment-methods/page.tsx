'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Payment Methods</h1>
        <p className="text-sm text-muted-foreground">Manage your saved payment methods for subscriptions and billing.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No payment methods yet</CardTitle>
          <CardDescription>Add and manage payment methods from billing integrations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Your saved cards and payment options will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
