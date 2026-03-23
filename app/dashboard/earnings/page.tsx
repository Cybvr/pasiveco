"use client"
 
import { Search, ChevronDown, ChevronUp, ArrowUpDown, Filter, Download, Calendar } from "lucide-react"
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
import { useRouter } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import { walletStats } from "@/lib/wallet"
import { useCurrency } from "@/context/CurrencyContext"
import { formatCurrency, EXCHANGE_RATE } from "@/utils/currency"
import { getSellerTransactions } from "@/services/transactionsService"
import { useAuth } from "@/hooks/useAuth"
import { Transaction } from "@/types/transaction"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
 
export default function EarningsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>({ key: 'createdAt', direction: 'desc' })
 
  useEffect(() => {
    async function loadTransactions() {
      if (!user?.uid) return
      try {
        const data = await getSellerTransactions(user.uid)
        setTransactions(data)
      } catch (err) {
        console.error("Error loading transactions:", err)
      } finally {
        setLoading(false)
      }
    }
    loadTransactions()
  }, [user])
 
  const formatEarnings = (amount: number | string) => {
    if (typeof amount === 'string') return amount
 
    let displayAmount = amount
    if (currency === 'NGN') {
      displayAmount = amount * EXCHANGE_RATE
    }
 
    return formatCurrency(displayAmount, currency)
  }
 
  const handleSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'desc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'
    }
    setSortConfig({ key, direction })
  }
 
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions]
    
    // Search
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(tx => 
        tx.productName?.toLowerCase().includes(s) ||
        tx.customerName?.toLowerCase().includes(s) ||
        tx.customerEmail?.toLowerCase().includes(s) ||
        tx.reference?.toLowerCase().includes(s)
      )
    }

    // Status Filter
    if (statusFilter !== "all") {
      result = result.filter(tx => tx.status === statusFilter)
    }
 
    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
 
        if (aValue === bValue) return 0
        
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
 
        if (sortConfig.direction === 'asc') {
          return aValue < bValue ? -1 : 1
        } else {
          return aValue > bValue ? -1 : 1
        }
      })
    }
 
    return result
  }, [transactions, search, sortConfig, statusFilter])
 
  const SortIcon = ({ columnKey }: { columnKey: keyof Transaction }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    return sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }
 
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {walletStats.map((stat, idx) => (
          <Card key={idx} className={`border-none shadow-sm ${idx === 0 ? "bg-muted/30" : ""}`}>
            <CardContent className="p-3 md:p-4">
              <div className="text-lg md:text-2xl font-bold leading-tight break-words">
                {formatEarnings(stat.value)}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>
 
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tabular-nums">Earnings</CardTitle>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-8 h-10" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-10">
                  <Filter className="h-4 w-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="h-10 gap-2 whitespace-nowrap">
                <Calendar className="h-4 w-4 opacity-50" />
                Date Range
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/20">
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort('productName')}>
                    <div className="flex items-center">Product(s) <SortIcon columnKey="productName" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort('customerName')}>
                    <div className="flex items-center">Customer Fullname <SortIcon columnKey="customerName" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort('customerEmail')}>
                    <div className="flex items-center">Customer Email <SortIcon columnKey="customerEmail" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort('customerPhone')}>
                    <div className="flex items-center">Customer Mobile <SortIcon columnKey="customerPhone" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center">Transaction Date <SortIcon columnKey="createdAt" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12 text-right" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end">Total <SortIcon columnKey="amount" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort('affiliate')}>
                    <div className="flex items-center">Affiliate <SortIcon columnKey="affiliate" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort('payoutDate')}>
                    <div className="flex items-center">Payout Date <SortIcon columnKey="payoutDate" /></div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">Loading transactions...</TableCell>
                  </TableRow>
                ) : filteredAndSortedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
                      onClick={() => router.push(`/dashboard/earnings/${tx.id}`)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">{tx.productName}</TableCell>
                      <TableCell className="whitespace-nowrap">{tx.customerName}</TableCell>
                      <TableCell className="whitespace-nowrap">{tx.customerEmail}</TableCell>
                      <TableCell className="whitespace-nowrap">{tx.customerPhone || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.createdAt instanceof Object && 'toDate' in tx.createdAt ? tx.createdAt.toDate().toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap font-semibold">
                        {formatEarnings(tx.amount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.affiliate ? (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none">{tx.affiliate}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Direct</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.payoutDate ? (
                          <Badge variant="outline">{tx.payoutDate.toDate().toLocaleDateString()}</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none text-[10px]">Processing</Badge>
                        )}
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
