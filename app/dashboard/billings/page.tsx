"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Calendar, MoreHorizontal, Mail, UserPlus } from "lucide-react"
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

import { subscribers, billingStats } from "@/lib/billings"

export default function BillingsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">Manage your subscriptions, subscribers, and recurring revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" /> Message All
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add Subscriber
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {billingStats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="text-3xl font-bold mt-2">{stat.value}</div>
              <p
                className={`text-xs text-muted-foreground mt-1 ${
                  stat.trend === "up" ? "text-green-600" : stat.type === "danger" ? "text-red-600" : ""
                }`}
              >
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
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
              {subscribers.map((sub) => (
                <TableRow
                  key={sub.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/dashboard/billings/${sub.id}`)}
                >
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
                    <Badge
                      variant={sub.status === "Active" ? "default" : sub.status === "Canceled" ? "destructive" : "outline"}
                      className={sub.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                    >
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
