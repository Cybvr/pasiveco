'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAllUsers, type User } from '@/services/userService'

type DashboardStats = {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  verifiedUsers: number
  recentUsers: User[]
}

type PaystackBalance = {
  currency: string
  balance: number
}

const defaultStats: DashboardStats = {
  totalUsers: 0,
  activeUsers: 0,
  adminUsers: 0,
  verifiedUsers: 0,
  recentUsers: [],
}

function formatJoinedDate(user: User) {
  if (!user.createdAt?.toDate) return '—'
  return user.createdAt.toDate().toLocaleDateString()
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [paystackBalances, setPaystackBalances] = useState<PaystackBalance[]>([])
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [balanceError, setBalanceError] = useState('')

  const fetchPaystackBalance = async () => {
    setBalanceLoading(true)
    setBalanceError('')

    try {
      const response = await fetch('/api/admin/paystack-balance', { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Unable to fetch Paystack balance')
      }

      setPaystackBalances(Array.isArray(data.data) ? data.data : [])
    } catch (error: any) {
      console.error('Error fetching Paystack balance:', error)
      setBalanceError(error.message || 'Unable to fetch Paystack balance')
    } finally {
      setBalanceLoading(false)
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await getAllUsers()

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((user) => user.isActive).length,
          adminUsers: users.filter((user) => user.role === 'admin').length,
          verifiedUsers: users.filter((user) => user.emailVerified).length,
          recentUsers: users.slice(0, 6),
        })
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    fetchPaystackBalance()
  }, [])

  const statCards = useMemo(
    () => [
      { label: 'Total Users', value: stats.totalUsers },
      { label: 'Active Users', value: stats.activeUsers },
      { label: 'Admin Users', value: stats.adminUsers },
      { label: 'Verified Emails', value: stats.verifiedUsers },
    ],
    [stats]
  )

  const ngnBalance = paystackBalances.find((balance) => balance.currency === 'NGN')
  const primaryBalance = ngnBalance || paystackBalances[0]
  const formattedPaystackBalance = primaryBalance
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: primaryBalance.currency,
      }).format(primaryBalance.balance / 100)
    : '—'

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6 overflow-x-hidden">

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="space-y-1 pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold">{card.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardDescription>Paystack Balance</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {balanceLoading ? 'Loading...' : formattedPaystackBalance}
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={fetchPaystackBalance}
            disabled={balanceLoading}
          >
            <RefreshCw className={`h-4 w-4 ${balanceLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {balanceError ? (
            <p className="text-sm text-destructive">{balanceError}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {paystackBalances.map((balance) => (
                <Badge key={balance.currency} variant={balance.currency === 'NGN' ? 'secondary' : 'outline'}>
                  {balance.currency} {(balance.balance / 100).toLocaleString()}
                </Badge>
              ))}
              {!balanceLoading && paystackBalances.length === 0 && (
                <p className="text-sm text-muted-foreground">No Paystack balance returned.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
          <CardDescription>Latest accounts created on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentUsers.map((user) => (
                  <TableRow key={user.id ?? user.email}>
                    <TableCell className="font-medium">{user.displayName || 'Unknown'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role || 'user'}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'secondary' : 'outline'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatJoinedDate(user)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {stats.recentUsers.map((user) => (
              <div key={user.id ?? user.email} className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{user.displayName || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.isActive ? 'secondary' : 'outline'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="capitalize">{user.role || 'user'}</span>
                  <span>{formatJoinedDate(user)}</span>
                </div>
              </div>
            ))}
          </div>

          {!loading && stats.recentUsers.length === 0 && (
            <p className="text-sm text-muted-foreground">No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
