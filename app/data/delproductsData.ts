import { Package, FileText, Video, Headphones, Image, Calendar, Star, Heart, Gift, Zap, Users, TrendingUp, Eye, MousePointer, ExternalLink, Globe, MapPin, Clock, Smartphone, Monitor, Tablet, Gamepad2, Target, Settings, Cpu } from "lucide-react"

export interface Product {
  id: number
  name: string
  type: string
  price: string
  description: string
  icon: React.ComponentType<any>
  active: boolean
  image?: string
  url?: string
}

export const productsData: Product[] = [
  {
    id: 1,
    name: "Apex Legends Aim Training Course",
    type: "Course",
    price: "$79",
    description: "Master recoil patterns and improve accuracy for Ranked Apex gameplay",
    icon: Target,
    active: true,
    image: "/images/templates/featuredImage/apex-training.jpg",
    url: "https://coaching.gamingwithpro.com/apex-aim-training"
  },
  {
    id: 2,
    name: "OBS Streaming Setup Templates",
    type: "Digital Product",
    price: "$39",
    description: "Pre-configured OBS scenes, overlays, and alerts for FPS streamers",
    icon: Settings,
    active: true,
    image: "/images/templates/featuredImage/obs-templates.jpg",
    url: "https://shop.gamingwithpro.com/obs-templates"
  },
  {
    id: 3,
    name: "1:1 Valorant Coaching Session",
    type: "Service",
    price: "$85/hr",
    description: "Personal coaching to climb from Gold to Diamond rank",
    icon: Calendar,
    active: true,
    image: "/images/templates/featuredImage/valorant-coaching.jpg",
    url: "https://calendly.com/gamingwithpro/valorant-coaching"
  },
  {
    id: 4,
    name: "Gaming Chair Ergonomics Guide",
    type: "Digital Guide",
    price: "$19",
    description: "Prevent wrist pain and improve posture during 8+ hour gaming sessions",
    icon: Heart,
    active: true,
    image: "/images/templates/featuredImage/ergonomics.jpg",
    url: "https://guides.gamingwithpro.com/ergonomics"
  },
  {
    id: 5,
    name: "PC Build Guide: 240Hz Gaming",
    type: "Video Content",
    price: "$49",
    description: "Step-by-step build tutorial for competitive FPS at 240Hz/1080p",
    icon: Cpu,
    active: true,
    url: "https://courses.gamingwithpro.com/pc-builds"
  },
  {
    id: 6,
    name: "Stream Highlight Templates",
    type: "Design Pack",
    price: "$25",
    description: "YouTube thumbnail templates and animated overlays for gaming clips",
    icon: Image,
    active: true,
    url: "https://shop.gamingwithpro.com/highlight-templates"
  },
  {
    id: 7,
    name: "Elite Gaming Community",
    type: "Subscription",
    price: "$15/mo",
    description: "Private Discord with weekly scrimmages and pro player AMAs",
    icon: Users,
    active: false,
    url: "https://community.gamingwithpro.com/elite"
  },
  {
    id: 8,
    name: "Mouse Sensitivity Calculator",
    type: "Tool",
    price: "$12",
    description: "Excel tool to convert sensitivity across 15+ FPS games perfectly",
    icon: Gamepad2,
    active: true,
    url: "https://tools.gamingwithpro.com/sensitivity-calc"
  }
]

// Analytics Data
export interface AnalyticsStats {
  title: string
  value: string
  change: string
  icon: React.ComponentType<any>
}

export const analyticsStats: AnalyticsStats[] = [
  { title: "Stream Views", value: "127,439", change: "+23.7%", icon: Eye },
  { title: "Link Clicks", value: "38,942", change: "+18.4%", icon: MousePointer },
  { title: "Click Rate", value: "30.5%", change: "+4.2%", icon: TrendingUp },
  { title: "Revenue Links", value: "8", change: "+2", icon: ExternalLink }
]

export interface LinkPerformance {
  title: string
  url: string
  views: number
  clicks: number
  rate: string
}

export const linkPerformanceData: LinkPerformance[] = [
  { title: "Valorant Coaching", url: "coaching.com/valorant", views: 12847, clicks: 4892, rate: "38.1%" },
  { title: "Gaming Setup Guide", url: "setup.gamingwithpro.com", views: 18293, clicks: 6247, rate: "34.2%" },
  { title: "Twitch Channel", url: "twitch.tv/gamingwithpro", views: 23947, clicks: 7821, rate: "32.7%" },
  { title: "YouTube Highlights", url: "youtube.com/highlights", views: 15672, clicks: 4639, rate: "29.6%" },
  { title: "Discord Community", url: "discord.gg/progamer95", views: 9834, clicks: 2847, rate: "28.9%" }
]

export interface RecentActivity {
  action: string
  link: string
  time: string
}

export const recentActivityData: RecentActivity[] = [
  { action: "Coaching booked", link: "Valorant Coaching", time: "3 minutes ago" },
  { action: "Stream followed", link: "-", time: "7 minutes ago" },
  { action: "Template purchased", link: "OBS Templates", time: "12 minutes ago" },
  { action: "Guide downloaded", link: "Ergonomics Guide", time: "18 minutes ago" },
  { action: "Discord joined", link: "Gaming Community", time: "24 minutes ago" }
]

// Audience Data
export interface AudienceStats {
  title: string
  value: string
  change: string
  icon: React.ComponentType<any>
}

export const audienceStats: AudienceStats[] = [
  { title: "Stream Followers", value: "47,293", change: "+15.8%", icon: Users },
  { title: "Unique Viewers", value: "28,947", change: "+12.3%", icon: TrendingUp },
  { title: "Countries", value: "62", change: "+5", icon: Globe },
  { title: "Avg. Watch Time", value: "34m 12s", change: "+8m", icon: Clock }
]

export interface CountryData {
  country: string
  visits: number
  percentage: number
  flag: string
}

export const topCountriesData: CountryData[] = [
  { country: "United States", visits: 18947, percentage: 40, flag: "🇺🇸" },
  { country: "Germany", visits: 6421, percentage: 14, flag: "🇩🇪" },
  { country: "United Kingdom", visits: 4756, percentage: 10, flag: "🇬🇧" },
  { country: "Canada", visits: 3834, percentage: 8, flag: "🇨🇦" },
  { country: "South Korea", visits: 2899, percentage: 6, flag: "🇰🇷" }
]

export interface CityData {
  city: string
  country: string
  visits: number
}

export const topCitiesData: CityData[] = [
  { city: "Los Angeles", country: "United States", visits: 4847 },
  { city: "Berlin", country: "Germany", visits: 2923 },
  { city: "Toronto", country: "Canada", visits: 2456 },
  { city: "London", country: "United Kingdom", visits: 1834 },
  { city: "Seoul", country: "South Korea", visits: 1687 }
]

export interface DeviceData {
  device: string
  visits: number
  percentage: number
  icon: React.ComponentType<any>
}

export const devicesData: DeviceData[] = [
  { device: "Desktop", visits: 33462, percentage: 71, icon: Monitor },
  { device: "Mobile", visits: 11854, percentage: 25, icon: Smartphone },
  { device: "Tablet", visits: 1889, percentage: 4, icon: Tablet }
]