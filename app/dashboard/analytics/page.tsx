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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Analytics
          </h1>
          <p className="text-muted-foreground">Track your revenue, customers, and business growth</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-10 px-4 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:overflow-visible md:px-0 md:pb-0">
        <div className="flex gap-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Revenue', value: data?.totalRevenue || 0, color: 'text-primary' },
            { label: 'Total Customers', value: data?.customerCount || 0, color: 'text-foreground' },
            { label: 'Gifts & Support', value: data?.revenueBySource.gifts || 0, color: 'text-foreground' },
            { label: 'Bookings', value: data?.revenueBySource.bookings || 0, color: 'text-foreground' },
          ].map((stat, i) => (
            <Card key={i} className="min-w-[280px] snap-start border-primary/5 bg-background md:min-w-0">
              <CardContent className="p-6">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <div className={`text-3xl font-black mt-2 tracking-tighter ${stat.color}`}>
                  {typeof stat.value === 'number' && stat.label !== 'Total Customers' ? formatAmount(stat.value) : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Chart Section */}
      <Card className="border-primary/5 shadow-2xl shadow-primary/5">
        <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 bg-muted/20 px-6 py-4">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-tight">Revenue </CardTitle>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Products</div>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Bookings</div>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Gifts</div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6 pr-6">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTimeline || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                  tick={{ fill: '#888888', fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={(val) => `₦${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
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

      <div className="grid lg:grid-cols-7 gap-6">
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
                  <div key={item.label} className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                      <span className="font-black">{formatAmount(item.value)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
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
            <div className="divide-y divide-primary/5">
              {data?.recentActivity.length ? (
                data.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground truncate">{activity.title}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1">
                        {activity.user} • {activity.time?.toDate ? activity.time.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">{formatAmount(activity.amount)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">No activity found</p>
                </div>
              )}
            </div>

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
