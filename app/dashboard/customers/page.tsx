"use client"
 
import { Search, Filter, Download, User, Mail, Phone, Calendar, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react"
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
import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getSellerTransactions } from "@/services/transactionsService"
import { Transaction } from "@/types/transaction"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrency } from "@/context/CurrencyContext"
import { formatCurrency, EXCHANGE_RATE } from "@/utils/currency"
 
interface Customer {
  email: string;
  name: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: any;
}
 
export default function CustomersPage() {
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer; direction: 'asc' | 'desc' } | null>({ key: 'lastOrderDate', direction: 'desc' })
 
  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return
      try {
        const data = await getSellerTransactions(user.uid)
        setTransactions(data)
      } catch (err) {
        console.error("Error loading customers:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])
 
  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>()
 
    transactions.forEach(tx => {
      const email = tx.customerEmail.toLowerCase()
      const existing = customerMap.get(email)
 
      if (existing) {
        existing.totalSpent += tx.amount
        existing.orderCount += 1
        if (tx.createdAt.toDate() > existing.lastOrderDate.toDate()) {
          existing.lastOrderDate = tx.createdAt
        }
      } else {
        customerMap.set(email, {
          email: tx.customerEmail,
          name: tx.customerName,
          phone: tx.customerPhone || '—',
          totalSpent: tx.amount,
          orderCount: 1,
          lastOrderDate: tx.createdAt
        })
      }
    })
 
    return Array.from(customerMap.values())
  }, [transactions])
 
  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers]
 
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.email.toLowerCase().includes(s) || 
        c.phone.toLowerCase().includes(s)
      )
    }
 
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]
 
        if (sortConfig.key === 'lastOrderDate') {
          aValue = (aValue as any).toDate().getTime()
          bValue = (bValue as any).toDate().getTime()
        }
 
        if (aValue === bValue) return 0
        if (sortConfig.direction === 'asc') {
          return aValue < bValue ? -1 : 1
        } else {
          return aValue > bValue ? -1 : 1
        }
      })
    }
 
    return result
  }, [customers, search, sortConfig])
 
  const formatAmount = (amount: number) => {
    let displayAmount = amount
    if (currency === 'NGN') {
      displayAmount = amount * EXCHANGE_RATE
    }
    return formatCurrency(displayAmount, currency)
  }
 
  const handleSort = (key: keyof Customer) => {
    let direction: 'asc' | 'desc' = 'desc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'
    }
    setSortConfig({ key, direction })
  }
 
  const SortIcon = ({ columnKey }: { columnKey: keyof Customer }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />
    return sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4 text-primary" /> : <ChevronDown className="ml-2 h-4 w-4 text-primary" />
  }
 
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage and analyze your customer base.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="h-4 w-4" />
            Export List
          </Button>
        </div>
      </div>
 
      <Card className="border-none shadow-sm">
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, or phone..." 
                className="pl-9 h-11 bg-muted/20 border-none focus-visible:ring-1" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-11 gap-2 whitespace-nowrap px-4 border-dashed">
              <Filter className="h-4 w-4 opacity-50" />
              More Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/10 border-b">
                  <TableHead className="cursor-pointer h-12" onClick={() => handleSort('name')}>
                    <div className="flex items-center">Customer <SortIcon columnKey="name" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer h-12" onClick={() => handleSort('email')}>
                    <div className="flex items-center">Email <SortIcon columnKey="email" /></div>
                  </TableHead>
                  <TableHead className="h-12">Phone</TableHead>
                  <TableHead className="cursor-pointer h-12 text-center" onClick={() => handleSort('orderCount')}>
                    <div className="flex items-center justify-center">Orders <SortIcon columnKey="orderCount" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer h-12 text-right" onClick={() => handleSort('totalSpent')}>
                    <div className="flex items-center justify-end">Total Spent <SortIcon columnKey="totalSpent" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer h-12 text-right" onClick={() => handleSort('lastOrderDate')}>
                    <div className="flex items-center justify-end">Last Order <SortIcon columnKey="lastOrderDate" /></div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-sm text-muted-foreground">Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No customers found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedCustomers.map((customer, idx) => (
                    <TableRow key={customer.email} className={idx % 2 === 0 ? "bg-transparent" : "bg-muted/5"}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs">
                              {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-sm">{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium">{customer.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{customer.phone}</TableCell>
                      <TableCell className="text-center font-mono text-xs">{customer.orderCount}</TableCell>
                      <TableCell className="text-right font-bold text-sm">{formatAmount(customer.totalSpent)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-medium">
                        {customer.lastOrderDate?.toDate().toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
