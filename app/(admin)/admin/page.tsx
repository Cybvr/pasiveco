'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Clear overview of user activity and account health.
        </p>
      </header>

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
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
          <CardDescription>Latest accounts created on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden md:block">
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
