"use client"

import React from "react"
import { 
  Wallet, 
  Download, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  MoreVertical,
  Search
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function WalletPage() {
  const transactions = [
    { id: "INV001", customer: "John Doe", type: "Sale", amount: "$45.00", date: "Mar 12, 2024", status: "Paid" },
    { id: "INV002", customer: "Jane Smith", type: "Subscription", amount: "$15.00", date: "Mar 11, 2024", status: "Paid" },
    { id: "INV003", customer: "Michael Brown", type: "Sale", amount: "$120.00", date: "Mar 10, 2024", status: "Paid" },
    { id: "INV004", customer: "Sarah Wilson", type: "Sale", amount: "$25.00", date: "Mar 09, 2024", status: "Pending" },
    { id: "INV005", customer: "Chris Evans", type: "Refund", amount: "-$30.00", date: "Mar 08, 2024", status: "Refunded" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and view transaction history.</p>
        </div>
        <Button className="bg-[#5A1448] hover:bg-[#4A103B]">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$2,450.00</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,890.00</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime revenue</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Clearance</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$420.00</div>
            <p className="text-xs text-muted-foreground mt-1 italic">Expected within 3-5 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 w-[200px] h-9" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.customer}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell className={tx.amount.startsWith('-') ? 'text-red-500' : ''}>{tx.amount}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      tx.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                      tx.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center mt-4 pt-4 border-t">
            <Button variant="link" className="text-[#5A1448]">View all transactions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
