"use client"

import React from "react"
import { Download, Filter, Search } from "lucide-react"
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
import Link from "next/link"
import { useRouter } from "next/navigation"

import { transactions, walletStats } from "@/lib/wallet"

export default function WalletPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">View earnings, available balance, and withdrawal methods.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/dashboard/payouts">Withdraw</Link>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {walletStats.map((stat, idx) => (
          <Card key={idx} className={`border-none shadow-sm ${idx === 0 ? "bg-muted/30" : ""}`}>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold leading-none">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-2">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
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
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/dashboard/wallet/${tx.id}`)}
                >
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell className={tx.amount.startsWith("-") ? "text-red-500" : ""}>{tx.amount}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center mt-4 pt-4 border-t">
            <Button variant="link">View all transactions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
