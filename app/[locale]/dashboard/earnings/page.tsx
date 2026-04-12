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
import { getSellerTransactions, getAffiliateTransactions } from "@/services/transactionsService"
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

export default function EarningsPage() {
  const ITEMS_PER_PAGE = 10
  const router = useRouter()
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [salesTransactions, setSalesTransactions] = useState<Transaction[]>([])
  const [affiliateTransactions, setAffiliateTransactions] = useState<Transaction[]>([])
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
      if (!user?.uid) return
      setLoading(true)
      try {
        const [sales, affiliate] = await Promise.all([
          getSellerTransactions(user.uid),
          getAffiliateTransactions(user.uid),
        ])
        setSalesTransactions(sales)
        setAffiliateTransactions(affiliate)
      } catch (err: any) {
        console.error("Error loading transactions:", err)
        setError(err.message || "Failed to load transactions. Check your Firestore indexes.")
      } finally {
        setLoading(false)
      }
    }
    void loadTransactions()
  }, [user])

  const transactions = useMemo(
    () => [...salesTransactions, ...affiliateTransactions],
    [affiliateTransactions, salesTransactions]
  )

  const formatEarnings = (amount: number | string, txCurrency?: string) => {
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

  const getEarningValue = (tx: Transaction) => tx.yourProfit || tx.amount || 0

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

    const totalEarnings = successfulTransactions.reduce(
      (sum, tx) => sum + convertAmount(getEarningValue(tx), tx.currency),
      0
    )
    const pendingAmount = successfulTransactions
      .filter((tx) => !tx.payoutDate)
      .reduce((sum, tx) => sum + convertAmount(getEarningValue(tx), tx.currency), 0)
    const totalOrders = successfulTransactions.length

    if (search) {
      const s = search.toLowerCase()
      result = result.filter((tx) =>
        tx.productName?.toLowerCase().includes(s) ||
        tx.customerName?.toLowerCase().includes(s) ||
        tx.customerEmail?.toLowerCase().includes(s) ||
        tx.reference?.toLowerCase().includes(s)
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
        { title: "Total Earnings", value: totalEarnings },
        { title: "Pending Payout", value: pendingAmount },
        { title: "Net Sales", value: totalOrders.toString() },
      ],
      filteredAndSortedTransactions: result,
    }
  }, [transactions, search, sortConfig, statusFilter])

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
                {stat.title === "Net Sales" ? stat.value : formatEarnings(stat.value as number, currency)}
              </div>
              <div className="mt-1">
                <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
                {idx === 0 && (
                  <button
                    type="button"
                    className="text-xs text-foreground/80 underline underline-offset-4 hover:text-foreground"
                    onClick={() => router.push("/dashboard/payouts")}
                  >
                    Payout
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tabular-nums">Earnings</CardTitle>
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
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("customerName")}>
                    <div className="flex items-center">Full Name <SortIcon columnKey="customerName" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("customerEmail")}>
                    <div className="flex items-center">Email <SortIcon columnKey="customerEmail" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("customerPhone")}>
                    <div className="flex items-center">Phone <SortIcon columnKey="customerPhone" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("createdAt")}>
                    <div className="flex items-center">Transaction Date <SortIcon columnKey="createdAt" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12 text-right" onClick={() => handleSort("amount")}>
                    <div className="flex items-center justify-end">Total <SortIcon columnKey="amount" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("affiliate")}>
                    <div className="flex items-center">Affiliate <SortIcon columnKey="affiliate" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer whitespace-nowrap h-12" onClick={() => handleSort("payoutDate")}>
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
                  paginatedTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
                      onClick={() => router.push(`/dashboard/earnings/${tx.id}`)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">{tx.productName}</TableCell>
                      <TableCell className="whitespace-nowrap">{tx.customerName}</TableCell>
                      <TableCell className="whitespace-nowrap">{tx.customerEmail}</TableCell>
                      <TableCell className="whitespace-nowrap">{tx.customerPhone || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.createdAt instanceof Object && "toDate" in tx.createdAt ? tx.createdAt.toDate().toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap font-semibold">
                        {formatEarnings(getEarningValue(tx), tx.currency)}
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
