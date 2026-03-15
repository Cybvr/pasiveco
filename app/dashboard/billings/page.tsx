"use client"

import React from "react"
import { 
  Users, 
  CreditCard, 
  RefreshCcw, 
  TrendingUp, 
  Calendar,
  MoreHorizontal,
  Mail,
  UserPlus
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
import { Badge } from "@/components/ui/badge"

export default function BillingsPage() {
  const subscribers = [
    { name: "Alex Johnson", email: "alex@example.com", plan: "Pro Monthly", amount: "$29/mo", status: "Active", joined: "Jan 12, 2024" },
    { name: "Maria Garcia", email: "m.garcia@test.io", plan: "Basic Annual", amount: "$199/yr", status: "Active", joined: "Feb 05, 2024" },
    { name: "Kevin Lee", email: "klee@hq.com", plan: "Pro Monthly", amount: "$29/mo", status: "Canceled", joined: "Nov 20, 2023" },
    { name: "Emma Davis", email: "emma.d@web.com", plan: "Business", amount: "$99/mo", status: "Active", joined: "Mar 01, 2024" },
    { name: "Robert Chen", email: "r.chen@tech.com", plan: "Pro Monthly", amount: "$29/mo", status: "Retrying", joined: "Dec 15, 2023" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billings</h1>
          <p className="text-muted-foreground">Manage your subscriptions, subscribers, and recurring revenue.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" /> Message All
          </Button>
          <Button className="bg-[#5A1448] hover:bg-[#4A103B]">
             <UserPlus className="mr-2 h-4 w-4" /> Add Subscriber
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" /> +4.5% vs last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</CardTitle>
            <RefreshCcw className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$14,560.00</div>
            <p className="text-xs text-muted-foreground mt-1">Projected MRR</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Revenue Per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32.50</div>
            <p className="text-xs text-muted-foreground mt-1">Up from $31.00</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4%</div>
            <p className="text-xs text-muted-foreground mt-1 text-red-600">Increased slightly</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Subscriber List</CardTitle>
          <CardDescription>View and manage all your active and past subscribers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Subscriber</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((sub, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{sub.name}</span>
                      <span className="text-xs text-muted-foreground">{sub.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{sub.plan}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {sub.amount}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{sub.joined}</TableCell>
                  <TableCell>
                    <Badge variant={
                      sub.status === 'Active' ? 'default' : 
                      sub.status === 'Canceled' ? 'destructive' : 
                      'outline'
                    } className={
                      sub.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''
                    }>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
