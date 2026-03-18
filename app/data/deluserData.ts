export interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  profilePicture: string | null
  phone?: string
  company?: string
  website?: string
  bio?: string
  location?: string
  timezone?: string
  language?: string
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  createdAt: Date
  lastLoginAt: Date
  isAdmin: boolean
  plan: 'free' | 'pro' | 'business'
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'unpaid'
  subscriptionId?: string
  customerId?: string
  currentPeriodEnd?: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
}

export interface FeedPostData {
  id: string
  message: string
  createdAt: string
}

export interface DiscoverUserData {
  id: string
  name: string
  niche: string
  handle: string
  image: string
  posts: FeedPostData[]
}

export interface NotificationSettings {
  emailNotifications: {
    marketing: boolean
    security: boolean
    updates: boolean
    billing: boolean
    analytics: boolean
  }
  pushNotifications: {
    newLinks: boolean
    analytics: boolean
    security: boolean
  }
  smsNotifications: {
    security: boolean
    billing: boolean
  }
}

export interface BillingData {
  customerId: string
  subscriptionId?: string
  plan: 'free' | 'pro' | 'business'
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  paymentMethod?: {
    id: string
    brand: string
    last4: string
    expiryMonth: number
    expiryYear: number
  }
}

export interface ActivityLog {
  id: string
  action: string
  description: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  location?: string
}

export interface UsageStats {
  qrCodesCreated: number
  qrCodesScanned: number
  linksClicked: number
  profileViews: number
  monthlyViews: number
  storageUsed: number // in MB
  bandwidthUsed: number // in MB
}

export const discoverUsers: DiscoverUserData[] = [
  {
    id: 'c1',
    name: 'Ava Brooks',
    niche: 'Fashion',
    handle: '@avabrooks',
    image: 'https://i.pravatar.cc/200?img=5',
    posts: [
      {
        id: 'ava-brooks-post-1',
        message: 'Shot a clean spring campaign today. Soft denim, white tanks, and gold hoops still do the job every single time.',
        createdAt: '2025-03-16T09:15:00.000Z',
      },
      {
        id: 'ava-brooks-post-2',
        message: 'If your outfit needs saving, add one strong jacket and stop overthinking the rest.',
        createdAt: '2025-03-14T18:40:00.000Z',
      },
    ],
  },
  {
    id: 'c2',
    name: 'Jordan Lee',
    niche: 'Fitness',
    handle: '@jordanfit',
    image: 'https://i.pravatar.cc/200?img=13',
    posts: [
      {
        id: 'jordan-lee-post-1',
        message: 'Simple push day today: incline press, weighted dips, cable flys. Nothing fancy, just volume and consistency.',
        createdAt: '2025-03-16T07:05:00.000Z',
      },
      {
        id: 'jordan-lee-post-2',
        message: 'Protein target hit before 2pm. That usually decides whether the whole day stays on track.',
        createdAt: '2025-03-13T14:12:00.000Z',
      },
    ],
  },
  {
    id: 'c3',
    name: 'Sofia Kim',
    niche: 'Beauty',
    handle: '@sofiaskins',
    image: 'https://i.pravatar.cc/200?img=47',
    posts: [
      {
        id: 'sofia-kim-post-1',
        message: 'Trying a lighter skin tint this week instead of full coverage and my routine feels way less heavy on camera.',
        createdAt: '2025-03-15T16:30:00.000Z',
      },
      {
        id: 'sofia-kim-post-2',
        message: 'Best glow combo right now: hydrating toner, gel cream, then a tiny bit of balm on the high points.',
        createdAt: '2025-03-12T11:08:00.000Z',
      },
    ],
  },
  {
    id: 'c4',
    name: 'Marcus Hill',
    niche: 'Tech',
    handle: '@marcustech',
    image: 'https://i.pravatar.cc/200?img=18',
    posts: [
      {
        id: 'marcus-hill-post-1',
        message: 'Tested three compact creator mics back to back. The cheapest one was good enough, the middle one was the sweet spot.',
        createdAt: '2025-03-15T10:20:00.000Z',
      },
      {
        id: 'marcus-hill-post-2',
        message: 'Creators do not need a bigger setup first. Better framing and cleaner audio beat more gear almost every time.',
        createdAt: '2025-03-11T20:45:00.000Z',
      },
    ],
  },
  {
    id: 'c5',
    name: 'Emily Stone',
    niche: 'Lifestyle',
    handle: '@emilydaily',
    image: 'https://i.pravatar.cc/200?img=32',
    posts: [
      {
        id: 'emily-stone-post-1',
        message: 'Reset the apartment in 25 minutes, made pasta, lit a candle, and suddenly the week feels manageable again.',
        createdAt: '2025-03-14T21:10:00.000Z',
      },
      {
        id: 'emily-stone-post-2',
        message: 'Tiny habit that helps: leave tomorrow morning coffee gear out before bed and stop negotiating with yourself at 7am.',
        createdAt: '2025-03-10T08:55:00.000Z',
      },
    ],
  },
  {
    id: 'c6',
    name: 'Noah Park',
    niche: 'Travel',
    handle: '@parktravels',
    image: 'https://i.pravatar.cc/200?img=67',
    posts: [
      {
        id: 'noah-park-post-1',
        message: 'Sunrise train into Kyoto was worth waking up for. Quiet platform, cold air, no crowd, perfect start.',
        createdAt: '2025-03-13T05:50:00.000Z',
      },
      {
        id: 'noah-park-post-2',
        message: 'Travel rule: book the first night somewhere easy, not somewhere impressive. Energy matters more than aesthetics on arrival.',
        createdAt: '2025-03-09T13:25:00.000Z',
      },
    ],
  },
]

// Mock data for development
export const mockUserData: UserData = {
  id: 'user123',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  profilePicture: null,
  phone: '+1-555-0123',
  company: 'Tech Startup Inc.',
  website: 'https://johndoe.com',
  bio: 'Full-stack developer and tech enthusiast',
  location: 'San Francisco, CA',
  timezone: 'America/Los_Angeles',
  language: 'en',
  emailVerified: true,
  phoneVerified: false,
  twoFactorEnabled: false,
  createdAt: new Date('2024-01-15'),
  lastLoginAt: new Date('2024-12-20'),
  isAdmin: false,
  plan: 'pro',
  subscriptionStatus: 'active',
  subscriptionId: 'sub_1234567890',
  customerId: 'cus_1234567890',
  currentPeriodEnd: new Date('2025-01-15'),
  cancelAtPeriodEnd: false,
  trialEnd: undefined,
}

export const mockNotificationSettings: NotificationSettings = {
  emailNotifications: {
    marketing: true,
    security: true,
    updates: true,
    billing: true,
    analytics: false,
  },
  pushNotifications: {
    newLinks: true,
    analytics: false,
    security: true,
  },
  smsNotifications: {
    security: true,
    billing: false,
  },
}

export const mockBillingData: BillingData = {
  customerId: 'cus_1234567890',
  subscriptionId: 'sub_1234567890',
  plan: 'pro',
  status: 'active',
  currentPeriodStart: new Date('2024-12-15'),
  currentPeriodEnd: new Date('2025-01-15'),
  cancelAtPeriodEnd: false,
  paymentMethod: {
    id: 'pm_1234567890',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2027,
  },
}

export const mockActivityLog: ActivityLog[] = [
  {
    id: '1',
    action: 'login',
    description: 'Signed in to account',
    timestamp: new Date('2024-12-20T10:30:00'),
    ipAddress: '192.168.1.1',
    location: 'San Francisco, CA',
  },
  {
    id: '2',
    action: 'profile_update',
    description: 'Updated profile information',
    timestamp: new Date('2024-12-19T15:45:00'),
    ipAddress: '192.168.1.1',
    location: 'San Francisco, CA',
  },
  {
    id: '3',
    action: 'qr_created',
    description: 'Created new QR code for website',
    timestamp: new Date('2024-12-18T09:15:00'),
    ipAddress: '192.168.1.1',
    location: 'San Francisco, CA',
  },
  {
    id: '4',
    action: 'password_change',
    description: 'Changed account password',
    timestamp: new Date('2024-12-17T14:20:00'),
    ipAddress: '192.168.1.1',
    location: 'San Francisco, CA',
  },
  {
    id: '5',
    action: 'subscription_update',
    description: 'Upgraded to Pro plan',
    timestamp: new Date('2024-12-15T11:00:00'),
    ipAddress: '192.168.1.1',
    location: 'San Francisco, CA',
  },
]

export const mockUsageStats: UsageStats = {
  qrCodesCreated: 47,
  qrCodesScanned: 1250,
  linksClicked: 892,
  profileViews: 3450,
  monthlyViews: 450,
  storageUsed: 25.6,
  bandwidthUsed: 1250.8,
}
