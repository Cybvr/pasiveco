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
import { useCurrency } from "@/context/CurrencyContext"
import { formatCurrency, EXCHANGE_RATE } from "@/utils/currency"
import { getCustomerTransactions } from "@/services/transactionsService"
import { useAuth } from "@/hooks/useAuth"
import { Transaction } from "@/types/transaction"
import { Badge } from "@/components/ui/badge"
import DashboardPagination from "@/components/dashboard/DashboardPagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PurchasesPage() {
  const ITEMS_PER_PAGE = 10
  const router = useRouter()
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: "asc" | "desc" } | null>({
    key: "createdAt",
    direction: "desc",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTransactions() {
      if (!user?.email) return
      setLoading(true)
      try {
        const customerTransactions = await getCustomerTransactions(user.email)
        setTransactions(customerTransactions)
      } catch (err: any) {
        console.error("Error loading customer transactions:", err)
        setError(err.message || "Failed to load purchases. Check your Firestore indexes.")
      } finally {
        setLoading(false)
      }
    }
    void loadTransactions()
  }, [user])

  const formatAmount = (amount: number | string, txCurrency?: string) => {
    if (typeof amount === "string") return amount

    const sourceCurrency = (txCurrency || "NGN").toUpperCase()
    const displayCurrency = currency.toUpperCase()

    let displayAmount = amount

    if (sourceCurrency === "NGN" && displayCurrency === "USD") {
      displayAmount = amount / EXCHANGE_RATE
    } else if (sourceCurrency === "USD" && displayCurrency === "NGN") {
      displayAmount = amount * EXCHANGE_RATE
    }

    return formatCurrency(displayAmount, displayCurrency as any)
  }

  const convertAmount = (amountValue: number, sourceCurrency?: string) => {
    const sourceCurrencyCode = (sourceCurrency || "NGN").toUpperCase()
    const displayCurrency = currency.toUpperCase()

    if (sourceCurrencyCode === displayCurrency) return amountValue
    if (sourceCurrencyCode === "NGN" && displayCurrency === "USD") return amountValue / EXCHANGE_RATE
    if (sourceCurrencyCode === "USD" && displayCurrency === "NGN") return amountValue * EXCHANGE_RATE
    return amountValue
  }

  const handleSort = (key: keyof Transaction) => {
    let direction: "asc" | "desc" = "desc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc"
    }
    setSortConfig({ key, direction })
  }

  const { stats, filteredAndSortedTransactions } = useMemo(() => {
    let result = [...transactions]
    const successfulTransactions = transactions.filter((tx) => tx.status === "success")

    const totalSpent = successfulTransactions.reduce(
      (sum, tx) => sum + convertAmount(tx.amount || 0, tx.currency),
      0
    )
    const pendingPayments = transactions
      .filter((tx) => tx.status === "pending")
      .reduce((sum, tx) => sum + convertAmount(tx.amount || 0, tx.currency), 0)
    const totalOrders = successfulTransactions.length

    if (search) {
      const s = search.toLowerCase()
      result = result.filter((tx) =>
        tx.productName?.toLowerCase().includes(s) ||
        tx.reference?.toLowerCase().includes(s) ||
        tx.sellerId?.toLowerCase().includes(s)
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((tx) => tx.status === statusFilter)
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue === bValue) return 0

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (sortConfig.direction === "asc") {
          return aValue < bValue ? -1 : 1
        } else {
          return aValue > bValue ? -1 : 1
        }
      })
    }

    return {
      stats: [
        { title: "Total Spent", value: totalSpent },
        { title: "Pending Payments", value: pendingPayments },
        { title: "Orders", value: totalOrders.toString() },
      ],
      filteredAndSortedTransactions: result,
    }
  }, [transactions, search, sortConfig, statusFilter, currency])

  const SortIcon = ({ columnKey }: { columnKey: keyof Transaction }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    return sortConfig.direction === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, sortConfig, transactions.length])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE))
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {stats.map((stat, idx) => (
          <Card key={idx} className={`border-none shadow-sm ${idx === 0 ? "bg-muted/30" : ""}`}>
            <CardContent className="p-3 md:p-4">
              <div className="text-lg md:text-2xl font-bold leading-tight break-words">
                {stat.title === "Orders" ? stat.value : formatAmount(stat.value as number, currency)}
              </div>
              <div className="mt-1">
                <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tabular-nums">Purchases</CardTitle>
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
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="h-10 gap-2 whitespace-nowrap">
                <Calendar className="h-4 w-4 opacity-50" />
                Date Range
              </Button>
              <Button variant="outline" className="h-10 gap-2 whitespace-nowrap">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <p className="p-4 text-sm text-destructive border-b">{error}</p>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/20">
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("productName")}>
                    <div className="flex items-center">Product(s) <SortIcon columnKey="productName" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("reference")}>
                    <div className="flex items-center">Reference <SortIcon columnKey="reference" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("status")}>
                    <div className="flex items-center">Status <SortIcon columnKey="status" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("createdAt")}>
                    <div className="flex items-center">Transaction Date <SortIcon columnKey="createdAt" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12 text-right" onClick={() => handleSort("amount")}>
                    <div className="flex items-center justify-end">Total <SortIcon columnKey="amount" /></div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Loading purchases...</TableCell>
                  </TableRow>
                ) : filteredAndSortedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No purchases found.</TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
                      onClick={() => router.push(`/dashboard/purchases/${tx.id}`)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">{tx.productName}</TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">{tx.reference}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={tx.status === "success" ? "default" : tx.status === "pending" ? "secondary" : "destructive"}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.createdAt instanceof Object && "toDate" in tx.createdAt ? tx.createdAt.toDate().toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap font-semibold">
                        {formatAmount(tx.amount, tx.currency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DashboardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
