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

import { transactions, walletStats } from "@/lib/wallet"

export default function WalletPage() {

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
        {walletStats.map((stat, idx) => (
          <Card key={idx} className={`border-none shadow-sm ${idx === 0 ? 'bg-muted/30' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              {idx === 0 ? <Wallet className="h-4 w-4 text-muted-foreground" /> : 
               idx === 1 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : 
               <ArrowDownLeft className="h-4 w-4 text-orange-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className={`text-xs text-muted-foreground mt-1 ${stat.trend === 'up' ? 'text-green-600 flex items-center' : stat.type === 'italic' ? 'italic' : ''}`}>
                {stat.trend === 'up' && <TrendingUp className="mr-1 h-3 w-3" />}
                {stat.description}
              </p>
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
