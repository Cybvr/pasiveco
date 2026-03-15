export interface SocialLink {
  id: string
  platform: string
  url: string
  thumbnail: string
  active: boolean
}

export interface CustomLink {
  id: string
  title: string
  description?: string
  url: string
  thumbnail: string // thumbnail URL
  active: boolean
  clicks: number
  ctr: number
}

export interface ProfileData {
  username: string
  displayName: string
  bio: string
  profilePicture: string | null
  slug: string
  socialLinks: SocialLink[]
}

export interface LinkAnalytics {
  id: string
  title: string
  clicks: number
  ctr: number
  revenue?: string
}

export const profileData: ProfileData = {
  username: "@gamingwithpro",
  displayName: "ProGamer95", 
  bio: "🎮 Variety Streamer | FPS & RPG Expert | Live Mon-Fri 7PM EST | Building the ultimate gaming community!",
  profilePicture: null,
  slug: "gamingwithpro",
  socialLinks: [
    {
      id: "twitch",
      platform: "Twitch",
      url: "https://twitch.tv/gamingwithpro",
      thumbnail: "/images/pages/twitch.svg",
      active: true
    },
    {
      id: "youtube", 
      platform: "YouTube",
      url: "https://youtube.com/@gamingwithpro",
      thumbnail: "/images/pages/youtube.svg",
      active: true
    },
    {
      id: "discord",
      platform: "Discord",
      url: "https://discord.gg/progamer95", 
      thumbnail: "/images/pages/discord.svg",
      active: true
    },
    {
      id: "twitter",
      platform: "Twitter",
      url: "https://twitter.com/gamingwithpro", 
      thumbnail: "/images/pages/twitter.svg",
      active: true
    },
    {
      id: "tiktok",
      platform: "TikTok",
      url: "https://tiktok.com/@gamingwithpro", 
      thumbnail: "/images/pages/tik-tok.svg",
      active: false
    }
  ]
}

export const customLinksData: CustomLink[] = [
  {
    id: "1",
    title: "Gaming Setup & Gear",
    description: "My complete streaming setup and recommended gear",
    url: "https://gamingwithpro.com/setup",
    thumbnail: "/images/pages/website.svg",
    active: true,
    clicks: 342,
    ctr: 18.7
  },
  {
    id: "2", 
    title: "Support the Stream",
    description: "Buy me a coffee or energy drink ⚡",
    url: "https://ko-fi.com/gamingwithpro",
    thumbnail: "/images/pages/website.svg",
    active: true,
    clicks: 189,
    ctr: 14.2
  },
  {
    id: "3",
    title: "Gaming Coaching",
    description: "1-on-1 coaching sessions for FPS improvement",
    url: "https://calendly.com/gamingwithpro/coaching",
    thumbnail: "/images/pages/website.svg",
    active: true,
    clicks: 94,
    ctr: 22.1
  },
  {
    id: "4",
    title: "Merchandise Store",
    description: "Official ProGamer95 merch and apparel",
    url: "https://shop.gamingwithpro.com",
    thumbnail: "/images/pages/website.svg",
    active: true,
    clicks: 156,
    ctr: 11.8
  },
  {
    id: "5",
    title: "Stream Highlights",
    description: "Best clips and funny moments compilation",
    url: "https://youtube.com/playlist?list=highlights",
    thumbnail: "/images/pages/youtube.svg",
    active: true,
    clicks: 278,
    ctr: 16.4
  },
  {
    id: "6",
    title: "Gaming Blog",
    description: "Reviews, tips, and gaming industry thoughts",
    url: "https://blog.gamingwithpro.com",
    thumbnail: "/images/pages/website.svg",
    active: false,
    clicks: 45,
    ctr: 5.3
  }
]

export const linkAnalyticsData: LinkAnalytics[] = [
  {
    id: "1",
    title: "Gaming Setup & Gear",
    clicks: 342,
    ctr: 18.7,
    revenue: "$127.50"
  },
  {
    id: "5",
    title: "Stream Highlights", 
    clicks: 278,
    ctr: 16.4
  },
  {
    id: "2", 
    title: "Support the Stream",
    clicks: 189,
    ctr: 14.2,
    revenue: "$89.25"
  },
  {
    id: "4",
    title: "Merchandise Store",
    clicks: 156,
    ctr: 11.8,
    revenue: "$234.80"
  },
  {
    id: "3",
    title: "Gaming Coaching",
    clicks: 94,
    ctr: 22.1,
    revenue: "$470.00"
  },
  {
    id: "6",
    title: "Gaming Blog",
    clicks: 45,
    ctr: 5.3
  }
]