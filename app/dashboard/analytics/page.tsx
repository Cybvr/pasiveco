"use client"

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  Download,
  Wallet,
  Users,
  Calendar,
  Gift,
  ArrowUpRight,
  ShoppingBag,
  CircleDollarSign,
  TrendingUp,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from '@/hooks/useAuth'
import { getBusinessOverview, BusinessOverview } from '@/services/businessService'
import Link from 'next/link'

function AnalyticsPage() {
  const [data, setData] = useState<BusinessOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        setLoading(true)
        try {
          const overview = await getBusinessOverview(user.uid)
          setData(overview)
        } catch (error) {
          console.error("Error loading business overview:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [user])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-primary/20 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm py-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground font-medium">{entry.name}:</span>
              <span className="font-bold text-foreground">{formatAmount(entry.value)}</span>
            </div>
          ))}
          <div className="border-t border-primary/10 mt-2 pt-2 flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase text-primary">Total:</span>
            <span className="text-sm font-black text-primary">{formatAmount(payload.reduce((s: number, p: any) => s + p.value, 0))}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Aggregating your business data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track your revenue, customers, and business growth</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" size="sm" className="w-full md:w-auto h-10 px-4 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: data?.totalRevenue || 0, color: 'text-primary' },
          { label: 'Total Customers', value: data?.customerCount || 0, color: 'text-foreground' },
          { label: 'Gifts & Support', value: data?.revenueBySource.gifts || 0, color: 'text-foreground' },
          { label: 'Bookings', value: data?.revenueBySource.bookings || 0, color: 'text-foreground' },
        ].map((stat, i) => (
          <Card key={i} className="border-primary/5 bg-background overflow-hidden">
            <CardContent className="p-3 sm:p-6">
              <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">{stat.label}</p>
              <div className={`text-xl sm:text-3xl font-black mt-1 sm:mt-2 tracking-tighter ${stat.color}`}>
                {stat.label === 'Total Customers' ? stat.value : formatAmount(stat.value)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart Section */}
      <Card className="border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden w-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary/5 bg-muted/20 px-4 sm:px-6 py-4">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-tight">Revenue</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Products</div>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Bookings</div>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Gifts</div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6 pr-2 sm:pr-6 pb-2">
          <div className="h-[250px] sm:h-[350px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTimeline || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGifts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888888', fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888888', fontSize: 9, fontWeight: 'bold' }}
                  tickFormatter={(val) => `₦${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2 }} />
                <Area
                  type="monotone"
                  dataKey="products"
                  name="Products"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProducts)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  stroke="#f97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="gifts"
                  name="Gifts"
                  stroke="#d946ef"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGifts)"
                  stackId="1"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Revenue Breakdown */}
        <Card className="lg:col-span-3 border-primary/5 bg-muted/10">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-tight">Revenue Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { label: 'Products', value: data?.revenueBySource.products || 0, color: 'bg-primary' },
                { label: 'Bookings', value: data?.revenueBySource.bookings || 0, color: 'bg-orange-500' },
                { label: 'Gifts', value: data?.revenueBySource.gifts || 0, color: 'bg-purple-500' },
              ].map((item) => {
                const percentage = data?.totalRevenue ? (item.value / data.totalRevenue) * 100 : 0
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-black uppercase tracking-widest text-muted-foreground truncate mr-2">{item.label}</span>
                      <span className="font-black whitespace-nowrap">{formatAmount(item.value)}</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-primary/5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Average Order Value</p>
              <p className="text-2xl font-black mt-1 tracking-tighter">
                {formatAmount(data?.totalRevenue && data?.customerCount ? data.totalRevenue / data.customerCount : 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Activity Feed */}
        <Card className="lg:col-span-4 border-primary/5">
          <CardHeader className="border-b border-primary/5">
            <CardTitle className="text-sm font-black uppercase tracking-tight">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-primary/5">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Event</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">User</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.recentActivity.length ? (
                  data.recentActivity.map((activity) => (
                    <TableRow key={activity.id} className="border-primary/5 hover:bg-muted/30 transition-colors">
                      <TableCell className="py-3">
                        <p className="text-xs font-black text-foreground truncate max-w-[120px] sm:max-w-none">{activity.title}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight sm:hidden mt-0.5">
                          {activity.time?.toDate ? activity.time.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{activity.user}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-xs font-black">{formatAmount(activity.amount)}</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-20">
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No activity found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="p-4 border-t border-primary/5">
              <Button variant="ghost" className="w-full h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5" asChild>
                <Link href="/dashboard/earnings">
                  View Full Transaction Log
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage
