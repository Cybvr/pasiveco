"use client"

import React from "react"
import { Download, Search } from "lucide-react"
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

export default function EarningsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Earnings</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/dashboard/settings/withdrawals">Withdraw</Link>
          </Button>
          <Button variant="outline" size="icon" aria-label="Download report">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {walletStats.map((stat, idx) => (
          <Card key={idx} className={`border-none shadow-sm ${idx === 0 ? "bg-muted/30" : ""}`}>
            <CardContent className="p-3 md:p-4">
              <div className="text-lg md:text-2xl font-bold leading-tight break-words">{stat.value}</div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 w-[200px] h-9" />
              </div>
            </div>
          </div>
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
              {transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/dashboard/settings/earnings/${tx.id}`)}
                >
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
