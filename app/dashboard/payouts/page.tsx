"use client"

import React from "react"
import { 
  ArrowUpRight, 
  Banknote, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard,
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

export default function PayoutsPage() {
  const payouts = [
    { id: "PAY-001", amount: "$1,200.00", date: "Mar 01, 2024", method: "Bank Transfer (**** 4567)", status: "Completed" },
    { id: "PAY-002", amount: "$850.00", date: "Feb 15, 2024", method: "Bank Transfer (**** 4567)", status: "Completed" },
    { id: "PAY-003", amount: "$2,100.00", date: "Feb 01, 2024", method: "Bank Transfer (**** 4567)", status: "Completed" },
    { id: "PAY-004", amount: "$420.00", date: "Jan 15, 2024", method: "Bank Transfer (**** 4567)", status: "Completed" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground">Monitor your transfers and manage payout settings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" /> Manage Account
          </Button>
          <Button className="bg-[#5A1448] hover:bg-[#4A103B]">
             Request Payout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Scheduled Payout</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mar 15, 2024</div>
            <p className="text-xs text-muted-foreground mt-1">Automatic weekly transfer</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid Out</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$10,440.00</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully cleared</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,560.00</div>
            <p className="text-xs text-muted-foreground mt-1 text-orange-600">Currently processing</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid Earnings</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$890.00</div>
            <p className="text-xs text-muted-foreground mt-1">Below $1,000 threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payout History</CardTitle>
            <CardDescription>A summary of your most recent earnings transfers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Payout ID</TableHead>
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

        <Card className="border-none shadow-sm bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-primary" /> Payout Method
            </CardTitle>
            <CardDescription>Where your funds are sent after processing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-background rounded-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Chase Bank Business</p>
                  <p className="text-sm text-muted-foreground">Checking •••• 4567</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Payout Settings</h4>
              <div className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Minimum Threshold</span>
                <span className="font-medium">$100.00</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b">
                <span className="text-muted-foreground">Payment Frequency</span>
                <span className="font-medium">Every Friday</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">Edit Payout Details</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
