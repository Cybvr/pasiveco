"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { payouts, payoutStats } from "@/lib/payouts"

export default function PayoutsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Withdrawals</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings/payment-methods">
            <Button variant="outline">Banking details</Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Withdraw</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw</DialogTitle>
                <DialogDescription>Enter the amount you want to withdraw.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" placeholder="$0.00" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Withdraw</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {payoutStats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold leading-none">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-2">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow
                    key={payout.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/dashboard/settings/withdrawals/${payout.id}`)}
                  >
                    <TableCell className="font-semibold text-foreground">{payout.amount}</TableCell>
                    <TableCell>{payout.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
