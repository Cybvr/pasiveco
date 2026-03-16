import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { subscribers, subscriptionTimeline } from "@/lib/billings"

export default function SubscriptionPage({ params }: { params: { id: string } }) {
  const subscriber = subscribers.find((item) => item.id === params.id)

  const timeline = subscriber ? subscriptionTimeline[subscriber.id as keyof typeof subscriptionTimeline] || [] : []

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Subscription {subscriber?.id ?? params.id}</h1>
        <p className="text-muted-foreground">
          {subscriber ? "Subscription details" : "We couldn't find this subscription in local data."}
        </p>
      </div>

      {subscriber ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Subscriber</p>
                <p className="font-medium">{subscriber.name}</p>
                <p className="text-sm text-muted-foreground">{subscriber.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">{subscriber.plan} • {subscriber.amount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={subscriber.status === "Active" ? "default" : subscriber.status === "Canceled" ? "destructive" : "outline"}
                  className={subscriber.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                >
                  {subscriber.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">{subscriber.joined}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next renewal</p>
                <p className="font-medium">{subscriber.renewalDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment method</p>
                <p className="font-medium">{subscriber.paymentMethod}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-4 text-sm text-muted-foreground">
                {timeline.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Details unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This ID does not match any subscription in the current mock data.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
