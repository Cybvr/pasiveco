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

import { payouts, payoutStats, payoutMethod } from "@/lib/payouts"

export default function PayoutsPage() {

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground">Monitor your transfers and manage payout settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" /> Manage Account
          </Button>
          <Button className="bg-[#5A1448] hover:bg-[#4A103B]">
             Request Payout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {payoutStats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              {idx === 0 ? <Calendar className="h-4 w-4 text-primary" /> :
               idx === 1 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
               idx === 2 ? <Clock className="h-4 w-4 text-orange-500" /> :
               <Banknote className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs text-muted-foreground mt-1 ${stat.status === 'warning' ? 'text-orange-600' : ''}`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
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
                  <p className="font-semibold text-foreground">{payoutMethod.bankName}</p>
                  <p className="text-sm text-muted-foreground">{payoutMethod.accountInfo}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Payout Settings</h4>
              {payoutMethod.settings.map((setting, idx) => (
                <div key={idx} className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">{setting.label}</span>
                  <span className="font-medium">{setting.value}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full">Edit Payout Details</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
