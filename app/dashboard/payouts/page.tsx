"use client"

import React from "react"
import { 
  Banknote, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Settings
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { payouts, payoutStats } from "@/lib/payouts"

export default function PayoutsPage() {

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Withdrawals</h1>
          <p className="text-muted-foreground">View earnings, available balance, and withdrawal methods.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Withdrawal methods
            </Button>
          </Link>
          <Button className="bg-[#5A1448] hover:bg-[#4A103B]">
             Request Withdrawal
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {payoutStats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
              {idx === 0 ? <Calendar className="h-4 w-4 text-primary" /> :
               idx === 1 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
               idx === 2 ? <Clock className="h-4 w-4 text-orange-500" /> :
               <Banknote className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              <p className={`text-xs text-muted-foreground mt-1 ${stat.status === 'warning' ? 'text-orange-600' : ''}`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Withdrawal History</CardTitle>
            <CardDescription>A summary of your most recent withdrawals.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Withdrawal ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{payout.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{payout.amount}</TableCell>
                    <TableCell>{payout.date}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{payout.method}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        {payout.status}
                      </span>
                    </TableCell>
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
