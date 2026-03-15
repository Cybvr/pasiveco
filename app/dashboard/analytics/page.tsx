"use client"

import React, { useState, useEffect } from 'react'
import { BarChart3, Download, Eye, MousePointer, TrendingUp, ExternalLink, Users, Globe, Clock, Monitor, Smartphone, Tablet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getUserAnalytics, getRecentEvents } from '@/services/analyticsService'
import { getUserVisitors } from '@/services/audienceService'
import { useAuth } from '@/hooks/useAuth'

function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState("7d")
  const [analyticsData, setAnalyticsData] = useState(null)
  const [recentEvents, setRecentEvents] = useState([])
  const [visitorData, setVisitorData] = useState(null)

  const { user } = useAuth()

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (user) {
        const data = await getUserAnalytics(user.uid, timeFilter)
        setAnalyticsData(data)
        const events = await getRecentEvents(user.uid)
        setRecentEvents(events)
        const visitors = await getUserVisitors(user.uid)
        setVisitorData(visitors)
      }
    }
    fetchAnalytics()
  }, [user, timeFilter])

  const timeFilters = [
    { key: "24h", label: "24h" },
    { key: "7d", label: "7d" },
    { key: "30d", label: "30d" },
    { key: "90d", label: "90d" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Monitor your link performance and engagement</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-muted p-1 rounded-lg">
            {timeFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={timeFilter === filter.key ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setTimeFilter(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-10 px-4 gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="pt-2">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {analyticsData?.analyticsStats?.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-lg font-semibold text-foreground mt-0.5">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-0.5">{stat.change}</p>
                  </div>
                  <div className="w-7 h-7 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 ml-2">
                    <stat.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Link Performance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Link Performance</CardTitle>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary/80">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {analyticsData?.linkPerformanceData?.map((link) => (
                    <div key={link.title} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b last:border-0">
                      <div className="mb-2 sm:mb-0 flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">{link.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-center">
                          <p className="text-foreground font-medium">{link.views.toLocaleString()}</p>
                          <p className="text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-foreground font-medium">{link.clicks.toLocaleString()}</p>
                          <p className="text-muted-foreground">Clicks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-primary font-medium">{link.rate}</p>
                          <p className="text-muted-foreground">Rate</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recentEvents?.map((activity, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground font-medium">{activity.action}</p>
                      {activity.link !== "-" && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.link}</p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="mt-4">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Views & Clicks Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-48 bg-muted/20 rounded border flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage