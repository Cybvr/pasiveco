"use client"

import React, { useState, useEffect } from 'react'
import { Users, TrendingUp, Globe, Clock, Monitor, Smartphone, Tablet, MapPin, Filter, MoreHorizontal, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserVisitors, getUserAudienceSegments, getAudienceInsights } from '@/services/audienceService'
import { useAuth } from '@/hooks/useAuth'

function AudiencePage() {
  const [timeFilter, setTimeFilter] = useState("7d")
  const [audienceStats, setAudienceStats] = useState([]);
  const [topCountriesData, setTopCountriesData] = useState([]);
  const [topCitiesData, setTopCitiesData] = useState([]);
  const [devicesData, setDevicesData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchAudienceData = async () => {
        try {
          const [visitors, segments, insights] = await Promise.all([
            getUserVisitors(user.uid, timeFilter),
            getUserAudienceSegments(user.uid),
            getAudienceInsights(user.uid, timeFilter)
          ]);

          setAudienceStats([
            { title: "Visitors", value: visitors.totalVisitors.toLocaleString(), change: `${visitors.change}%`, icon: Users },
            { title: "New Visitors", value: visitors.newVisitors.toLocaleString(), change: `${visitors.newVisitorsChange}%`, icon: TrendingUp },
            { title: "Top Countries", value: Object.keys(segments.countries).length, change: "", icon: Globe },
            { title: "Engagement Rate", value: `${insights.engagementRate}%`, change: `${insights.engagementRateChange}%`, icon: Clock },
          ]);

          setTopCountriesData(Object.entries(segments.countries).map(([country, data]) => ({
            country: country,
            flag: "🇺🇸", // Placeholder, would ideally fetch country flags
            visits: data.visits,
            percentage: ((data.visits / visitors.totalVisitors) * 100).toFixed(2)
          })));

          setTopCitiesData(Object.entries(segments.cities).map(([city, data]) => ({
            city: city,
            country: "USA", // Placeholder, would ideally fetch country based on city
            visits: data.visits
          })));

          setDevicesData(Object.entries(insights.devices).map(([device, data]) => ({
            device: device.charAt(0).toUpperCase() + device.slice(1),
            icon: device === "desktop" ? Monitor : device === "mobile" ? Smartphone : Tablet,
            percentage: data.percentage,
            visits: data.visits
          })));

        } catch (error) {
          console.error("Error fetching audience data:", error);
          // Handle error state appropriately
        }
      };
      fetchAudienceData();
    }
  }, [user, timeFilter]);

  const timeFilters = [
    { key: "7d", label: "7d" },
    { key: "30d", label: "30d" },
    { key: "90d", label: "90d" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Audience</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Track your visitors and engagement metrics</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {timeFilters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={timeFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setTimeFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {audienceStats.map((stat) => (
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

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Top Countries */}
          <Card>
            <CardHeader className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Top Countries</CardTitle>
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {topCountriesData.map((country) => (
                  <div key={country.country} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-sm">{country.flag}</span>
                      <span className="text-xs text-foreground truncate">{country.country}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{country.visits.toLocaleString()}</span>
                      <div className="w-10 text-right">
                        <span className="text-xs text-foreground font-semibold">{country.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Cities */}
          <Card>
            <CardHeader className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Top Cities</CardTitle>
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {topCitiesData.map((city) => (
                  <div key={`${city.city}-${city.country}`} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs text-foreground block truncate">{city.city}</span>
                        <p className="text-xs text-muted-foreground truncate">{city.country}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{city.visits.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Breakdown */}
        <Card>
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-sm font-semibold">Device Types</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {devicesData.map((device) => (
                <div key={device.device} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <device.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-foreground">{device.device}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="w-full sm:w-24 bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-xs text-foreground font-semibold">{device.percentage}%</span>
                      <p className="text-xs text-muted-foreground">{device.visits.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AudiencePage